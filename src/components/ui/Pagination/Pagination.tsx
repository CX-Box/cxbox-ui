

import React from 'react'
import { PaginationMode } from '../../../interfaces/widget'
import { Button } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Store } from '../../../interfaces/store'
import styles from './Pagination.less'
import { $do } from '../../../actions/actions'

/**
 * Pagination component properties
 *
 * TODO: Rename PaginataionProps in 2.0.0
 */
export interface PaginationOwnProps {
    /**
     * Business component storing pagination data and loading state
     *
     * @deprecated TODO: Remove in favor of widgetName in 2.0.0
     */
    bcName?: string
    /**
     * Name of the widget showing pagination
     *
     * TODO: Will be mandatory in 2.0.0
     */
    widgetName?: string
    /**
     * Type of paginator (prev/next buttons, loadMore button, etc.)
     */
    mode: PaginationMode
    /**
     * Callback on page change
     */
    onChangePage?: (newPage?: number) => void
}

/**
 * @deprecated Connected internally
 */
interface PaginationStateProps {
    hasNext: boolean
    page: number
    loading: boolean
    widgetName: string
}

/**
 * @deprecated Connected internally
 */
interface PaginationDispatchProps {
    changePage: (bcName: string, page: number) => void
    loadMore: (bcName: string, widgetName: string) => void
}

// TODO: Leave only own props in 2.0.0
type PaginationAllProps = PaginationOwnProps & Partial<PaginationStateProps> & Partial<PaginationDispatchProps>

/**
 * Pagination component for tables displaying business component's data
 *
 * Depending on the display mode, fires `bcLoadMore` or `bcChangePage` action
 *
 * @category Components
 */
const Pagination: React.FunctionComponent<PaginationAllProps> = ({ bcName: propsBcName, widgetName, mode, onChangePage }) => {
    const storeBcName = useSelector((store: Store) => store.view.widgets.find(item => item.name === widgetName)?.bcName)
    const bcName = propsBcName || storeBcName // TODO: get only from store in 2.0.0

    const hasNext = useSelector((store: Store) => store.screen.bo.bc[bcName]?.hasNext)
    const page = useSelector((store: Store) => store.screen.bo.bc[bcName]?.page)
    const loading = useSelector((store: Store) => store.screen.bo.bc[bcName]?.loading)
    const dispatch = useDispatch()

    const onLoadMore = React.useCallback(() => {
        dispatch($do.bcLoadMore({ bcName, widgetName }))
        onChangePage?.(page + 1)
    }, [bcName, widgetName, page, dispatch, onChangePage])

    const onPrevPage = React.useCallback(() => {
        const newPage = page - 1
        dispatch($do.bcChangePage({ bcName, page: newPage, widgetName }))
        onChangePage?.(newPage)
    }, [bcName, page, widgetName, dispatch, onChangePage])

    const onNextPage = React.useCallback(() => {
        const newPage = page + 1
        dispatch($do.bcChangePage({ bcName, page: newPage, widgetName }))
        onChangePage?.(newPage)
    }, [bcName, page, widgetName, dispatch, onChangePage])

    const { t } = useTranslation()

    const isRequired = hasNext || (mode === PaginationMode.page && page > 1)

    if (!isRequired) {
        return null
    }

    return mode === PaginationMode.page ? (
        <div className={styles.paginationContainer}>
            <Button className={styles.prevButton} disabled={page < 2} onClick={onPrevPage} icon="left" />
            <Button disabled={!hasNext} onClick={onNextPage} icon="right" />
        </div>
    ) : (
        <div className={styles.paginationContainer}>
            <Button onClick={onLoadMore} disabled={loading} loading={loading}>
                {t('Load more')}
            </Button>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedPagination = React.memo(Pagination)

export default MemoizedPagination
