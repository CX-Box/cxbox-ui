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

import { CXBoxEpic, OperationError, OperationErrorEntity, OperationPostInvokeRefreshBc, OperationPostInvokeType } from '../../interfaces'
import {
    bcCancelPendingChanges,
    bcForceUpdate,
    changeLocation,
    sendOperation,
    sendOperationFail,
    sendOperationSuccess
} from '../../actions'
import { catchError, concat, EMPTY, filter, mergeMap, of } from 'rxjs'
import { buildBcUrl, getFilters, getSorters, matchOperationRole } from '../../utils'
import { AxiosError } from 'axios'

import { postOperationRoutine } from '../utils/postOperationRoutine'
import { createApiErrorObservable } from '../../utils/apiError'

/**
 * Handle any `sendOperationEpic` action which is not part of built-in operations types
 *
 * Request will be send to `custom-action/${screenName}/${bcUrl}?_action=${action.payload.type}` endpoint,
 * with pending changes of the widget as requst body.
 *
 * Fires sendOperationSuccess, bcForceUpdate and postOperationRoutine
 */
export const sendOperationEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(sendOperation.match),
        filter(action => matchOperationRole('none', action.payload, state$.value)),
        mergeMap(action => {
            const state = state$.value
            const screenName = state.screen.screenName
            const { bcName, operationType, widgetName } = action.payload
            // TODO: Remove conformOperation n 2.0.0
            const confirm = action.payload.confirmOperation?.type || action.payload.confirm
            const bcUrl = buildBcUrl(bcName, true, state)
            const bc = state.screen.bo.bc[bcName]
            const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
            const fields = rowMeta?.fields
            const cursor = bc.cursor
            const record = state.data[bcName]?.find(item => item.id === bc.cursor)
            const filters = state.screen.filters[bcName]
            const sorters = state.screen.sorters[bcName]
            const pendingRecordChange = { ...state.view.pendingDataChanges[bcName]?.[bc.cursor] }
            for (const key in pendingRecordChange) {
                if (fields.find(item => item.key === key && item.disabled)) {
                    delete pendingRecordChange[key]
                }
            }
            const data = record && { ...pendingRecordChange, vstamp: record.vstamp }
            const defaultSaveOperation =
                state.view.widgets?.find(item => item.name === widgetName)?.options?.actionGroups?.defaultSave ===
                    action.payload.operationType && changeLocation.match(action.payload?.onSuccessAction?.type)
            const params: Record<string, string> = {
                _action: operationType,
                ...getFilters(filters),
                ...getSorters(sorters)
            }
            if (confirm) {
                params._confirm = confirm
            }
            const context = { widgetName: action.payload.widgetName }
            return api.customAction(screenName, bcUrl, data, context, params).pipe(
                mergeMap(response => {
                    const postInvoke = response.postActions?.[0]
                    const dataItem = response.record
                    // TODO: Remove in 2.0.0 in favor of postInvokeConfirm (is this todo needed?)
                    const preInvoke = response.preInvoke
                    const postInvokeType = postInvoke?.type || ''
                    const postInvokeRefreshCurrentBc =
                        OperationPostInvokeType.refreshBC === postInvokeType && (postInvoke as OperationPostInvokeRefreshBc)?.bc === bcName
                    const postInvokeTypesWithRefreshBc = (
                        [OperationPostInvokeType.waitUntil, OperationPostInvokeType.drillDownAndWaitUntil] as string[]
                    ).includes(postInvokeType)
                    const withoutBcForceUpdate = postInvokeRefreshCurrentBc || postInvokeTypesWithRefreshBc

                    // defaultSaveOperation mean that executed custom autosave and postAction will be ignored
                    // drop pendingChanges and onSuccessAction execute instead
                    return defaultSaveOperation
                        ? action?.payload?.onSuccessAction
                            ? concat(of(bcCancelPendingChanges({ bcNames: [bcName] })), of(action.payload.onSuccessAction))
                            : EMPTY
                        : concat(
                              of(sendOperationSuccess({ bcName, cursor, dataItem })),
                              withoutBcForceUpdate ? EMPTY : of(bcForceUpdate({ bcName })),
                              ...postOperationRoutine(widgetName, postInvoke, preInvoke, operationType, bcName)
                          )
                }),
                catchError((e: AxiosError) => {
                    console.error(e)
                    let viewError: string = null
                    let entityError: OperationErrorEntity = null
                    const operationError = e.response?.data as OperationError
                    if (e.response?.data === Object(e.response?.data)) {
                        entityError = operationError?.error?.entity
                        viewError = operationError?.error?.popup?.[0]
                    }
                    return concat(of(sendOperationFail({ bcName, bcUrl, viewError, entityError })), createApiErrorObservable(e, context))
                })
            )
        })
    )
