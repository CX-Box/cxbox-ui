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
import { Icon, Popover } from 'antd'
import { DataValue, MultivalueSingleValue } from '../../../interfaces/data'
import styles from './MultivalueHover.less'
import cn from 'classnames'
import SearchHighlight from '../SearchHightlight/SearchHightlight'
import { escapedSrc } from '../../../utils/strings'
import { useWidgetHighlightFilter } from '../../../hooks/useWidgetFilter'
import { BaseFieldProps } from '../../Field/Field'

export interface MultivalueHoverProps extends BaseFieldProps {
    data: MultivalueSingleValue[]
    displayedValue: DataValue
    onDrillDown?: () => void
    className?: string
    backgroundColor?: string
}

/**
 *
 * @param props
 * @category Components
 */
const Multivalue: React.FunctionComponent<MultivalueHoverProps> = props => {
    const filterKey = useWidgetHighlightFilter(props.widgetName, props.meta?.key)?.value?.toString()
    const filterValue = props.data?.find(bcDataItem => filterKey?.split(',')?.includes(bcDataItem.id))?.value.toString()
    const displayedItem =
        props.displayedValue !== undefined && props.displayedValue !== null ? (
            <p
                className={cn(styles.displayedValue, { [styles.coloredField]: props.backgroundColor }, props.className)}
                onClick={props.onDrillDown}
                style={props.backgroundColor ? { backgroundColor: props.backgroundColor } : null}
            >
                {filterValue ? (
                    <SearchHighlight
                        source={(props.displayedValue || '').toString()}
                        search={escapedSrc(filterValue)}
                        match={formatString => <b>{formatString}</b>}
                    />
                ) : (
                    props.displayedValue
                )}
            </p>
        ) : props.onDrillDown ? (
            <Icon className={cn(props.className)} type="left-circle" onClick={props.onDrillDown} />
        ) : null
    const fields = props.data.map((multivalueSingleValue, index) => {
        return (
            <div className={styles.multivalueFieldArea} key={index}>
                {multivalueSingleValue.options?.hint && <div className={styles.multivalueHint}>{multivalueSingleValue.options.hint}</div>}
                <div>{multivalueSingleValue.value}</div>
            </div>
        )
    })
    const content = <div className={styles.multivalueArea}>{fields}</div>
    return (
        <Popover content={content} trigger="hover" placement="topLeft">
            {displayedItem}
        </Popover>
    )
}

/**
 * @category Components
 */
const MemoizedMultivalue = React.memo(Multivalue)

export default MemoizedMultivalue
