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

import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Table } from 'antd'
import { ColumnProps, TableProps, TableRowSelection } from 'antd/es/table'
import ActionLink from '../../ui/ActionLink/ActionLink'
import { $do } from '../../../actions/actions'
import { Store } from '../../../interfaces/store'
import { PaginationMode, WidgetListField, WidgetTableMeta } from '../../../interfaces/widget'
import { RowMetaField } from '../../../interfaces/rowMeta'
import { DataItem, PendingDataItem } from '../../../interfaces/data'
import { buildBcUrl } from '../../../utils/strings'
import * as styles from './TableWidget.less'
import { FieldType, ViewSelectedCell } from '../../../interfaces/view'
import Field from '../../Field/Field'
import { Route } from '../../../interfaces/router'
import { Operation, OperationGroup } from '../../../interfaces/operation'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'
import cn from 'classnames'
import Pagination from '../../ui/Pagination/Pagination'
import HierarchyTable from '../../../components/HierarchyTable/HierarchyTable'
import { BcFilter, FilterGroup } from '../../../interfaces/filters'
import { useTranslation } from 'react-i18next'
import FullHierarchyTable from '../../../components/FullHierarchyTable/FullHierarchyTable'
import { parseFilters } from '../../../utils/filters'
import Select from '../../ui/Select/Select'
import RowOperationsButton from '../../RowOperations/RowOperationsButton'
import { useRowMenu } from '../../../hooks/useRowMenu'

type AdditionalAntdTableProps = Partial<Omit<TableProps<DataItem>, 'rowSelection'>>
export interface TableWidgetOwnProps extends AdditionalAntdTableProps {
    columnTitleComponent?: (options?: { widgetName: string; widgetMeta: WidgetListField; rowMeta: RowMetaField }) => React.ReactNode
    meta: WidgetTableMeta
    rowSelection?: TableRowSelection<DataItem>
    showRowActions?: boolean
    allowEdit?: boolean
    paginationMode?: PaginationMode
    disablePagination?: boolean
    disableDots?: boolean
    controlColumns?: Array<{ column: ColumnProps<DataItem>; position: 'left' | 'right' }>
    header?: React.ReactNode
}

export interface TableWidgetProps extends TableWidgetOwnProps {
    data: DataItem[]
    rowMetaFields: RowMetaField[]
    limitBySelf: boolean
    /**
     * @deprecated TODO: Remove in 2.0 in favor of `widgetName`
     */
    bcName?: string
    widgetName?: string
    /**
     * @deprecated TODO: Remove 2.0 as it is accessible from the store
     */
    route?: Route
    cursor: string
    selectedCell: ViewSelectedCell
    /**
     * @deprecated TODO: Remove 2.0 as it is never used
     */
    pendingDataItem?: PendingDataItem
    hasNext: boolean
    /**
     * @deprecated TODO: Remove in 2.0.0 as it's moved to RowOperationsMenu
     */
    operations?: Array<Operation | OperationGroup>
    /**
     * @deprecated TODO: Remove in 2.0.0 as it's moved to RowOperationsMenu
     */
    metaInProgress?: boolean
    filters: BcFilter[]
    filterGroups: FilterGroup[]
    /**
     * @deprecated TODO: Remove 2.0 as it is never used
     */
    onDrillDown?: (widgetName: string, bcName: string, cursor: string, fieldKey: string) => void
    // TODO: Remove `route` in 2.0 as it is accessible from the store; remove `bcName`
    onShowAll: (bcName: string, cursor: string, route: Route, widgetName: string) => void
    /**
     * @deprecated TODO: Remove in 2.0.0 as it's move to RowOperationsMenu
     */
    onOperationClick?: (bcName: string, operationType: string, widgetName: string) => void
    /**
     * @deprecated TODO: At the moment not used but might be useful when introducing table select
     */
    onSelectRow?: (bcName: string, cursor: string) => void
    onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => void
    onRemoveFilters: (bcName: string) => void
    onApplyFilter: (bcName: string, filter: BcFilter, widgetName?: string) => void
    onForceUpdate: (bcName: string) => void
}

/**
 *
 * @param props
 * @category Widgets
 */
