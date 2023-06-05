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

import { AssociatedItem, CXBoxEpic } from '../../interfaces'
import { filter, of, switchMap } from 'rxjs'
import { changeDataItem, saveAssociations } from '../../actions'
import { MultivalueSingleValue } from '@cxbox-ui/schema'

/**
 * Works with assoc-lists, which doesn't call back-end's assoc methods
 *
 * @category Epics
 */
export const saveAssociationsPassiveEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(saveAssociations.match),
        filter(() => {
            return !state$.value.view.popupData.active
        }),
        switchMap(action => {
            const state = state$.value
            const { calleeBCName = action.payload.calleeBcName, associateFieldKey = action.payload.associateFieldKey } =
                state.view.popupData
            const cursor = state.screen.bo.bc[calleeBCName].cursor
            const recordPrevData = (state.data[calleeBCName].find(dataStateRecord => dataStateRecord.id === cursor)[associateFieldKey] ??
                []) as MultivalueSingleValue[]
            const newValues: AssociatedItem[] = []

            action.payload.bcNames.forEach(pendingBc => {
                const pendingChanges = state.view.pendingDataChanges[pendingBc] || {}
                Object.entries(pendingChanges).forEach(([id, item]) => {
                    newValues.push(item as AssociatedItem)
                })
            })

            const addedItems = newValues
                .filter(newItem => {
                    const isNew = !recordPrevData.find(prevItem => prevItem.id === newItem.id) && newItem._associate
                    return isNew
                })
                .map(newItem => ({
                    id: newItem.id,
                    options: {},
                    value: newItem._value as string
                }))

            const result = recordPrevData
                .filter(prevItem => {
                    const removedItem = newValues.find(item => item.id === prevItem.id)
                    if (removedItem && removedItem?._associate === false) {
                        return false
                    }
                    return true
                })
                .concat(...addedItems)

            return of(
                changeDataItem({
                    bcName: calleeBCName,
                    cursor: cursor,
                    dataItem: {
                        [associateFieldKey]: result
                    }
                })
            )
        })
    )
