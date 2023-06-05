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

import { useBcProps, useWidgetProps } from '../core'
import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { BcSorter } from '../../interfaces/filters'
import { $do } from '../../actions/actions'

export interface SorterProps {
    widgetName: string
    fieldKey: string
}

export function useSorter({ widgetName, fieldKey }: SorterProps) {
    const { bcName, isInfiniteWidgets } = useWidgetProps(widgetName)
    const { sorters, page } = useBcProps({ bcName })
    const sorter = sorters?.find(item => item.fieldName === fieldKey)

    const dispatch = useDispatch()

    const setSort = useCallback(
        (newSorter: BcSorter) => {
            dispatch($do.bcAddSorter({ bcName, sorter: newSorter }))

            isInfiniteWidgets
                ? dispatch(
                      $do.bcFetchDataPages({
                          bcName,
                          widgetName,
                          from: 1,
                          to: page
                      })
                  )
                : dispatch(
                      $do.bcForceUpdate({
                          bcName,
                          widgetName
                      })
                  )
        },
        [bcName, dispatch, isInfiniteWidgets, page, widgetName]
    )

    const toggleSort = useCallback(() => {
        setSort({
            fieldName: fieldKey,
            direction: !sorter ? 'desc' : sorter.direction === 'asc' ? 'desc' : 'asc'
        })
    }, [fieldKey, setSort, sorter])

    return {
        sorter,
        hideSort: !bcName,
        setSort,
        toggleSort
    }
}