export const TableWidget: FunctionComponent<TableWidgetProps> = props => {
    const {
        meta,
        rowSelection,
        showRowActions,
        allowEdit,
        paginationMode,
        disablePagination,
        disableDots,
        controlColumns,
        data,
        rowMetaFields,
        limitBySelf,
        bcName,
        widgetName,
        route,
        cursor,
        selectedCell,
        pendingDataItem,
        hasNext,
        filters,
        filterGroups,
        columnTitleComponent,
        onDrillDown,
        onShowAll,
        onSelectCell,
        onRemoveFilters,
        onApplyFilter,
        onForceUpdate,
        ...rest
    } = props
    /**
     * TODO: What's the difference between props.meta.name and props.widgetName?
     */
    const { bcName: widgetBcName, name: widgetMetaName, fields } = meta
    if (props.meta.options) {
        if (props.meta.options.hierarchyFull) {
            return <FullHierarchyTable meta={props.meta} />
        }

        if (props.meta.options.hierarchy) {
            return <HierarchyTable meta={props.meta} showPagination widgetName={props.widgetName} />
        }
    }
    const isAllowEdit = (props.allowEdit ?? true) && !props.meta.options?.readOnly
    const { t } = useTranslation() // NOSONAR (S6440) hook is called conditionally, fix later

    // eslint-disable-next-line prettier/prettier
    const processCellClick = React.useCallback( // NOSONAR(S6440) hook is called conditionally, fix later
        (recordId: string, fieldKey: string) => {
            onSelectCell(recordId, widgetMetaName, fieldKey)
        },
        [onSelectCell, widgetMetaName]
    )

    // eslint-disable-next-line prettier/prettier
    const processedFields: WidgetListField[] = React.useMemo( // NOSONAR(S6440) hook is called conditionally, fix later
        () =>
            fields.map(item => {
                return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
            }),
        [fields]
    )

    // eslint-disable-next-line prettier/prettier
    const columns: Array<ColumnProps<DataItem>> = React.useMemo(() => { // NOSONAR(S6440) hook is called conditionaly, fix later
        return processedFields
            .filter(item => item.type !== FieldType.hidden && !item.hidden)
            .map(item => {
                const fieldRowMeta = rowMetaFields?.find(field => field.key === item.key)
                return {
                    title: columnTitleComponent ? (
                        columnTitleComponent({ widgetName: widgetMetaName, widgetMeta: item, rowMeta: fieldRowMeta })
                    ) : (
                        <ColumnTitle widgetName={widgetMetaName} widgetMeta={item} rowMeta={fieldRowMeta} />
                    ),
                    key: item.key,
                    dataIndex: item.key,
                    width: item.width,
                    render: (text: string, dataItem: DataItem) => {
                        const editMode =
                            isAllowEdit &&
                            selectedCell &&
                            item.key === selectedCell.fieldKey &&
                            widgetMetaName === selectedCell.widgetName &&
                            dataItem.id === selectedCell.rowId &&
                            cursor === selectedCell.rowId
                        return (
                            <div
                                data-test="FIELD"
                                data-test-field-type={item.type}
                                data-test-field-title={item.label || item.title}
                                data-test-field-key={item.key}
                            >
                                <Field
                                    data={dataItem}
                                    bcName={widgetBcName}
                                    cursor={dataItem.id}
                                    widgetName={widgetMetaName}
                                    widgetFieldMeta={item}
                                    readonly={!editMode}
                                    forceFocus={editMode}
                                />
                            </div>
                        )
                    },
                    onCell: (record: DataItem, rowIndex: number) => {
                        return !isAllowEdit
                            ? null
                            : {
                                  onDoubleClick: (event: React.MouseEvent) => {
                                      processCellClick(record.id, item.key)
                                  }
                              }
                    },
                    onHeaderCell: () => {
                        return {
                            'data-test-widget-list-header-column-title': item?.title,
                            'data-test-widget-list-header-column-type': item?.type,
                            'data-test-widget-list-header-column-key': item?.key
                        }
                    }
                }
            })
    }, [
        columnTitleComponent,
        processedFields,
        processCellClick,
        widgetBcName,
        rowMetaFields,
        widgetMetaName,
        cursor,
        isAllowEdit,
        selectedCell
    ])

    // eslint-disable-next-line prettier/prettier
    const resultColumns = React.useMemo(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        const controlColumnsLeft: Array<ColumnProps<DataItem>> = []
        const controlColumnsRight: Array<ColumnProps<DataItem>> = []
        props.controlColumns?.map(item => {
            item.position === 'left' ? controlColumnsLeft.push(item.column) : controlColumnsRight.push(item.column)
        })
        return [...controlColumnsLeft, ...columns, ...controlColumnsRight]
    }, [columns, props.controlColumns])

    const [filterGroupName, setFilterGroupName] = React.useState(null) // NOSONAR(S6440) hook is called conditionally, fix later
    const filtersExist = !!props.filters?.length

    // eslint-disable-next-line prettier/prettier
    const handleShowAll = React.useCallback(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        onShowAll(widgetBcName, cursor, null, widgetName)
    }, [onShowAll, widgetBcName, cursor, widgetName])

    // eslint-disable-next-line prettier/prettier
    const handleRemoveFilters = React.useCallback(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        onRemoveFilters(widgetBcName)
        onForceUpdate(widgetBcName)
    }, [onRemoveFilters, onForceUpdate, widgetBcName])

    // eslint-disable-next-line prettier/prettier
    const handleAddFilters = React.useMemo(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        return (value: string) => {
            const filterGroup = filterGroups.find(item => item.name === value)
            const parsedFilters = parseFilters(filterGroup.filters)
            setFilterGroupName(filterGroup.name)
            onRemoveFilters(widgetBcName)
            parsedFilters.forEach(item => onApplyFilter(widgetBcName, item, widgetName))
            onForceUpdate(widgetBcName)
        }
    }, [filterGroups, widgetBcName, widgetName, setFilterGroupName, onRemoveFilters, onApplyFilter, onForceUpdate])

    // eslint-disable-next-line prettier/prettier
    React.useEffect(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        if (!filtersExist) {
            setFilterGroupName(null)
        }
    }, [filtersExist])

    // eslint-disable-next-line prettier/prettier
    const defaultHeader = React.useMemo(() => { // NOSONAR(S6440) hook is called conditionally, fix later
        return (
            <div className={styles.filtersContainer}>
                {!!filterGroups?.length && (
                    <Select
                        value={filterGroupName ?? t('Show all').toString()}
                        onChange={handleAddFilters}
                        dropdownMatchSelectWidth={false}
                    >
                        {filterGroups.map(group => (
                            <Select.Option key={group.name} value={group.name}>
                                <span>{group.name}</span>
                            </Select.Option>
                        ))}
                    </Select>
                )}
                {filtersExist && <ActionLink onClick={handleRemoveFilters}> {t('Clear all filters')} </ActionLink>}
                {props.limitBySelf && <ActionLink onClick={handleShowAll}> {t('Show all records')} </ActionLink>}
            </div>
        )
    }, [filterGroups, filterGroupName, filtersExist, props.limitBySelf, t, handleAddFilters, handleRemoveFilters, handleShowAll])

    const [operationsRef, parentRef, onRow] = useRowMenu() // NOSONAR(S6440) hook is called conditionally, fix later
    const handleRow = (record: DataItem) => {
        return {
            ...onRow(record),
            'data-test-widget-list-row-id': record.id,
            'data-test-widget-list-row-type': 'Row'
        }
    }

    const onHeaderRow = () => {
        return {
            'data-test-widget-list-header': true
        }
    }

    return (
        <div className={styles.tableContainer} ref={parentRef}>
            {props.header ?? defaultHeader}
            <Table
                className={cn(styles.table, { [styles.tableWithRowMenu]: props.showRowActions })}
                columns={resultColumns}
                dataSource={props.data}
                rowKey="id"
                rowSelection={props.rowSelection}
                pagination={false}
                onRow={handleRow}
                onHeaderRow={onHeaderRow}
                {...rest}
            />
            {!props.disablePagination && (
                <Pagination bcName={props.meta.bcName} mode={props.paginationMode || PaginationMode.page} widgetName={props.meta.name} />
            )}
            {props.showRowActions && !props.disableDots && <RowOperationsButton meta={props.meta} ref={operationsRef} parent={parentRef} />}
        </div>
    )
}

