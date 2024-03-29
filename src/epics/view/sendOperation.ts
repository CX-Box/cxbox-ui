/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Observable } from 'rxjs'
import { matchOperationRole } from '../../utils/operations'
import { OperationErrorEntity, OperationError } from '../../interfaces/operation'
import { Store } from 'redux'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { buildBcUrl } from '../../utils/strings'
import { postOperationRoutine } from '../../epics/view'
import { AxiosError } from 'axios'
import { customAction } from '../../api/api'
import { getFilters, getSorters } from '../../utils/filters'

/**
 * Handle any `sendOperation` action which is not part of built-in operations types
 *
 * Request will be send to `custom-action/${screenName}/${bcUrl}?_action=${action.payload.type}` endpoint,
 * with pending changes of the widget as requst body.
 *
 * Fires sendOperationSuccess, bcForceUpdate and postOperationRoutine
 *
 * @param action$ Payload includes operation type and widget that initiated operation
 * @param store
 */
export const sendOperation: Epic = (action$, store) =>
    action$
        .ofType(types.sendOperation)
        .filter(action => matchOperationRole('none', action.payload, store.getState()))
        .mergeMap(action => {
            return sendOperationEpicImpl(action, store)
        })

/**
 * Default implementation of `sendOperation` handler
 *
 * @param action
 * @param store
 * @category Epics
 */
export function sendOperationEpicImpl(action: ActionsMap['sendOperation'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    const state = store.getState()
    const screenName = state.screen.screenName
    const { bcName, operationType, widgetName } = action.payload
    // TODO: Remove conformOperation n 2.0.0
    const confirm = action.payload.confirmOperation?.type || action.payload.confirm
    const bcUrl = buildBcUrl(bcName, true)
    const bc = state.screen.bo.bc[bcName]
    const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
    const fields = rowMeta?.fields
    const cursor = bc.cursor
    const record = state.data[bcName]?.find(item => item.id === bc.cursor)
    const filters = state.screen.filters[bcName]
    const sorters = state.screen.sorters[bcName]
    const pendingRecordChange = state.view.pendingDataChanges[bcName]?.[bc.cursor]
    for (const key in pendingRecordChange) {
        if (fields.find(item => item.key === key && item.disabled)) {
            delete pendingRecordChange[key]
        }
    }
    const data = record && { ...pendingRecordChange, vstamp: record.vstamp }
    const defaultSaveOperation =
        state.view.widgets?.find(item => item.name === widgetName)?.options?.actionGroups?.defaultSave === action.payload.operationType &&
        action.payload?.onSuccessAction?.type === types.changeLocation
    const params: Record<string, string> = {
        _action: operationType,
        ...getFilters(filters),
        ...getSorters(sorters)
    }
    if (confirm) {
        params._confirm = confirm
    }
    const context = { widgetName: action.payload.widgetName }
    return customAction(screenName, bcUrl, data, context, params)
        .mergeMap(response => {
            const postInvoke = response.postActions[0]
            const dataItem = response.record
            // TODO: Remove in 2.0.0 in favor of postInvokeConfirm (is this todo needed?)
            const preInvoke = response.preInvoke
            // defaultSaveOperation mean that executed custom autosave and postAction will be ignored
            // drop pendingChanges and onSuccessAction execute instead
            return defaultSaveOperation
                ? action?.payload?.onSuccessAction
                    ? Observable.concat(
                          Observable.of($do.bcCancelPendingChanges({ bcNames: [bcName] })),
                          Observable.of(action.payload.onSuccessAction)
                      )
                    : Observable.empty<never>()
                : Observable.concat(
                      Observable.of($do.sendOperationSuccess({ bcName, cursor, dataItem })),
                      Observable.of($do.bcForceUpdate({ bcName })),
                      ...postOperationRoutine(widgetName, postInvoke, preInvoke, operationType, bcName)
                  )
        })
        .catch((e: AxiosError) => {
            console.error(e)
            let viewError: string = null
            let entityError: OperationErrorEntity = null
            const operationError = e.response?.data as OperationError
            if (e.response?.data === Object(e.response?.data)) {
                entityError = operationError?.error?.entity
                viewError = operationError?.error?.popup?.[0]
            }
            return Observable.of($do.sendOperationFail({ bcName, bcUrl, viewError, entityError }))
        })
}
