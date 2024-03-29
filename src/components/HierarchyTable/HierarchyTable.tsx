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
import { Table, Icon } from 'antd'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { $do } from '../../actions/actions'
import { Store } from '../../interfaces/store'
import Field from '../../components/Field/Field'
import { buildBcUrl } from '../../utils/strings'
import { WidgetTableMeta, WidgetListField, WidgetTableHierarchy, PaginationMode } from '../../interfaces/widget'
import { DataItem, PendingDataItem } from '../../interfaces/data'
import { RowMetaField } from '../../interfaces/rowMeta'
import { ColumnProps, TableRowSelection, TableEventListeners } from 'antd/lib/table'
import { Route } from '../../interfaces/router'
import { FieldType } from '../../interfaces/view'
import styles from './HierarchyTable.less'
import { AssociatedItem } from '../../interfaces/operation'
import { useAssocRecords } from '../../hooks/useAssocRecords'
import Pagination from '../ui/Pagination/Pagination'
import cn from 'classnames'
import { getColumnWidth } from '../../utils/hierarchy'
import RowOperationsButton from '../RowOperations/RowOperationsButton'
import { useRowMenu } from '../../hooks/useRowMenu'

interface HierarchyTableOwnProps {
    meta: WidgetTableMeta
    assocValueKey?: string
    nestedByBc?: string
    parentBcName?: string
    showPagination?: boolean
    onRow?: (record: DataItem, index: number) => TableEventListeners
}

