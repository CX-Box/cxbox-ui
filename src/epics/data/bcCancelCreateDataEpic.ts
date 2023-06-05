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

import { catchError, concat, EMPTY, filter, mergeMap, of } from 'rxjs'
import { buildBcUrl, matchOperationRole } from '../../utils'
import { OperationTypeCrud } from '@cxbox-ui/schema'
import { bcChangeCursors, bcDeleteDataFail, processPostInvoke, sendOperation, sendOperationSuccess } from '../../actions'
import { CXBoxEpic } from '../../interfaces'
import { isAnyOf } from '@reduxjs/toolkit'
import { createApiErrorObservable } from '../../utils/apiError'

const actionTypesMatcher = isAnyOf(sendOperation)

/**
 * Sends `cancel-create` custom operation with record's pending changes and vstamp;
 * Dispatches `sendOperationSuccess` and `bcChangeCursors` to drop cursors, also
 * `processPostInvokeEpic` if received `postActions` in response.
 *
 * @category Epics
 */

export const bcCancelCreateDataEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actionTypesMatcher),
        filter(action => matchOperationRole(OperationTypeCrud.cancelCreate, action.payload, state$.value)),
        mergeMap(action => {
            /**
             * Default implementation for `bcCancelCreateDataEpic` epic
             *
             * Sends `cancel-create` custom operation with record's pending changes and vstamp;
             * Dispatches `sendOperationSuccess` and `bcChangeCursors` to drop cursors, also
             * `processPostInvokeEpic` if received `postActions` in response.
             *
             * On error dispatches `bcDeleteDataFail`.
             */
            const state = state$.value
            const screenName = state.screen.screenName
            const bcName = action.payload.bcName
            const bcUrl = buildBcUrl(bcName, true, state)
            const bc = state.screen.bo.bc[bcName]
            const cursor = bc?.cursor
            const context = { widgetName: action.payload.widgetName }
            const record = state.data[bcName]?.find(item => item.id === bc.cursor)
            const pendingRecordChange = state.view.pendingDataChanges[bcName]?.[bc.cursor as string]
            const data = record && { ...pendingRecordChange, vstamp: record.vstamp }
            const params = { _action: action.payload.operationType }
            const cursorsMap: Record<string, string> = { [action.payload.bcName]: null }
            return api.customAction(screenName, bcUrl as string, data, context, params).pipe(
                mergeMap(response => {
                    const postInvoke = response.postActions?.[0]
                    return concat(
                        of(sendOperationSuccess({ bcName, cursor })),
                        of(bcChangeCursors({ cursorsMap })),
                        postInvoke ? of(processPostInvoke({ bcName, postInvoke, cursor, widgetName: context.widgetName })) : EMPTY
                    )
                }),
                catchError((error: any) => {
                    console.error(error)
                    return concat(of(bcDeleteDataFail({ bcName })), createApiErrorObservable(error, context))
                })
            )
        })
    )
