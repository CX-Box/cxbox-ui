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

import { CXBoxEpic, OperationPostInvokeConfirmType, OperationPreInvokeType } from '../../interfaces'
import { EMPTY, filter, mergeMap, of } from 'rxjs'
import { operationConfirmation, processPostInvokeConfirm, processPreInvoke } from '../../actions'
import { isAnyOf } from '@reduxjs/toolkit'

export const processPostInvokeConfirmEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(isAnyOf(processPostInvokeConfirm, processPreInvoke)),
        mergeMap(action => {
            const { bcName, operationType, widgetName } = action.payload
            const confirm = processPostInvokeConfirm.match(action) ? action.payload.postInvokeConfirm : action.payload.preInvoke
            switch (confirm.type) {
                case OperationPostInvokeConfirmType.confirm:
                case OperationPreInvokeType.info:
                case OperationPreInvokeType.error:
                case OperationPostInvokeConfirmType.confirmText: {
                    return of(
                        operationConfirmation({
                            operation: {
                                bcName,
                                operationType,
                                widgetName
                            },
                            confirmOperation: confirm
                        })
                    )
                }
                default:
                    return EMPTY
            }
        })
    )
