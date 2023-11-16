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

import { CXBoxEpic, WidgetTableMeta } from '../../interfaces'
import { concat, filter, mergeMap, Observable, of } from 'rxjs'
import { changeAssociationFull, changeDataItem, changeDescendantsAssociationsFull } from '../../actions'
import { AnyAction } from '@reduxjs/toolkit'
import { buildBcUrl } from '../../utils'

/**
 * Change full hierarchy record association state. Also select/deselect dependent records according to widget options.
 */
export const changeAssociationFullEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(changeAssociationFull.match),
        mergeMap(action => {
            const state = state$.value
            const result: Array<Observable<AnyAction>> = []
            const assocValueKey = action.payload.assocValueKey || state.view.popupData?.assocValueKey
            const bcName = action.payload.bcName
            const allData = state.data[bcName]
            const selected = action.payload.dataItem._associate
            const depth = action.payload.depth || 1
            const parentDepth = depth - 1
            const parentItem = depth > 1 && allData.find(item => item.id === action.payload.dataItem.parentId)
            const widget = state.view.widgets.find(item => item.name === action.payload.widgetName) as WidgetTableMeta
            const hierarchyTraverse = widget.options?.hierarchyTraverse
            const rootRadio = widget.options?.hierarchyRadio
            const hierarchyGroupDeselection = widget.options?.hierarchyGroupDeselection

            const currentLevelData = allData.filter(item => item.level === depth && (item.level === 1 || item.parentId === parentItem?.id))

            if (rootRadio && hierarchyGroupDeselection && depth === 1) {
                if (selected) {
                    const delta = state.view.pendingDataChanges[bcName]
                    const prevSelected = allData.find(dataItem => {
                        if (dataItem.level === 1 && dataItem.id !== action.payload.dataItem.id) {
                            const deltaItem = delta?.[dataItem.id]
                            if (deltaItem?._associate || (!deltaItem && dataItem._associate)) {
                                return true
                            }
                        }

                        return false
                    })

                    if (prevSelected) {
                        result.push(
                            of(
                                changeAssociationFull({
                                    bcName,
                                    depth: depth,
                                    widgetName: action.payload.widgetName,
                                    dataItem: { ...prevSelected, _associate: false },
                                    assocValueKey
                                })
                            )
                        )
                    }
                } else {
                    // result.push(Observable.of($do.dropAllAssociationsFull({bcName, depth: depth + 1, dropDescendants: true})))
                    result.push(
                        of(
                            changeDescendantsAssociationsFull({
                                bcName,
                                parentId: action.payload.dataItem.id,
                                depth: depth + 1,
                                assocValueKey,
                                selected: false
                            })
                        )
                    )
                }
            }

            result.push(
                of(
                    changeDataItem({
                        bcName: action.payload.bcName,
                        bcUrl: buildBcUrl(action.payload.bcName, true, state),
                        cursor: action.payload.dataItem.id,
                        dataItem: action.payload.dataItem
                    })
                )
            )

            if (parentDepth && hierarchyTraverse && selected) {
                result.push(
                    of(
                        changeAssociationFull({
                            bcName,
                            depth: parentDepth,
                            widgetName: action.payload.widgetName,
                            dataItem: {
                                ...parentItem,
                                _associate: true,
                                _value: parentItem?.[assocValueKey]
                            },
                            assocValueKey
                        })
                    )
                )
            }

            if (parentDepth && hierarchyTraverse && !selected) {
                const delta = state.view.pendingDataChanges[bcName]
                const wasLastInDelta =
                    !delta ||
                    !Object.values(delta).find(deltaValue => {
                        return (
                            deltaValue._associate === true &&
                            deltaValue.id !== action.payload.dataItem.id &&
                            currentLevelData.find(dataValue => dataValue.id === deltaValue.id)
                        )
                    })
                const deltaFalseId =
                    delta &&
                    Object.values(delta)
                        ?.filter(item => item._associate === false)
                        .map(item => item.id)
                const wasLastInData = currentLevelData
                    .filter(item => item.id !== action.payload.dataItem.id && !deltaFalseId?.includes(item.id))
                    .every(item => !item._associate)

                if (wasLastInData && wasLastInDelta) {
                    result.push(
                        of(
                            changeAssociationFull({
                                bcName,
                                depth: parentDepth,
                                widgetName: action.payload.widgetName,
                                dataItem: { ...parentItem, _associate: false },
                                assocValueKey
                            })
                        )
                    )
                }
            }

            return concat(...result)
        })
    )
