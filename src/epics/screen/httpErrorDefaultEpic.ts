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

import { ApplicationErrorType, CXBoxEpic } from '../../interfaces'
import { filter, map } from 'rxjs'
import { httpError, showViewError } from '../../actions'
import { knownHttpErrors } from './apiErrorEpic'

export const httpErrorDefaultEpic: CXBoxEpic = (action$, store) =>
    action$.pipe(
        filter(httpError.match),
        filter(action => !knownHttpErrors.includes(action.payload.statusCode)),
        map(action => {
            const businessError = {
                type: ApplicationErrorType.BusinessError,
                code: action.payload.error.response.status,
                details: action.payload.error.response.data
            }
            return showViewError({ error: businessError })
        })
    )
