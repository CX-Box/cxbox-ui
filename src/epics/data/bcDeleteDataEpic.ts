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

import { CXBoxEpic, PendingValidationFailsFormat } from '../../interfaces'
import { catchError, concat, EMPTY, filter, mergeMap, of } from 'rxjs'
import {
    bcCancelPendingChanges,
    bcDeleteDataFail,
    bcFetchDataRequest,
    processPostInvoke,
    sendOperation,
    setOperationFinished
} from '../../actions'
import { buildBcUrl, matchOperationRole } from '../../utils'
import { OperationTypeCrud } from '@cxbox-ui/schema'
import { createApiErrorObservable } from '../../utils/apiError'

export const bcDeleteDataEpic: CXBoxEpic = (action$, store$, { api }) =>
    action$.pipe(
        filter(sendOperation.match),
        filter(action => matchOperationRole(OperationTypeCrud.delete, action.payload, store$.value)),
        mergeMap(action => {
            const widgetName = action.payload.widgetName
            const state = store$.value
            const bcName = action.payload.bcName
            const cursor = state.screen.bo.bc[bcName].cursor
            const bcUrl = buildBcUrl(bcName, true, state)
            const context = { widgetName: action.payload.widgetName }
            const isTargetFormatPVF = state.view.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            return api.deleteBcData(state.screen.screenName, bcUrl, context).pipe(
                mergeMap(data => {
                    const postInvoke = data.postActions?.[0]
                    return concat(
                        of(setOperationFinished({ bcName, operationType: OperationTypeCrud.delete })),
                        isTargetFormatPVF ? of(bcCancelPendingChanges({ bcNames: [bcName] })) : EMPTY,
                        of(bcFetchDataRequest({ bcName, widgetName })),
                        postInvoke ? of(processPostInvoke({ bcName, postInvoke, cursor, widgetName })) : EMPTY
                    )
                }),
                catchError((error: any) => {
                    console.error(error)
                    return concat(
                        of(setOperationFinished({ bcName, operationType: OperationTypeCrud.delete })),
                        of(bcDeleteDataFail({ bcName })),
                        createApiErrorObservable(error, context)
                    )
                })
            )
        })
    )
