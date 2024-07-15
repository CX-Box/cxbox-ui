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

import { ApplicationErrorType, BusinessError, CXBoxEpic, OperationError } from '../../interfaces'
import { concat, EMPTY, filter, mergeMap, Observable, of } from 'rxjs'
import { httpError, processPostInvoke, showViewError } from '../../actions'
import { AnyAction } from '@reduxjs/toolkit'

export const httpError418Epic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(httpError.match),
        filter(action => action.payload.statusCode === 418),
        mergeMap(action => {
            const { error, callContext } = action.payload
            const result: Array<Observable<AnyAction>> = []
            const typedError = error.response?.data as OperationError
            if (!typedError.error.popup) {
                return EMPTY
            }
            const businessError: BusinessError = {
                type: ApplicationErrorType.BusinessError,
                message: typedError.error.popup[0]
            }
            result.push(of(showViewError({ error: businessError })))
            if (typedError.error.postActions?.[0]) {
                const widget = state$.value.view.widgets.find(item => item.name === callContext.widgetName)
                const bcName = widget?.bcName
                result.push(
                    of(
                        processPostInvoke({
                            bcName,
                            postInvoke: typedError.error.postActions[0],
                            widgetName: widget?.name
                        })
                    )
                )
            }
            return concat(...result)
        })
    )
