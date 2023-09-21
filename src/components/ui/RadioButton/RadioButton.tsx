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
import { Radio } from 'antd'
import ReadOnlyField from '../ReadOnlyField/ReadOnlyField'
import { RadioChangeEvent } from 'antd/es/radio'
import { getIconByParams } from '../Dictionary/Dictionary'
import { BaseFieldProps } from '../../../components/Field/Field'

export interface RadioButtonProps extends BaseFieldProps {
    value?: string | null
    onChange?: (value: string) => void
    values: Array<{ value: string; icon?: string }>
    style?: React.CSSProperties
}

/**
 *
 * @param props
 * @category Components
 */
const RadioButton: React.FunctionComponent<RadioButtonProps> = ({
    value,
    values,
    style,
    readOnly,
    widgetName,
    meta,
    className,
    backgroundColor,
    disabled,
    onChange,
    onDrillDown
}) => {
    const handleOnChange = React.useCallback(
        (e: RadioChangeEvent) => {
            let newValue: string

            if (values) {
                const valueId = Number(e.target.value)
                newValue = values[valueId]?.value
                onChange?.(newValue || '')
            }
        },
        [values, onChange]
    )

    let valueIndex: number

    if (value && values) {
        valueIndex = values.findIndex(v => v.value === value)
    }

    if (readOnly) {
        const readOnlyValue = value ?? ''

        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={meta}
                className={className}
                backgroundColor={backgroundColor}
                onDrillDown={onDrillDown}
            >
                {readOnlyValue}
            </ReadOnlyField>
        )
    }

    return (
        <Radio.Group
            onChange={handleOnChange}
            disabled={disabled}
            value={valueIndex >= 0 ? valueIndex.toString() : value}
            className={className}
        >
            {values?.map((el, index) => (
                <Radio value={index.toString()} key={index}>
                    <span>
                        {el.icon && getIconByParams(el.icon)}
                        <span data-test-field-radiobutton-item={true}>{el.value}</span>
                    </span>
                </Radio>
            ))}
        </Radio.Group>
    )
}

/**
 * @category Components
 */
const MemoizedRadioButton = React.memo(RadioButton)

export default MemoizedRadioButton
