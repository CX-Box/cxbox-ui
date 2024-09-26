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

import { CXBoxEpic } from '../../interfaces'
import { filter, of, switchMap } from 'rxjs'
import { selectScreen, selectView, selectViewFail } from '../../actions'
import { getDefaultViewForPrimary } from '../../utils/getDefaultViewForPrimary'
import { getDefaultViewFromPrimaries } from '../../utils/getDefaultViewFromPrimaries'

/**
 *
 * TODO: Rename to `selectScreen` in 2.0.0
 *
 */
export const changeScreen: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(selectScreen.match),
        switchMap(action => {
            const state = state$.value
            const nextViewName = state.router.viewName
            const requestedView = state.screen.views.find(item => item.name === nextViewName)
            const defaultView = !nextViewName
                ? getDefaultViewForPrimary(state.screen.primaryView, state.screen.views) ??
                  getDefaultViewFromPrimaries(state.screen.primaryViews, state.screen.views)
                : null
            const nextView = requestedView || defaultView || state.screen.views[0]
            return nextView ? of(selectView(nextView)) : of(selectViewFail({ viewName: nextViewName }))
        })
    )
