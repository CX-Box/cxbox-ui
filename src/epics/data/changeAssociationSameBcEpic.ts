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
import { changeAssociationSameBc, changeDataItem } from '../../actions'
import { AnyAction } from '@reduxjs/toolkit'
import { buildBcUrl } from '../../utils'

/**
 * @category Epics
 */
export const changeAssociationSameBcEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(changeAssociationSameBc.match),
        mergeMap(action => {
            const state = state$.value
            const bcName = action.payload.bcName
            const result: Array<Observable<AnyAction>> = [
                of(
                    changeDataItem({
                        bcName: bcName,
                        bcUrl: buildBcUrl(bcName, true, state),
                        cursor: action.payload.dataItem.id,
                        dataItem: action.payload.dataItem
                    })
                )
            ]

            const selected = action.payload.dataItem._associate
            const depth = action.payload.depth || 1
            const parentDepth = depth - 1
            const widget = state.view.widgets.find(item => item.name === action.payload.widgetName) as WidgetTableMeta
            const hierarchyTraverse = widget.options?.hierarchyTraverse

            const currentData = depth > 1 ? state.depthData[depth]?.[bcName] : state.data[bcName]

            const parentCursor = parentDepth
                ? parentDepth > 1
                    ? state.screen.bo.bc[bcName].depthBc?.[parentDepth]?.cursor
                    : state.screen.bo.bc[bcName].cursor
                : null

            const parentItem = parentCursor
                ? parentDepth > 1
                    ? state.depthData[parentDepth]?.[bcName]?.find(item => item.id === parentCursor)
                    : state.data[bcName].find(item => item.id === parentCursor)
                : null

            if (parentDepth && hierarchyTraverse && selected) {
                result.push(
                    of(
                        changeAssociationSameBc({
                            bcName,
                            depth: parentDepth,
                            widgetName: action.payload.widgetName,
                            dataItem: {
                                ...parentItem,
                                _associate: true,
                                _value: parentItem?.[action.payload.assocValueKey]
                            },
                            assocValueKey: action.payload.assocValueKey
                        })
                    )
                )
            }

            if (parentDepth && hierarchyTraverse && !selected) {
                const wasLastInData = currentData.filter(item => item.id !== action.payload.dataItem.id).every(item => !item._associate)
                if (wasLastInData) {
                    result.push(
                        of(
                            changeAssociationSameBc({
                                bcName,
                                depth: parentDepth,
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
