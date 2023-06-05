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
import { changeAssociation, changeDataItem, dropAllAssociations } from '../../actions'
import { AnyAction } from '@reduxjs/toolkit'
import { WidgetTableHierarchy } from '@cxbox-ui/schema'

export const changeAssociationEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(changeAssociation.match),
        mergeMap(action => {
            const state = state$.value
            const selected = action.payload.dataItem._associate
            const result: Array<Observable<AnyAction>> = [
                of(
                    changeDataItem({
                        bcName: action.payload.bcName,
                        cursor: action.payload.dataItem.id,
                        dataItem: action.payload.dataItem
                    })
                )
            ]
            const widget = state.view.widgets.find(item => item.name === action.payload.widgetName) as WidgetTableMeta
            const isRoot = action.payload.bcName === widget.bcName
            const rootHierarchyDescriptor = {
                bcName: widget.bcName,
                radio: widget.options?.hierarchyRadio,
                fields: widget.fields
            }
            const hierarchy = widget.options?.hierarchy
            const hierarchyDescriptor: WidgetTableHierarchy = isRoot
                ? rootHierarchyDescriptor
                : hierarchy.find(item => item.bcName === action.payload.bcName)
            const hierarchyGroupSelection = widget.options?.hierarchyGroupSelection
            const hierarchyTraverse = widget.options?.hierarchyTraverse
            const childrenBc = hierarchy
                .slice(hierarchy.findIndex(item => item.bcName === action.payload.bcName) + 1)
                .map(item => item.bcName)
            if (hierarchyGroupSelection && hierarchyDescriptor.radio && !selected) {
                result.push(
                    of(
                        dropAllAssociations({
                            bcNames: childrenBc
                        })
                    )
                )
            }
            const parent: WidgetTableHierarchy = isRoot
                ? null
                : hierarchy.find((item, index) => {
                      return hierarchy[index + 1]?.bcName === action.payload.bcName
                  }) || rootHierarchyDescriptor
            const parentItem = state.data[parent?.bcName]?.find(item => item.id === state.screen.bo.bc[parent?.bcName].cursor)
            if (parent && hierarchyTraverse && selected) {
                if (hierarchyDescriptor.radio) {
                    result.push(
                        of(
                            dropAllAssociations({
                                bcNames: [parent.bcName]
                            })
                        )
                    )
                }
                result.push(
                    of(
                        changeAssociation({
                            bcName: parent.bcName,
                            widgetName: action.payload.widgetName,
                            dataItem: {
                                ...parentItem,
                                _associate: true,
                                _value: parentItem[parent.assocValueKey || action.payload.assocValueKey]
                            },
                            assocValueKey: action.payload.assocValueKey
                        })
                    )
                )
            }
            if (parent && hierarchyTraverse && !selected) {
                const data = state.data[action.payload.bcName]
                const wasLastInData = data.filter(item => item.id !== action.payload.dataItem.id).every(item => !item._associate)

                const delta = state.view.pendingDataChanges[action.payload.bcName]
                const wasLastInDelta =
                    !delta ||
                    !Object.values(delta).find(deltaValue => {
                        return (
                            deltaValue._associate === true &&
                            deltaValue.id !== action.payload.dataItem.id &&
                            // Filter by dataEpics.ts records, because delta can contain records from another hierarchy branch, but dataEpics.ts always contains
                            // only target branch records, that we see in widget
                            data.find(dataValue => dataValue.id === deltaValue.id)
                        )
                    })
                if (wasLastInData && wasLastInDelta) {
                    result.push(
                        of(
                            changeAssociation({
                                bcName: parent.bcName,
                                widgetName: action.payload.widgetName,
                                dataItem: { ...parentItem, _associate: false },
                                assocValueKey: action.payload.assocValueKey
                            })
                        )
                    )
                }
            }
            return concat(...result)
        })
    )
