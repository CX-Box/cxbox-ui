

import React from 'react'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { DataValue } from '../../../interfaces/data'
import cn from 'classnames'
import styles from './CheckboxFilter.less'

export interface CheckboxFilterProps {
    title: string
    value: DataValue[]
    filterValues: Array<{ value: string }>
    onChange?: (values: DataValue[]) => void
}

const emptyValue: DataValue[] = []

/**
 *
 * @param props
 * @category Components
 */
export const CheckboxFilter: React.FC<CheckboxFilterProps> = props => {
    const handleCheckbox = (e: CheckboxChangeEvent) => {
        const prevValues = props.value || emptyValue
        const newValues = e.target.checked ? [...prevValues, e.target.value] : prevValues.filter(item => item !== e.target.value)
        props.onChange?.(newValues.length ? newValues : null)
    }

    const handleAll = (e: CheckboxChangeEvent) => {
        const newValues = e.target.checked ? props.filterValues.map(item => item.value) : null
        props.onChange?.(newValues)
    }

    return (
        <div>
            <li className={cn(styles.listItem, styles.header)}>
                <Checkbox
                    className={styles.checkbox}
                    indeterminate={props.value?.length > 0 && props.value.length < props.filterValues.length}
                    checked={props.value?.length === props.filterValues.length}
                    onChange={handleAll}
                />
                {props.title}
            </li>
            <ul className={styles.list}>
                {props.filterValues.map((item, index) => {
                    const checked = props.value?.some(filterValue => item.value === filterValue)
                    return (
                        <li className={styles.listItem} key={index}>
                            <Checkbox checked={checked} className={styles.checkbox} value={item.value} onChange={handleCheckbox} />
                            {item.value}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

/**
 * @category Components
 */
export const MemoizedCheckboxFilter = React.memo(CheckboxFilter)

export default MemoizedCheckboxFilter
