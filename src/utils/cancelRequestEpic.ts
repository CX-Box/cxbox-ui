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

import { ActionPayloadTypes, ActionsObservable, AnyAction, types } from '../actions/actions'
import { Observable } from 'rxjs'

/**
 * Default list of action types which are triggers for request cancel
 */
export const cancelRequestActionTypes = [types.selectView, types.logout]

/**
 * Creator of request cancel epic
 *
 * @param action$ an observable input
 * @param actionTypes list of action types which triggers cancel
 * @param cancelFn a callback of request cancelation
 * @param cancelActionCreator an action creator which called by request cancelation
 * @param filterFn a callback function which filters come actions
 */
export function cancelRequestEpic(
    action$: ActionsObservable<AnyAction>,
    actionTypes: Array<keyof ActionPayloadTypes>,
    cancelFn: () => void,
    cancelActionCreator: AnyAction,
    filterFn: (actions: AnyAction) => boolean = item => {
        return true
    }
) {
    return action$
        .ofType(...actionTypes)
        .filter(filterFn)
        .mergeMap(() => {
            cancelFn()
            return Observable.of(cancelActionCreator)
        })
        .take(1)
}
