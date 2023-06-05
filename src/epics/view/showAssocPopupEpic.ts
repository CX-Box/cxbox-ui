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

import { CXBoxEpic, PendingDataItem } from '../../interfaces'
import { EMPTY, filter, mergeMap, of } from 'rxjs'
import { changeDataItems, showViewPopup } from '../../actions'
import { MultivalueSingleValue, WidgetTypes } from '@cxbox-ui/schema'

export const showAssocPopupEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(showViewPopup.match),
        filter(action => !!(action.payload.calleeBCName && action.payload.associateFieldKey)),
        mergeMap(action => {
            const { bcName, calleeBCName } = action.payload

            const state = state$.value

            const assocWidget = state.view.widgets.find(widget => widget.bcName === bcName && widget.type === WidgetTypes.AssocListPopup)
            const calleeCursor = state.screen.bo.bc[calleeBCName]?.cursor
            const calleePendingChanges = state.view.pendingDataChanges[calleeBCName]?.[calleeCursor]
            const assocFieldKey = action.payload.associateFieldKey
            const assocFieldChanges = calleePendingChanges?.[assocFieldKey] as MultivalueSingleValue[]
            const somethingMissing = !assocWidget || !calleePendingChanges || !assocFieldChanges || !assocFieldChanges
            if (somethingMissing || (assocWidget.options && !assocWidget.options.hierarchyFull)) {
                return EMPTY
            }

            const popupInitPendingChanges: Record<string, PendingDataItem> = {}

            assocFieldChanges.forEach(record => {
                popupInitPendingChanges[record.id] = {
                    id: record.id,
                    _associate: true,
                    _value: record.value
                }
            })

            const calleeData = state.data[calleeBCName]?.find(dataRecord => dataRecord.id === calleeCursor)
            const assocIds = (calleeData?.[assocFieldKey] as MultivalueSingleValue[])?.map(recordId => recordId.id)
            const assocPendingIds = assocFieldChanges.map(recordId => recordId.id)
            if (assocIds) {
                assocIds.forEach(recordId => {
                    if (!assocPendingIds.includes(recordId)) {
                        popupInitPendingChanges[recordId] = {
                            id: recordId,
                            _associate: false
                        }
                    }
                })
            }

            return of(
                changeDataItems({
                    bcName,
                    cursors: Object.keys(popupInitPendingChanges),
                    dataItems: Object.values(popupInitPendingChanges)
                })
            )
        })
    )
