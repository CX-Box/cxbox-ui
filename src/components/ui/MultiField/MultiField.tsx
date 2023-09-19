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
import { WidgetField } from '../../../interfaces/widget'
import { DataItem } from '../../../interfaces/data'
import styles from './MultiField.less'
import Field from '../../Field/Field'
import cn from 'classnames'

export interface MultiFieldProps {
    bcName: string
    fields: WidgetField[]
    data: DataItem
    cursor: string
    widgetName: string
    style: 'inline' | 'list'
}

/**
 *
 * @param props
 * @category Components
 */
const MultiField: React.FunctionComponent<MultiFieldProps> = props => {
    const valuesStyle = props.style === 'list' ? styles.listValues : styles.inlineValues
    const valueStyle = props.style === 'list' ? styles.listValue : styles.inlineValue
    const multiValueStyle = props.style !== 'list' && styles.inlineMultiValue

    return (
        <div className={valuesStyle}>
            {props.fields.map(fieldMeta => {
                const data = props.data?.[fieldMeta.key]

                return data || data === 0 ? (
                    <div
                        key={fieldMeta.key}
                        className={valueStyle}
                        data-test="FIELD"
                        data-test-field-type={fieldMeta.type}
                        data-test-field-title={fieldMeta.label || fieldMeta.title}
                        data-test-field-key={fieldMeta.key}
                    >
                        <Field
                            bcName={props.bcName}
                            cursor={props.cursor}
                            widgetName={props.widgetName}
                            widgetFieldMeta={fieldMeta}
                            className={cn(multiValueStyle, {
                                [styles.listMultiValueDrillDownText]: fieldMeta.drillDown,
                                [styles.listMultiValueText]: !fieldMeta.drillDown
                            })}
                            readonly
                        />
                    </div>
                ) : null
            })}
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedMultiField = React.memo(MultiField)

export default MemoizedMultiField
