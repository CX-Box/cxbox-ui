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

import { parseBcCursors } from '../../utils'
import { CXBoxEpic } from '../../interfaces'
import { bcChangeCursors } from '../../actions'
import { EMPTY, filter, mergeMap, of } from 'rxjs'

/**
 * Clears descendant business components pending changes on cursor change
 *
 * TODO: Review required as it might be no longer valid due to autosave middleware implementation
 */
export const clearPendingDataChangesAfterCursorChangeEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(bcChangeCursors.match),
        mergeMap(action => {
            const state = state$.value

            /*
             *  Если при загрузке view курсор проставился не во всех бк
             * то дописать недостающие курсоры
             */
            const nextCursors = parseBcCursors(state.router.bcPath) || {}
            const cursorsDiffMap: Record<string, string> = {}
            Object.entries(nextCursors).forEach(entry => {
                const [bcName, cursor] = entry
                const bc = state.screen.bo.bc[bcName]
                if (!bc || bc?.cursor !== cursor) {
                    cursorsDiffMap[bcName] = cursor
                }
            })
            if (Object.keys(cursorsDiffMap).length) {
                return of(bcChangeCursors({ cursorsMap: cursorsDiffMap }))
            }

            return EMPTY
        })
    )
