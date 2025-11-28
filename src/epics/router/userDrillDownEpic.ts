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

import { catchError, filter, mergeMap, switchMap } from 'rxjs'
import { buildBcUrl } from '../../utils'
import { createApiErrorObservable } from '../../utils/apiError'
import processUserDrillDown from '../utils/processUserDrillDown'
import { userDrillDown } from '../../actions'
import { CXBoxEpic, DrillDownType } from '../../interfaces'

/**
 *
 * @category Epics
 */

export const userDrillDownEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(userDrillDown.match),
        switchMap(action => {
            /**
             * Default implementation for `userDrillDown` epic.
             *
             * Sends a request to fetch row meta; will write a console error if request fails.
             * Otherwise, a chain of actions will be dispatched:
             *
             * - {@link bcFetchRowMetaSuccess} for drilldowns not of {@link DrillDownType.inner} type
             * - {@link userDrillDownSuccess}
             * - {@link drillDown}
             *
             * Drilldown url is taken from {@link WidgetFieldBase.drillDown | WidgetField.drillDown} property in widget meta configuration or from record
             * directly if record's property specified in {@link WidgetFieldBase.drillDownKey | WidgetField.drillDownKey}
             *
             * @param action This epic will fire on {@link ActionPayloadTypes.userDrillDown | userDrillDown} action
             * @param store Redux store instance
             * @category Epics
             */

            const state = state$.value
            const { bcName, fieldKey, cursor } = action.payload
            const bcUrl = buildBcUrl(bcName, true, state)
            const existingRowMeta = state$.value.view.rowMeta[bcName]?.[bcUrl]

            if (existingRowMeta) {
                return processUserDrillDown(state, existingRowMeta, fieldKey, cursor, bcName, bcUrl)
            }

            return api.fetchRowMeta(state.screen.screenName, bcUrl).pipe(
                mergeMap(rowMeta => processUserDrillDown(state, rowMeta, fieldKey, cursor, bcName, bcUrl, true)),
                catchError(error => {
                    console.error(error)
                    return createApiErrorObservable(error) // TODO:
                })
            )
        })
    )
