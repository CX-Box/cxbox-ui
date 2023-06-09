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
import { Store } from 'redux'
import { Epic, types, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { routerRequest } from '../../api/api'

export const handleRouter: Epic = (action$, store) =>
    action$.ofType(types.handleRouter).switchMap(action => {
        return handleRouterImpl(action, store)
    })

/**
 * Default implementation for `handleRouter` epic.
 *
 * If server routing is used, this epic will send a requst to Cxbox API router endpoint.
 * It writes a console error if request fails.
 *
 * @param action This epic will fire on {@link ActionPayloadTypes.handleRouter | handleRouter} action
 * @param store Redux store instance
 * @returns Default implementation does not throw any additional actions
 * @category Epics
 */
export function handleRouterImpl(action: ActionsMap['handleRouter'], store: Store<CoreStore>): Observable<never> {
    const path = action.payload.path
    const params = action.payload.params
    // todo: Handle errors
    return routerRequest(path, params)
        .mergeMap(data => {
            return Observable.empty<never>()
        })
        .catch(error => {
            console.error(error)
            return Observable.empty()
        })
}
