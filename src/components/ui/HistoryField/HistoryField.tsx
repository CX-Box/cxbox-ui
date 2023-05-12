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
import Field from '../../Field/Field'
import { DataItem } from '../../../interfaces/data'
import styles from './HistoryField.less'
import { FieldType } from '../../../interfaces/view'
import { diffWords } from 'diff'
import cn from 'classnames'

export interface HistoryFieldProps {
    fieldMeta: WidgetField
    data: DataItem
    bcName: string
    cursor: string
    widgetName: string
}

/**
 *
 * @param props
 * @category Components
 */
const HistoryField: React.FunctionComponent<HistoryFieldProps> = props => {
    const prevValue = ((props.fieldMeta.snapshotKey && props.data?.[props.fieldMeta.snapshotKey]) || '').toString()
    const currentValue = (props.data?.[props.fieldMeta.key] || '').toString()

    if (props.fieldMeta.type === FieldType.text) {
        return (
            <div>
                {diffWords(prevValue, currentValue || '').map((item, index) => {
                    return (
                        <span
                            key={index}
                            className={cn({
                                [styles.addedWord]: item.added,
                                [styles.removedWord]: item.removed
                            })}
                        >
                            {item.value}
                        </span>
                    )
                })}
            </div>
        )
    }

    if (prevValue === currentValue) {
        return (
            <Field
                bcName={props.bcName}
                cursor={props.cursor}
                widgetName={props.widgetName}
                widgetFieldMeta={props.fieldMeta}
                readonly
                historyMode
            />
        )
    }

    return (
        <div className={styles.container}>
            {prevValue && (
                <div>
                    <div className={styles.prevValue}>
                        <Field
                            bcName={props.bcName}
                            cursor={props.cursor}
                            widgetName={props.widgetName}
                            widgetFieldMeta={props.fieldMeta}
                            readonly
                            historyMode
                            forcedValue={prevValue}
                            disableDrillDown
                        />
                    </div>
                </div>
            )}
            {currentValue && (
                <div>
                    <div className={styles.newValue}>
                        <Field
                            bcName={props.bcName}
                            cursor={props.cursor}
                            widgetName={props.widgetName}
                            widgetFieldMeta={props.fieldMeta}
                            readonly
                            historyMode
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedHistoryField = React.memo(HistoryField)

export default MemoizedHistoryField
