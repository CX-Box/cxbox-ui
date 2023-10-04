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
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { Store } from '../../../interfaces/store'
import { DataValue, PendingDataItem } from '../../../interfaces/data'
import { RowMetaField } from '../../../interfaces/rowMeta'
import { $do } from '../../../actions/actions'
import styles from './CheckboxPicker.less'
import { buildBcUrl } from '../../../utils/strings'
import { ChangeDataItemPayload } from '../../Field/Field'

export interface CheckboxPickerOwnProps {
    fieldName: string
    fieldLabel: string
    bcName: string
    cursor: string
    readonly?: boolean
    value: DataValue
}

interface CheckboxPickerProps extends CheckboxPickerOwnProps {
    metaField: RowMetaField
    onChange: (payload: ChangeDataItemPayload) => void
}

/**
 *
 * @param props
 * @category Components
 */
const CheckboxPicker: React.FC<CheckboxPickerProps> = ({ metaField, bcName, cursor, fieldName, fieldLabel, value, readonly, onChange }) => {
    const handleChange = React.useCallback(
        (event: CheckboxChangeEvent) => {
            const dataItem: PendingDataItem = { [fieldName]: event.target.checked }
            const payload: ChangeDataItemPayload = {
                bcName,
                cursor,
                dataItem
            }
            onChange(payload)
        },
        [onChange, bcName, cursor, fieldName]
    )

    return (
        <div className={styles.container}>
            {
                <Checkbox
                    data-test-field-checkbox-item={true}
                    checked={value as boolean}
                    disabled={metaField?.disabled || readonly}
                    onChange={handleChange}
                >
                    {fieldLabel}
                </Checkbox>
            }
        </div>
    )
}

function mapStateToProps(store: Store, ownProps: CheckboxPickerOwnProps) {
    const bcUrl = buildBcUrl(ownProps.bcName, true)
    const metaField = bcUrl && store.view.rowMeta[ownProps.bcName]?.[bcUrl]?.fields?.find(field => field.key === ownProps.fieldName)
    return {
        metaField
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onChange: (payload: ChangeDataItemPayload) => {
            dispatch($do.changeDataItem(payload))
        }
    }
}

/**
 * @category Components
 */
export const ConnectedCheckboxPicker = connect(mapStateToProps, mapDispatchToProps)(CheckboxPicker)

export default ConnectedCheckboxPicker
