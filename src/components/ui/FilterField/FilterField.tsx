

/**
 * Decides what control will be used for specific field type
 */

import React from 'react'
import { CheckboxFilter } from '../CheckboxFilter/CheckboxFilter'
import { DataValue } from '../../../interfaces/data'
import { FieldType } from '../../../interfaces/view'
import { Checkbox, DatePicker, Icon, Input } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import moment, { Moment } from 'moment'
import { WidgetListField, WidgetMeta } from '../../../interfaces/widget'
import { RowMetaField } from '../../../interfaces/rowMeta'
import { getFormat } from '../DatePickerField/DatePickerField'
import RangePicker from './components/RangePicker'

export interface ColumnFilterControlProps {
    widgetFieldMeta: WidgetListField
    rowFieldMeta: RowMetaField
    value: DataValue | DataValue[]
    onChange: (value: DataValue | DataValue[]) => void
    widgetOptions?: WidgetMeta['options']
}

/**
 *
 * @param props
 * @category Components
 */
export const ColumnFilterControl: React.FC<ColumnFilterControlProps> = props => {
    switch (props.widgetFieldMeta.type) {
        case FieldType.dictionary:
        case FieldType.pickList: {
            return (
                <CheckboxFilter
                    title={props.widgetFieldMeta.title}
                    value={props.value as DataValue[]}
                    filterValues={props.rowFieldMeta.filterValues}
                    onChange={props.onChange}
                />
            )
        }
        case FieldType.checkbox: {
            return (
                <Checkbox
                    onChange={(e: CheckboxChangeEvent) => {
                        props.onChange(e.target.checked)
                    }}
                />
            )
        }
        case FieldType.dateTimeWithSeconds:
            if (props.widgetOptions?.filterDateByRange) {
                return (
                    <RangePicker
                        value={props.value as DataValue[]}
                        onChange={v => props.onChange(v)}
                        format={getFormat(false, true)}
                        showTime={{ format: 'HH:mm:ss' }}
                    />
                )
            }
            return (
                <DatePicker
                    autoFocus
                    onChange={(date: Moment, dateString: string) => {
                        props.onChange(date?.toISOString())
                    }}
                    value={props.value ? moment(props.value as string, moment.ISO_8601) : null}
                    format={getFormat()}
                />
            )

        case FieldType.dateTime:
            if (props.widgetOptions?.filterDateByRange) {
                return (
                    <RangePicker
                        value={props.value as DataValue[]}
                        onChange={v => props.onChange(v)}
                        format={getFormat(true)}
                        showTime={{ format: 'HH:mm' }}
                    />
                )
            }
            return (
                <DatePicker
                    autoFocus
                    onChange={(date: Moment, dateString: string) => {
                        props.onChange(date?.toISOString())
                    }}
                    value={props.value ? moment(props.value as string, moment.ISO_8601) : null}
                    format={getFormat()}
                />
            )

        case FieldType.date: {
            if (props.widgetOptions?.filterDateByRange) {
                return (
                    <RangePicker
                        value={props.value as DataValue[]}
                        onChange={v => props.onChange(v)}
                        format={getFormat()}
                        dateOnly={true}
                    />
                )
            }
            return (
                <DatePicker
                    autoFocus
                    onChange={(date: Moment, dateString: string) => {
                        props.onChange(date?.toISOString())
                    }}
                    value={props.value ? moment(props.value as string, moment.ISO_8601) : null}
                    format={getFormat()}
                />
            )
        }
        case FieldType.input:
        case FieldType.text:
        case FieldType.number:
        default: {
            return (
                <Input
                    autoFocus
                    value={props.value as string}
                    suffix={<Icon type="search" />}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const textValue = e.target.value.substr(0, 100)
                        props.onChange(textValue || null)
                    }}
                />
            )
        }
    }
}

/**
 * @category Components
 */
const MemoizedColumnFilterControl = React.memo(ColumnFilterControl)

export default MemoizedColumnFilterControl