export interface HierarchyTableProps extends HierarchyTableOwnProps {
    childData: AssociatedItem[]
    hierarchyLevels: WidgetTableHierarchy[]
    nestedBcName: string
    widgetName?: string
    indentLevel: number
    data: AssociatedItem[]
    rowMetaFields: RowMetaField[]
    cursor: string
    parentCursor: string
    route: Route
    loading: boolean
    selectable?: boolean
    pendingChanges: Record<string, PendingDataItem>
    parentId?: string
    onDeselectAll?: (bcNames: string[]) => void
    onSelect?: (bcName: string, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => void
    onSelectAll?: (bcName: string, assocValueKey: string, selected: boolean) => void
    onDrillDown?: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    onExpand: (bcName: string, nestedBcName: string, cursor: string, route: Route) => void
}

export const Exp: FunctionComponent = (props: any) => {
    if (!props.onExpand || props.record.noChildren) {
        return null
    }
    const type = props.expanded ? 'minus-square' : 'plus-square'
    return <Icon className={styles.expand} type={type} onClick={e => props.onExpand(props.record, e)} />
}

const emptyArray: string[] = []
const emptyData: AssociatedItem[] = []

/**
 *
 * @param props
 * @category Components
 */
export const HierarchyTable: FunctionComponent<HierarchyTableProps> = ({
    meta,
    nestedByBc,
    hierarchyLevels,
    nestedBcName,
    indentLevel,
    data,
    selectable,
    pendingChanges,
    assocValueKey,
    childData,
    cursor,
    route,
    rowMetaFields,
    loading,
    showPagination,
    parentId,
    onRow,
    onSelect,
    onSelectAll,
    onDeselectAll,
    onExpand
}) => {
    const { bcName: widgetBcName, name: widgetName, options = {} } = meta
    const bcName = nestedByBc || widgetBcName

    const { hierarchyGroupSelection, hierarchyRadio, hierarchyRadioAll, hierarchyDisableRoot } = options ?? {}

    // TODO: Simplify all this
    const hierarchyLevel = nestedByBc ? hierarchyLevels.find(item => item.bcName === nestedByBc) : null
    const nestedHierarchyDescriptor = hierarchyLevel
        ? hierarchyLevels[hierarchyLevels.findIndex(item => item === hierarchyLevel) + 1]
        : hierarchyLevels[0]
    const hasNested = indentLevel < hierarchyLevels.length

    const isRadio = hierarchyLevel?.radio || (!hierarchyLevel && hierarchyRadio)
    const selectedRecords = useAssocRecords(data, pendingChanges, isRadio)

    const rowSelection: TableRowSelection<DataItem> = React.useMemo(() => {
        if (selectable && !(indentLevel === 0 && hierarchyDisableRoot)) {
            return {
                type: 'checkbox',
                selectedRowKeys: selectedRecords.map(item => item.id),
                onSelect: (record: AssociatedItem, selected: boolean) => {
                    const dataItem = {
                        ...record,
                        _associate: selected,
                        _value: hierarchyLevel ? record[hierarchyLevel.assocValueKey] : record[assocValueKey]
                    }

                    const isRadioAll = hierarchyRadioAll
                    if (selected && !isRadioAll) {
                        if (isRadio && selectedRecords.length) {
                            const prevSelected = selectedRecords[0]
                            onSelect(bcName, { ...prevSelected, _associate: false }, widgetName, assocValueKey)
                        }

                        const radioAncestorAndSameBcName: string[] = []
                        ;[widgetBcName, ...hierarchyLevels.map(item => item.bcName)].some(feBcName => {
                            if (
                                (feBcName === widgetBcName && hierarchyRadio) ||
                                (feBcName !== widgetBcName && hierarchyLevels.find(v => v.bcName === feBcName).radio)
                            ) {
                                radioAncestorAndSameBcName.push(feBcName)
                            }

                            return feBcName === bcName
                        })

                        if (radioAncestorAndSameBcName.length) {
                            onDeselectAll(radioAncestorAndSameBcName)
                        }
                    }

                    if (isRadioAll) {
                        onDeselectAll([widgetBcName, ...hierarchyLevels.map(item => item.bcName)])
                    }
                    if (nestedHierarchyDescriptor && cursor === record.id && hierarchyGroupSelection) {
                        onSelectAll(nestedHierarchyDescriptor.bcName, nestedHierarchyDescriptor.assocValueKey, selected)
                    }
                    onSelect(bcName, dataItem, widgetName, assocValueKey)
                }
            }
        }
        return undefined
    }, [
        bcName,
        onSelect,
        cursor,
        selectedRecords,
        assocValueKey,
        hierarchyDisableRoot,
        hierarchyGroupSelection,
        hierarchyLevel,
        hierarchyLevels,
        hierarchyRadio,
        hierarchyRadioAll,
        indentLevel,
        isRadio,
        nestedHierarchyDescriptor,
        onDeselectAll,
        onSelectAll,
        selectable,
        widgetName,
        widgetBcName
    ])

    const [currentCursor, setCurrentCursor] = React.useState(undefined)
    const [noChildRecords, setNoChildRecords] = React.useState([])
    const tableRecords = React.useMemo(() => {
        return data?.map(item => {
            return {
                ...item,
                noChildren: noChildRecords.includes(item.id)
            }
        })
    }, [data, noChildRecords])
    const [userClosedRecords, setUserClosedRecords] = React.useState([])
    const expandedRowKeys = React.useMemo(() => {
        if (currentCursor && !childData?.length) {
            if (!noChildRecords.includes(currentCursor)) {
                setNoChildRecords([...noChildRecords, currentCursor])
            }
            return emptyArray
        }
        if (noChildRecords.includes(currentCursor)) {
            setNoChildRecords(noChildRecords.filter(item => item !== currentCursor))
        }
        return !currentCursor || userClosedRecords.includes(currentCursor) ? emptyArray : [currentCursor]
    }, [currentCursor, userClosedRecords, childData, noChildRecords])

    const handleExpand = (expanded: boolean, dataItem: DataItem) => {
        if (expanded) {
            setCurrentCursor(dataItem.id)
            setUserClosedRecords(userClosedRecords.filter(item => item !== dataItem.id))
            onExpand(nestedByBc || meta.bcName, nestedBcName, dataItem.id, route)
        } else {
            setUserClosedRecords([...userClosedRecords, dataItem.id])
        }
    }

    const resetCursor = React.useCallback(() => {
        setCurrentCursor(null)
    }, [])

    // Expanded nodes rendered as nested table component
    const nested = (record: DataItem, index: number, indent: number, expanded: boolean) => {
        if (record.id !== cursor) {
            return null
        }
        return (
            <ConnectedHierarchyTable
                meta={meta}
                selectable={selectable}
                parentBcName={bcName}
                assocValueKey={nestedHierarchyDescriptor.assocValueKey}
                nestedByBc={nestedBcName}
                onDrillDown={null}
                onRow={onRow}
                parentId={record.id}
            />
        )
    }
    const isSameBcHierarchy = meta.options?.hierarchySameBc
    const fields = hierarchyLevel ? hierarchyLevel.fields : meta.fields
    const withHierarchyShift = fields.some(field => field.hierarchyShift === true)

    /**
     * Hierarchies builded around the same business component rely on identical set of fields for each
     * level of hierarchy, so the levels are indented by empty cell for field that belongs to top level.
     *
     * Regular hierarchies use pseudo-column for indentation
     */
    const indentColumn = !isSameBcHierarchy
        ? [
              {
                  title: '',
                  key: '_indentColumn',
                  dataIndex: null as string,
                  className: styles.selectColumn,
                  width: withHierarchyShift ? `${50 + indentLevel * 20}px` : '50px',
                  render: (): React.ReactNode => null
              }
          ]
        : []

    const fieldCustomProps = React.useMemo(() => {
        return { hierarchyDepth: indentLevel + 1 }
    }, [indentLevel])

    const processedFields: WidgetListField[] = React.useMemo(
        () =>
            fields.map(item => {
                return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
            }),
        [fields]
    )

    const columns: Array<ColumnProps<DataItem>> = React.useMemo(() => {
        return [
            ...indentColumn,
            ...processedFields
                .filter(item => !item.hidden && item.type !== FieldType.hidden)
                .map((item, index) => {
                    const itemWidth = isSameBcHierarchy
                        ? getColumnWidth(item.key, indentLevel, processedFields, rowMetaFields, hierarchyLevels.length, item.width)
                        : item.width
                    const className = isSameBcHierarchy
                        ? styles.sameHierarchyNode
                        : cn({ [styles[`padding${indentLevel}`]]: processedFields[0].key === item.key && indentLevel && !item.width })
                    return {
                        title: item.title,
                        key: item.key,
                        dataIndex: item.key,
                        width: itemWidth,
                        className,
                        render: (text: string, dataItem: any) => {
                            const node: React.ReactNode = (
                                <Field
                                    bcName={bcName}
                                    cursor={dataItem.id}
                                    widgetName={widgetName}
                                    widgetFieldMeta={item}
                                    readonly
                                    customProps={fieldCustomProps}
                                />
                            )
                            return (
                                <span
                                    className={hasNested && index === 0 ? styles.expandPadding : undefined}
                                    data-test="FIELD"
                                    data-test-field-type={item.type}
                                    data-test-field-title={item.label || item.title}
                                    data-test-field-key={item.key}
                                >
                                    {node}
                                </span>
                            )
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
        ]
    }, [
        indentLevel,
        processedFields,
        rowMetaFields,
        hasNested,
        bcName,
        fieldCustomProps,
        indentColumn,
        isSameBcHierarchy,
        hierarchyLevels.length,
        widgetName
    ])
    const showOperations = meta.options?.actionGroups
    const [operationsRef, tableRef, onHover] = useRowMenu()
    const handleRow = React.useCallback(
        (record: DataItem, index: number) => {
            const basicHandlers = !(hierarchyDisableRoot && !indentLevel) && onRow?.(record, index)
            const hoverHandlers = showOperations && onHover?.(record)
            return {
                ...basicHandlers,
                ...hoverHandlers,
                'data-test-widget-list-row-id': record.id,
                'data-test-widget-list-row-type': 'Row'
            }
        },
        [onHover, showOperations, hierarchyDisableRoot, indentLevel, onRow]
    )

    const onHeaderRow = () => {
        return {
            'data-test-widget-list-header': true
        }
    }

    return (
        <div
            className={styles.container}
            ref={tableRef}
            data-test-widget-list-row-id={parentId || undefined}
            data-test-widget-list-row-type={parentId ? 'InlineForm' : undefined}
        >
            <Table
                className={styles.table}
                rowSelection={rowSelection}
                rowKey="id"
                columns={columns}
                pagination={false}
                showHeader={!nestedByBc}
                expandIcon={hasNested ? (Exp as any) : undefined}
                defaultExpandedRowKeys={[cursor]}
                expandedRowKeys={expandedRowKeys}
                onExpand={hasNested ? handleExpand : undefined}
                dataSource={tableRecords}
                expandedRowRender={hasNested ? nested : undefined}
                expandIconAsCell={false}
                expandIconColumnIndex={rowSelection ? 1 : 0}
                loading={loading}
                onHeaderRow={onHeaderRow}
                onRow={handleRow}
            />
            {showPagination && <Pagination bcName={bcName} mode={PaginationMode.page} onChangePage={resetCursor} widgetName={meta.name} />}
            {showOperations && <RowOperationsButton meta={meta} bcName={bcName} parent={tableRef} ref={operationsRef} />}
        </div>
    )
}

function mapStateToProps(store: Store, ownProps: HierarchyTableOwnProps) {
    const bcMap = store.screen.bo.bc
    const bcName = ownProps.nestedByBc || ownProps.meta.bcName
    const hierarchyLevels = ownProps.meta.options?.hierarchy
    const indentLevel = ownProps.nestedByBc ? hierarchyLevels.findIndex(item => item.bcName === ownProps.nestedByBc) + 1 : 0
    const nestedBcName = hierarchyLevels[indentLevel]?.bcName
    const loading = bcMap[bcName]?.loading
    const bcUrl = buildBcUrl(bcName, true)
    const fields = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]?.fields
    const cursor = bcMap[bcName]?.cursor
    const parentCursor = ownProps.nestedByBc && bcMap[ownProps.parentBcName]?.cursor
    const pendingChanges = store.view.pendingDataChanges[bcName]
    return {
        childData: loading ? emptyData : store.data[nestedBcName],
        indentLevel,
        nestedBcName,
        hierarchyLevels,
        data: loading ? emptyData : store.data[bcName],
        pendingChanges,
        rowMetaFields: fields,
        cursor,
        parentCursor,
        route: store.router,
        loading
    }
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: HierarchyTableOwnProps) {
    return {
        onExpand: (bcName: string, nestedBcName: string, cursor: string, route: Route) => {
            dispatch($do.bcSelectRecord({ bcName, cursor, ignoreChildrenPageLimit: true, keepDelta: true }))
        },
        onSelect: (bcName: string, dataItem: AssociatedItem, widgetName: string, assocValueKey: string) => {
            dispatch($do.changeAssociation({ bcName, widgetName, dataItem, assocValueKey }))
        },
        onDeselectAll: (bcNames: string[]) => {
            dispatch($do.dropAllAssociations({ bcNames }))
        },
        onSelectAll: (bcName: string, assocValueKey: string, selected: boolean) => {
            dispatch($do.changeChildrenAssociations({ bcName, assocValueKey, selected }))
        }
    }
}

const ConnectedHierarchyTable = connect(mapStateToProps, mapDispatchToProps)(HierarchyTable)
/**
 * @category Components
 */
export default ConnectedHierarchyTable
