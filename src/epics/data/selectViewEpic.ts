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

import { CXBoxEpic, PopupWidgetTypes, Store, WidgetMeta } from '../../interfaces'
import { EMPTY, filter, mergeMap } from 'rxjs'
import { bcFetchDataRequest, selectView } from '../../actions'

/**
 * Schedules dataEpics.ts fetch for every widget on the view
 *
 * After selecting a view, this epic schedules a dataEpics.ts fetch for every widget present on the view.
 * If business componenet for the widget has a parent, then root ancestor BC is scheduled for dataEpics.ts fetch instead
 * and dataEpics.ts for its descendants will be scheduled after ancestor dataEpics.ts fetch resolved.
 *
 * @see {@link src/epics/dataEpics.ts/bcFetchDataEpic.ts} for details how descendants resolved
 */
export const selectViewEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(selectView.match),
        mergeMap(action => {
            /**
             * Default implementation for `selectView` epic.
             *
             * Schedules dataEpics.ts fetch for every widget on the view
             *
             * After selecting a view, this epic schedules a dataEpics.ts fetch for every widget present on the view.
             * If business componenet for the widget has a parent, then root ancestor BC is scheduled for dataEpics.ts fetch instead
             * and dataEpics.ts for its descendants will be scheduled after ancestor dataEpics.ts fetch resolved.
             *
             * @see {@link src/epics/dataEpics.ts/bcFetchDataEpic.ts} for details how descendants resolved
             */
            try {
                const state = state$.value
                if (action.payload.isTab) {
                    return lazyLoad(state)
                }

                return fullLoad(state)
            } catch (e) {
                console.error(`selectView Epic:: ${e}`)
                return EMPTY
            }
        })
    )

function fullLoad<S extends Store>(state: S) {
    const bcToLoad: Record<string, WidgetMeta> = {}

    state.view.widgets
        .filter(widget => !PopupWidgetTypes.includes(widget.type))
        .forEach(widget => {
            if (widget.bcName) {
                let bcName = widget.bcName
                let parentName = state.screen.bo.bc[widget.bcName].parentName
                while (parentName) {
                    bcName = parentName
                    parentName = state.screen.bo.bc[parentName].parentName
                }

                if (!bcToLoad[bcName]) {
                    bcToLoad[bcName] = widget
                }
            }
        })

    return Object.entries(bcToLoad).map(([bcName, widget]) => {
        // TODO: Row meta request should be scheduled after `bcFetchDataSuccess` here
        // (now it is scheduled in bcFetchDataRequest epic)
        return bcFetchDataRequest({ widgetName: widget.name, bcName })
    })
}

/**
 * Here is a list of bc that require downloading.
 * Either bc that have no data are loaded, or the cursor has been reset.
 * It is assumed that the cursor for a non-displayed bookmaker will be reset if the parent cursor has changed.
 */
function lazyLoad<S extends Store>(state: S) {
    const bcToLoad: Record<string, WidgetMeta> = {}
    const data = state.data

    state.view.widgets
        .filter(widget => !PopupWidgetTypes.includes(widget.type))
        .forEach(widget => {
            if (widget.bcName && (!(widget.bcName in data) || state.screen.bo.bc[widget.bcName]?.cursor === null)) {
                let bcName = widget.bcName
                let parentName = state.screen.bo.bc[widget.bcName].parentName
                while (parentName && (!(parentName in data) || state.screen.bo.bc[parentName]?.cursor === null)) {
                    bcName = parentName
                    parentName = state.screen.bo.bc[parentName].parentName
                }

                if (!bcToLoad[bcName]) {
                    bcToLoad[bcName] = widget
                }
            }
        })

    return Object.entries(bcToLoad).map(([bcName, widget]) => {
        // TODO: Row meta request should be scheduled after `bcFetchDataSuccess` here
        // (now it is scheduled in bcFetchDataRequest epic)
        return bcFetchDataRequest({ widgetName: widget.name, bcName })
    })
}
