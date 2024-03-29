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

import React, { useState } from 'react'
import { DatePicker } from 'antd'
import { DatePickerProps } from 'antd/lib/date-picker/interface'
import { DataValue } from '@cxbox-ui/schema'
import moment, { Moment } from 'moment'
import styles from './RangePicker.less'
import { useTranslation } from 'react-i18next'

interface RangePickerProps extends Omit<DatePickerProps, 'onChange' | 'value'> {
    dateOnly?: boolean
    onChange: (v: DataValue[]) => void
    value: DataValue[]
}

function RangePicker({ value, onChange, dateOnly, ...rest }: RangePickerProps) {
    const startDate = Array.isArray(value) && value?.[0] ? moment(value[0] as string, moment.ISO_8601) : null
    const endDate = Array.isArray(value) && value?.[1] ? moment(value[1] as string, moment.ISO_8601) : null
    const [endOpen, setEndOpen] = useState(false)

    const disabledStartDate = (startValue: Moment) => {
        if (!startValue || !endDate) {
            return false
        }
        return startValue.valueOf() > endDate.valueOf()
    }

    const disabledEndDate = (endValue: Moment) => {
        if (!endValue || !startDate) {
            return false
        }
        return endValue.valueOf() <= startDate.valueOf()
    }

    const handleStartOpenChange = (open: boolean) => {
        if (!open) {
            setEndOpen(true)
        }
    }

    const handleEndOpenChange = (open: boolean) => {
        setEndOpen(open)
    }

    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <DatePicker
                {...rest}
                data-test-filter-popup-start-value={true}
                placeholder={t('Start date')}
                disabledDate={disabledStartDate}
                onChange={(date: Moment, dateString: string) => {
                    onChange([dateOnly ? date?.startOf('day').toISOString() : date?.toISOString(), endDate?.toISOString()])
                }}
                value={startDate}
                onOpenChange={handleStartOpenChange}
            />
            <DatePicker
                {...rest}
                data-test-filter-popup-end-value={true}
                placeholder={t('End date')}
                disabledDate={disabledEndDate}
                onChange={(date: Moment, dateString: string) => {
                    onChange([startDate?.toISOString(), dateOnly ? date?.endOf('day').toISOString() : date?.toISOString()])
                }}
                value={endDate}
                open={endOpen}
                onOpenChange={handleEndOpenChange}
            />
        </div>
    )
}

export default React.memo(RangePicker)
