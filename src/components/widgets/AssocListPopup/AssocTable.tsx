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
import { TableRowSelection } from 'antd/lib/table'
import TableWidget from '../../widgets/TableWidget/TableWidget'
import { Store } from '../../../interfaces/store'
import { WidgetTableMeta, PaginationMode } from '../../../interfaces/widget'
import { AssociatedItem } from '../../../interfaces/operation'
import { DataItem, PendingDataItem } from '../../../interfaces/data'
import { useAssocRecords } from '../../../hooks/useAssocRecords'
import { $do } from '../../../actions/actions'

export interface AssocTableOwnProps {
    meta: WidgetTableMeta
    disablePagination?: boolean
}

export interface AssocTableProps extends AssocTableOwnProps {
    data: AssociatedItem[]
    assocValueKey: string
    pendingChanges: Record<string, PendingDataItem>
    onSelect: (bcName: string, dataItem: AssociatedItem) => void
    onSelectAll: (bcName: string, cursors: string[], dataItems: PendingDataItem[]) => void
}

/**
 *
 * @param props
 * @category Components
 */
export const AssocTable: FunctionComponent<AssocTableProps> = props => {
    const selectedRecords = useAssocRecords(props.data, props.pendingChanges)

    const rowSelection: TableRowSelection<DataItem> = {
        type: 'checkbox',
        selectedRowKeys: selectedRecords.map(item => item.id),
        onSelect: (record: AssociatedItem, selected: boolean) => {
            props.onSelect(props.meta.bcName, {
                id: record.id,
                vstamp: record.vstamp,
                _value: record[props.assocValueKey],
                _associate: selected
            })
        },
        onSelectAll: (selected: boolean, selectedRows: DataItem[], changedRows: DataItem[]) => {
            props.onSelectAll(
                props.meta.bcName,
                changedRows.map(item => item.id),
                changedRows.map(item => ({
                    id: item.id,
                    vstamp: item.vstamp,
                    _value: item[props.assocValueKey],
                    _associate: selected
                }))
            )
        },
        getCheckboxProps: () => ({
            'data-test-widget-list-column-select': true
        })
    }

    return (
        <TableWidget
            meta={props.meta}
            rowSelection={rowSelection}
            paginationMode={PaginationMode.page}
            disablePagination={props.disablePagination}
        />
    )
}

const emptyDataItems: AssociatedItem[] = []

function mapStateToProps(state: Store, ownProps: AssocTableOwnProps) {
    const pendingChanges = state.view.pendingDataChanges[ownProps.meta.bcName]
    return {
        assocValueKey: state.view.popupData.assocValueKey,
        data: state.data[ownProps.meta.bcName] || emptyDataItems,
        pendingChanges
    }
}

/**
 *
 * @param dispatch
 */
export function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSelect: (bcName: string, dataItem: AssociatedItem) => {
            dispatch($do.changeDataItem({ bcName, cursor: dataItem.id, dataItem }))
        },
        onSelectAll: (bcName: string, cursors: string[], dataItems: PendingDataItem[]) => {
            dispatch($do.changeDataItems({ bcName, cursors, dataItems }))
        }
    }
}

AssocTable.displayName = 'AssocTable'

/**
 * @category Components
 */
const ConnectedAssocTable = connect(mapStateToProps, mapDispatchToProps)(AssocTable)

export default ConnectedAssocTable
