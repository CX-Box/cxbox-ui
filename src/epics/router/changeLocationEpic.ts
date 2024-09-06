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

import { RouteType } from '../../interfaces'
import { parseBcCursors } from '../../utils'
import { CXBoxEpic } from '../../interfaces'
import { concat, EMPTY, filter, mergeMap, Observable, of } from 'rxjs'
import {
    bcChangeCursors,
    bcForceUpdate,
    changeLocation,
    handleRouter,
    selectScreen,
    selectScreenFail,
    selectView,
    selectViewFail
} from '../../actions'
import { AnyAction } from '@reduxjs/toolkit'

/**
 * Epic of changing the current route
 *
 * Checks route parameters (screen, view, BC cursors) relative to those
 * that are currently stored in the store, and in case of a mismatch
 * initiates reloading the screen, view or BC with new cursors.
 *
 */
export const changeLocationEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(changeLocation.match),
        mergeMap(action => {
            const state = state$.value

            // User not logged
            if (!state.session.active) {
                return EMPTY
            }

            if (state.router.type === RouteType.router) {
                return of(handleRouter(state.router))
            }

            // Reload screen if nextScreen and currentScreen not equal
            // With the default route type use the first default screen, if not exist then first screen
            const currentScreenName = state.screen.screenName
            const defaultScreenName = state.session.screens.find(screen => screen.defaultScreen)?.name || state.session.screens[0]?.name
            const nextScreenName = state.router.type === RouteType.default ? defaultScreenName : state.router.screenName

            if (nextScreenName !== currentScreenName || action.payload.forceUpdate) {
                const nextScreen = state.session.screens.find(item => item.name === nextScreenName)
                return nextScreen ? of(selectScreen({ screen: nextScreen })) : of(selectScreenFail({ screenName: nextScreenName }))
            }
            // Check cursor different between store and url
            const currentViewName = state.view.name
            const nextViewName = state.router.viewName
            const nextCursors = parseBcCursors(state.router.bcPath) || {}
            const cursorsDiffMap: Record<string, string> = {}
            Object.entries(nextCursors).forEach(entry => {
                const [bcName, cursor] = entry
                const bc = state.screen.bo.bc[bcName]
                if (!bc || bc?.cursor !== cursor) {
                    cursorsDiffMap[bcName] = cursor
                }
            })
            const needUpdateCursors = Object.keys(cursorsDiffMap).length
            const needUpdateViews = nextViewName !== currentViewName
            const resultObservables: Array<Observable<AnyAction>> = []
            // if cursors have difference, then put new cursors and mark BC as "dirty"
            if (needUpdateCursors) {
                resultObservables.push(of(bcChangeCursors({ cursorsMap: cursorsDiffMap })))
            }
            // reload view if not equ
            if (needUpdateViews) {
                const nextView = nextViewName
                    ? state.screen.views.find(item => item.name === nextViewName)
                    : state.screen.primaryView
                    ? state.screen.views.find(item => item.name === state.screen.primaryView)
                    : state.screen.views[0]
                resultObservables.push(
                    nextView ? of(selectView({ ...nextView, isTab: action.payload.isTab })) : of(selectViewFail({ viewName: nextViewName }))
                )
            }
            // If CURSOR has been updated but VIEW has`t changed, need update DATA
            if (needUpdateCursors && !needUpdateViews) {
                Object.entries(nextCursors).forEach(entry => {
                    const [bcName, cursor] = entry
                    if (!state.data[bcName].find(item => item.id === cursor)) {
                        resultObservables.push(of(bcForceUpdate({ bcName })))
                    }
                })
            }
            // The order is important (cursors are placed first, then the view is reloaded)
            return concat(...resultObservables)
        })
    )
