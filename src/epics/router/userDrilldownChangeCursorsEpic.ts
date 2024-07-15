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
import { filter, map } from 'rxjs'
import { bcChangeCursors, emptyAction, userDrillDown } from '../../actions'

export const userDrillDownChangeCursorsEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(userDrillDown.match),
        map(action => {
            const state = state$.value
            const widget = state.view.widgets.find(item => item.name === action.payload.widgetName)
            const cursor = state.screen.bo.bc[widget?.bcName]?.cursor

            if (cursor !== action.payload.cursor) {
                return bcChangeCursors({ cursorsMap: { [action.payload.bcName]: action.payload.cursor } })
            }

            return emptyAction
        })
    )
