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

import React, { FunctionComponent, ComponentType } from 'react'
import cn from 'classnames'
import { RowMetaField } from '../../interfaces/rowMeta'
import { WidgetListField } from '../../interfaces/widget'
import ColumnFilter, { ColumnFilterOwnProps } from './ColumnFilter'
import ColumnSort from './ColumnSort'
import styles from './ColumnTitle.less'
import TemplatedTitle from '../TemplatedTitle/TemplatedTitle'
import { FieldType } from '../../interfaces/view'

/**
 * TODO: Rename to ColumnTitleProps in 2.0.0
 */
export interface ColumnTitle {
    widgetName: string
    /**
     * Field meta actually
     */
    widgetMeta: WidgetListField
    /**
     * Field row meta
     */
    rowMeta: RowMetaField
    components?: {
        filter?: ComponentType<ColumnFilterOwnProps>
    }
    className?: string
}

export const notSortableFields: readonly FieldType[] = [
    FieldType.multivalue,
    FieldType.multivalueHover,
    FieldType.multifield,
    FieldType.hidden,
    FieldType.fileUpload,
    FieldType.inlinePickList,
    FieldType.hint
]

/**
 *
 * @param props
 * @category Components
 */
export const ColumnTitle: FunctionComponent<ColumnTitle> = props => {
    if (!props.widgetMeta && !props.rowMeta) {
        return null
    }

    const title = <TemplatedTitle widgetName={props.widgetName} title={props.widgetMeta.title} />
    if (!props.rowMeta) {
        return (
            <div
                className={cn({
                    [styles.numberInputContainer]: props.widgetMeta.type === FieldType.number
                })}
            >
                {title}
            </div>
        )
    }

    const sort = !notSortableFields.includes(props.widgetMeta.type) && (
        <ColumnSort widgetName={props.widgetName} fieldKey={props.widgetMeta.key} className={styles.sort} />
    )

    const filter =
        props.rowMeta.filterable &&
        (props.components?.filter ? (
            <props.components.filter widgetName={props.widgetName} widgetMeta={props.widgetMeta} rowMeta={props.rowMeta} />
        ) : (
            <ColumnFilter widgetName={props.widgetName} widgetMeta={props.widgetMeta} rowMeta={props.rowMeta} />
        ))

    return (
        <div
            className={cn(styles.container, props.className, { [styles.numberInputContainer]: props.widgetMeta.type === FieldType.number })}
        >
            {title}
            {filter}
            {sort}
        </div>
    )
}

export default ColumnTitle
