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

import React from 'react'
import { DataItem, PendingDataItem, PickMap } from '../../../interfaces/data'
import { useDispatch } from 'react-redux'
import { $do } from '../../../actions/actions'

/**
 *
 * @param pickListDescriptor
 * @param bcName
 * @param parentCursor
 * @param parentBcName
 * @category Hooks
 */
export function useSingleSelect(pickListDescriptor: PickMap, bcName: string, parentCursor: string, parentBcName: string) {
    const dispatch = useDispatch()

    return React.useCallback(
        (selected: DataItem) => {
            const dataItem: PendingDataItem = {}
            if (!pickListDescriptor) {
                return
            }
            Object.entries(pickListDescriptor).forEach(([key, value]) => {
                dataItem[key] = selected[value]
            })
            dispatch($do.changeDataItem({ bcName: parentBcName, cursor: parentCursor, dataItem }))
            dispatch($do.viewClearPickMap(null))
            dispatch($do.closeViewPopup(null))
            dispatch($do.bcRemoveAllFilters({ bcName }))
        },
        [pickListDescriptor, parentCursor, bcName, parentBcName, dispatch]
    )
}
