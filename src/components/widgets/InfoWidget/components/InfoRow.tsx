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
import { Col, Row } from 'antd'
import styles from './InfoRow.less'
import cn from 'classnames'
import InfoCell from './InfoCell'
import { LayoutRow, WidgetInfoField, WidgetInfoMeta } from '../../../../interfaces/widget'
import { DataItem } from '../../../../interfaces/data'
import { RowMetaField } from '../../../../interfaces/rowMeta'

export interface InfoRowProps {
    meta: WidgetInfoMeta
    data: DataItem
    flattenWidgetFields: WidgetInfoField[]
    fields: RowMetaField[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    row: LayoutRow
    cursor: string
    index: number
}
const InfoRow: React.FunctionComponent<InfoRowProps> = props => {
    const totalWidth = props.row.cols.reduce((prev, current) => prev + current.span, 0)
    return (
        <Row className={styles.rowWrapper}>
            <Col span={24} className={cn({ [styles.extraWidth]: totalWidth > 24 })}>
                {props.row.cols
                    .filter(field => {
                        const meta = props.fields?.find(item => item.key === field.fieldKey)
                        return meta ? !meta.hidden : true
                    })
                    .map((col, colIndex) => {
                        return (
                            <InfoCell
                                key={colIndex}
                                row={props.row}
                                col={col}
                                cursor={props.cursor}
                                meta={props.meta}
                                data={props.data}
                                flattenWidgetFields={props.flattenWidgetFields}
                                onDrillDown={props.onDrillDown}
                            />
                        )
                    })}
            </Col>
        </Row>
    )
}

export default React.memo(InfoRow)