function mapStateToProps(store: Store, ownProps: TableWidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const fields = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]?.fields
    const bc = store.screen.bo.bc[bcName]
    const cursor = bc?.cursor
    const hasNext = bc?.hasNext
    const limitBySelf = cursor && store.router.bcPath?.includes(`${bcName}/${cursor}`)
    const filters = store.screen.filters[bcName]
    return {
        data: store.data[ownProps.meta.bcName],
        rowMetaFields: fields,
        limitBySelf,
        bcName,
        /**
         * @deprecated
         */
        route: null as Route,
        cursor,
        hasNext,
        selectedCell: store.view.selectedCell,
        /**
         * @deprecated
         */
        pendingDataItem: null as PendingDataItem,
        filters,
        filterGroups: bc?.filterGroups
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSelectCell: (cursor: string, widgetName: string, fieldKey: string) => {
            dispatch($do.selectTableCellInit({ widgetName, rowId: cursor, fieldKey }))
        },
        onShowAll: (bcName: string, cursor: string, route?: Route) => {
            dispatch($do.showAllTableRecordsInit({ bcName, cursor }))
        },
        /**
         * @deprecated TODO: Remove in 2.0
         */
        onDrillDown: null as (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void,
        onRemoveFilters: (bcName: string) => {
            dispatch($do.bcRemoveAllFilters({ bcName }))
        },
        onApplyFilter: (bcName: string, filter: BcFilter, widgetName?: string) => {
            dispatch($do.bcAddFilter({ bcName, filter, widgetName }))
        },
        onForceUpdate: (bcName: string) => {
            dispatch($do.bcForceUpdate({ bcName }))
        }
    }
}
TableWidget.displayName = 'TableWidget'

/**
 * @category Widgets
 */
const ConnectedTable = connect(mapStateToProps, mapDispatchToProps)(TableWidget)

export default ConnectedTable
