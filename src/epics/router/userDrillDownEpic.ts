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

import { buildBcUrl } from '../../utils'
import { CXBoxEpic, DrillDownType, WidgetFieldBase } from '../../interfaces'
import { catchError, concat, EMPTY, filter, mergeMap, of, switchMap } from 'rxjs'
import { bcFetchRowMetaSuccess, drillDown, userDrillDown, userDrillDownSuccess } from '../../actions'

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
            const bcUrl = buildBcUrl(bcName, true)
            return api.fetchRowMeta(state.screen.screenName, bcUrl).pipe(
                mergeMap(rowMeta => {
                    const drillDownField = rowMeta.fields.find(field => field.key === fieldKey)
                    const route = state.router
                    const drillDownKey = (
                        state.view.widgets
                            .find(widget => widget.bcName === bcName)
                            ?.fields.find((field: WidgetFieldBase) => field.key === fieldKey) as WidgetFieldBase
                    )?.drillDownKey
                    const customDrillDownUrl = state.data[bcName]?.find(record => record.id === cursor)?.[drillDownKey] as string
                    /**
                     * It seems that behavior is wrong here; matching route condition will probably never be hit
                     *
                     * TODO: Review this case and either make condition strict or remove it completely
                     */
                    return customDrillDownUrl || drillDownField?.drillDown || drillDownField?.drillDown !== route.path
                        ? concat(
                              drillDownField.drillDownType !== DrillDownType.inner
                                  ? of(bcFetchRowMetaSuccess({ bcName, rowMeta, bcUrl, cursor }))
                                  : EMPTY,
                              of(userDrillDownSuccess({ bcName, bcUrl, cursor })),
                              of(
                                  drillDown({
                                      url: customDrillDownUrl || drillDownField.drillDown,
                                      drillDownType: drillDownField.drillDownType as DrillDownType,
                                      route
                                  })
                              )
                          )
                        : EMPTY
                }),
                catchError(error => {
                    console.error(error)
                    return EMPTY // TODO:
                })
            )
        })
    )
