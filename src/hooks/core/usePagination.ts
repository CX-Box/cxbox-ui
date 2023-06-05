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

import { Store } from '../../interfaces/store'
import { useDispatch } from 'react-redux'
import React from 'react'
import { $do } from '../../actions/actions'
import { useBcProps, useWidgetProps } from '../core'
import { PaginationMode } from '../../interfaces/widget'

export interface PaginationProps {
    /**
     * Name of the widget showing pagination
     */
    widgetName: string
    /**
     * Type of paginator (prev/next buttons, loadMore button, etc.)
     */
    mode: PaginationMode
    /**
     * Callback on page change
     */
    changePageAdditional?: (newPage?: number) => void
}

export function usePagination<S extends Store>({ mode, changePageAdditional, widgetName }: PaginationProps) {
    const { bcName } = useWidgetProps(widgetName)
    const { page, hasNext, loading } = useBcProps({ bcName })

    const dispatch = useDispatch()

    const loadMore = React.useCallback(() => {
        dispatch($do.bcLoadMore({ bcName, widgetName }))

        changePageAdditional?.(page + 1)
    }, [bcName, widgetName, page, dispatch, changePageAdditional])

    const changePage = React.useCallback(
        (newPage: number) => {
            dispatch($do.bcChangePage({ bcName, page: newPage, widgetName }))
        },
        [bcName, widgetName, dispatch]
    )

    const prevPage = React.useCallback(() => {
        const newPage = page - 1

        changePage(newPage)

        changePageAdditional?.(newPage)
    }, [page, changePage, changePageAdditional])

    const nextPage = React.useCallback(() => {
        const newPage = page + 1

        changePage(newPage)

        changePageAdditional?.(newPage)
    }, [page, changePage, changePageAdditional])

    const showPagination = hasNext || (mode === PaginationMode.page && page > 1)

    return {
        nextPage,
        prevPage,
        loadMore,
        hasNext,
        loading,
        page,
        showPagination,
        hidePagination: !showPagination,
        changePage
    }
}
