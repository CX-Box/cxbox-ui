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

import axios from 'axios'
import { ApplicationErrorType, CXBoxEpic } from '../../interfaces'
import { EMPTY, filter, mergeMap, of } from 'rxjs'
import { apiError, httpError, showViewError } from '../../actions'

export const apiErrorEpic: CXBoxEpic = action$ =>
    action$.pipe(
        filter(apiError.match),
        mergeMap(action => {
            const { error, callContext } = action.payload
            if (error.response) {
                return of(
                    httpError({
                        statusCode: error.response.status,
                        error,
                        callContext
                    })
                )
            } else if (!axios.isCancel(error)) {
                return of(
                    showViewError({
                        error: {
                            type: ApplicationErrorType.NetworkError
                        }
                    })
                )
            }
            return EMPTY
        })
    )
