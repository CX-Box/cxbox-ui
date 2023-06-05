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

import { RouteType, CXBoxEpic } from '../../interfaces'
import { filter, of, switchMap } from 'rxjs'
import { handleRouter, loginDone, selectScreen, selectScreenFail } from '../../actions'

/**
 * Fires `selectScreen` or `selectScreenFail` to set requested in url screen as active
 * after succesful login.
 *
 * For server-side router fires `handleRouter` instead.
 *
 */
export const loginDoneEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(loginDone.match),
        switchMap(action => {
            const state = state$.value

            if (state.router.type === RouteType.router) {
                return of(handleRouter(state.router))
            }

            const nextScreenName = state.router.screenName
            const nextScreen =
                state.session.screens.find(item => (nextScreenName ? item.name === nextScreenName : item.defaultScreen)) ||
                state.session.screens[0]
            return nextScreen ? of(selectScreen({ screen: nextScreen })) : of(selectScreenFail({ screenName: nextScreenName }))
        })
    )
