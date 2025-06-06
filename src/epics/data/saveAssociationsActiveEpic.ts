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
import { AssociatedItem, CXBoxEpic } from '../../interfaces'
import { catchError, concat, EMPTY, filter, mergeMap, of, switchMap } from 'rxjs'
import {
    associateInProgress,
    bcCancelPendingChanges,
    bcForceUpdate,
    processPostInvoke,
    saveAssociations,
    setOperationFinished
} from '../../actions'

/**
 * Works with assoc-lists, which does call back-end's assoc methods by click on confirm button in modal window
 *
 * @category Epics
 */
export const saveAssociationsActiveEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(saveAssociations.match),
        filter(action => {
            return state$.value.view.popupData?.active
        }),
        switchMap(action => {
            const state = state$.value
            const calleeBCName = state.view.popupData?.calleeBCName
            const calleeWidgetName = state.view.popupData?.calleeWidgetName
            const popupBcName = state.view.popupData?.bcName
            const bcNames = action.payload.bcNames
            const bcUrl = buildBcUrl(calleeBCName, true, state)
            const pendingChanges = state.view.pendingDataChanges[bcNames[0]] || {}
            const params: Record<string, any> = bcNames.length ? { _bcName: bcNames[bcNames.length - 1] } : {}

            return concat(
                of(associateInProgress({ bcName: popupBcName })),
                api
                    .associate(
                        state.screen.screenName,
                        bcUrl,
                        (Object.values(pendingChanges) as AssociatedItem[]).filter(i => i._associate),
                        params
                    )
                    .pipe(
                        mergeMap(response => {
                            const postInvoke = response.postActions[0]
                            const calleeWidget = state.view.widgets.find(widgetItem => widgetItem.bcName === calleeBCName)
                            return concat(
                                of(setOperationFinished({ bcName: popupBcName, operationType: 'saveAssociations' })),
                                postInvoke
                                    ? of(processPostInvoke({ bcName: calleeBCName, postInvoke, widgetName: calleeWidget?.name }))
                                    : EMPTY,
                                of(bcCancelPendingChanges({ bcNames: bcNames })),
                                of(bcForceUpdate({ bcName: calleeBCName, widgetName: calleeWidgetName }))
                            )
                        }),
                        catchError(err => {
                            console.error(err)
                            return of(setOperationFinished({ bcName: popupBcName, operationType: 'saveAssociations' }))
                        })
                    )
            )
        })
    )
