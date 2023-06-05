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

import { CXBoxEpic } from '../../interfaces'
import { concat, filter, mergeMap, Observable, of } from 'rxjs'
import { changeDataItems, changeDescendantsAssociationsFull } from '../../actions'
import { AnyAction } from '@reduxjs/toolkit'

/**
 * Change full hierarchy descendants association state
 */
export const changeDescendantsAssociationsFullEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(changeDescendantsAssociationsFull.match),
        mergeMap(action => {
            const state = state$.value
            const depth = action.payload.depth
            const data = state.data[action.payload.bcName]

            const targetData = (data || []).filter(item => item.level === depth && item.parentId === action.payload.parentId)

            const result: Array<Observable<AnyAction>> = [
                of(
                    changeDataItems({
                        bcName: action.payload.bcName,
                        cursors: targetData.map(item => item.id),
                        dataItems: targetData.map(item => ({
                            ...item,
                            _value: item[action.payload.assocValueKey],
                            _associate: action.payload.selected
                        }))
                    })
                )
            ]

            targetData.forEach(targetDataItem => {
                if (data.find(dataItem => dataItem.parentId === targetDataItem.id)) {
                    result.push(
                        of(
                            changeDescendantsAssociationsFull({
                                ...action.payload,
                                parentId: targetDataItem.id,
                                depth: depth + 1
                            })
                        )
                    )
                }
            })

            return concat(...result)
        })
    )
