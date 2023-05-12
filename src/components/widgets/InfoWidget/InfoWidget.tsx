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
import { WidgetInfoField, WidgetInfoMeta } from '../../../interfaces/widget'
import { DataItem } from '../../../interfaces/data'
import { RowMetaField } from '../../../interfaces/rowMeta'
import { useFlatFormFields } from '../../../hooks'
import { Row } from 'antd'
import { Store } from '../../../interfaces/store'
import { buildBcUrl } from '../../../utils/strings'
import { Dispatch } from 'redux'
import { $do } from '../../../actions/actions'
import { connect } from 'react-redux'
import InfoRow from './components/InfoRow'

interface InfoWidgetOwnProps {
    meta: WidgetInfoMeta
    containerStyle?: string
}

interface InfoWidgetProps extends InfoWidgetOwnProps {
    cursor: string
    data: DataItem
    fields: RowMetaField[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
}

/**
 *
 * @param props
 * @category Widgets
 */
const InfoWidget: React.FunctionComponent<InfoWidgetProps> = props => {
    const options = props.meta.options
    const hiddenKeys: string[] = []
    const flattenWidgetFields = useFlatFormFields<WidgetInfoField>(props.meta.fields).filter(item => {
        if (!item.hidden) {
            return true
        } else {
            hiddenKeys.push(item.key)
            return false
        }
    })

    const InfoRows = options?.layout?.rows
        .filter(row => row.cols.find(col => !hiddenKeys.includes(col.fieldKey)))
        .map((row, index) => (
            <InfoRow
                key={index}
                meta={props.meta}
                data={props.data}
                flattenWidgetFields={flattenWidgetFields}
                fields={props.fields}
                onDrillDown={props.onDrillDown}
                row={row}
                cursor={props.cursor}
                index={index}
            />
        ))

    return (
        <div className={props.containerStyle}>
            <Row>{InfoRows}</Row>
        </div>
    )
}

const emptyObject = {}

function mapStateToProps(store: Store, ownProps: InfoWidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const bc = store.screen.bo.bc[bcName]
    const bcCursor = bc?.cursor
    const bcData = store.data[bcName]
    return {
        fields: bcUrl && store.view.rowMeta[bcName]?.[bcUrl]?.fields,
        data: bcData?.find(v => v.id === bcCursor) || emptyObject,
        cursor: bcCursor
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => {
            dispatch($do.userDrillDown({ widgetName, cursor, bcName, fieldKey }))
        }
    }
}

InfoWidget.displayName = 'InfoWidget'
/**
 * @category Widgets
 */
const ConnectedInfoWidget = connect(mapStateToProps, mapDispatchToProps)(InfoWidget)

export default ConnectedInfoWidget
