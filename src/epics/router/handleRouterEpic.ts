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

import { catchError, EMPTY, filter, mergeMap, switchMap } from 'rxjs'
import { CXBoxEpic } from '../../interfaces'
import { handleRouter } from '../../actions'

export const handleRouterEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(handleRouter.match),
        switchMap(action => {
            /**
             * Default implementation for `handleRouter` epic.
             *
             * If server routing is used, this epic will send a requst to Cxbox API router endpoint.
             * It writes a console error if request fails.
             *
             * @returns Default implementation does not throw any additional actions
             */
            const path = action.payload.path
            const params = action.payload.params
            // todo: Handle errors
            return api.routerRequest(path, params).pipe(
                mergeMap(() => {
                    return EMPTY
                }),
                catchError(error => {
                    console.error(error)
                    return EMPTY
                })
            )
        })
    )
