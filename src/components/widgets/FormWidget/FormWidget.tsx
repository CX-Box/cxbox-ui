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

import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Form, Row, Col } from 'antd'
import { Store } from '../../../interfaces/store'
import { WidgetFormMeta, WidgetFormField } from '../../../interfaces/widget'
import { RowMetaField } from '../../../interfaces/rowMeta'
import { buildBcUrl } from '../../../utils/strings'
import Field from '../../Field/Field'
import { useFlatFormFields } from '../../../hooks/useFlatFormFields'
import styles from './FormWidget.less'
import cn from 'classnames'
import { FieldType, PendingValidationFails, PendingValidationFailsFormat } from '../../../interfaces/view'
import TemplatedTitle from '../../TemplatedTitle/TemplatedTitle'

interface FormWidgetOwnProps {
    meta: WidgetFormMeta
}

interface FormWidgetProps extends FormWidgetOwnProps {
    cursor: string
    fields: RowMetaField[]
    metaErrors: Record<string, string>
    missingFields: Record<string, string>
}

/**
 *
 * @param props
 * @category Widgets
 */
export const FormWidget: FunctionComponent<FormWidgetProps> = ({ meta, fields, missingFields, metaErrors, cursor }) => {
    const hiddenKeys: string[] = []
    const flattenWidgetFields = useFlatFormFields<WidgetFormField>(meta.fields).filter(item => {
        const isHidden = item.type === FieldType.hidden || item.hidden
        if (isHidden) {
            hiddenKeys.push(item.key)
        }
        return !isHidden
    })
    const { bcName, name } = meta

    const memoizedFields = React.useMemo(() => {
        return (
            <Row gutter={24}>
                {meta.options?.layout?.rows.map((row, index) => {
                    return (
                        <Row key={index}>
                            {row.cols
                                .filter(field => {
                                    const fieldMeta = fields?.find(item => item.key === field.fieldKey)
                                    return fieldMeta ? !fieldMeta.hidden : true
                                })
                                .filter(col => !hiddenKeys.includes(col.fieldKey))
                                .map((col, colIndex) => {
                                    const field = flattenWidgetFields.find(item => item.key === col.fieldKey)
                                    const disabled = fields?.find(item => item.key === field.key && item.disabled)
                                    const error = (!disabled && missingFields?.[field.key]) || metaErrors?.[field.key]

                                    return (
                                        <Col
                                            key={colIndex}
                                            span={col.span}
                                            className={cn({ [styles.colWrapper]: row.cols.length > 1 || col.span !== 24 })}
                                        >
                                            <Form.Item
                                                data-test="FIELD"
                                                data-test-field-type={field.type}
                                                data-test-field-title={field.label || field.title}
                                                data-test-field-key={field.key}
                                                label={
                                                    field.type === 'checkbox' ? null : (
                                                        <TemplatedTitle widgetName={meta.name} title={field.label} />
                                                    )
                                                }
                                                validateStatus={error ? 'error' : undefined}
                                                help={error ? <div data-test-error-text={true}>{error}</div> : undefined}
                                            >
                                                <Field
                                                    bcName={bcName}
                                                    cursor={cursor}
                                                    widgetName={name}
                                                    widgetFieldMeta={field}
                                                    disableHoverError={meta.options?.disableHoverError}
                                                />
                                            </Form.Item>
                                        </Col>
                                    )
                                })}
                        </Row>
                    )
                })}
            </Row>
        )
    }, [bcName, name, cursor, flattenWidgetFields, missingFields, metaErrors, hiddenKeys, fields, meta])

    return (
        <Form colon={false} layout="vertical">
            {memoizedFields}
        </Form>
    )
}

function mapStateToProps(store: Store, ownProps: FormWidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bc = store.screen.bo.bc[bcName]
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]
    const fields = rowMeta?.fields
    const metaErrors = rowMeta?.errors
    const cursor = bc?.cursor
    const missingFields =
        store.view.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            ? (store.view.pendingValidationFails as PendingValidationFails)?.[bcName]?.[cursor]
            : store.view.pendingValidationFails
    return {
        cursor,
        fields,
        metaErrors,
        missingFields
    }
}

/**
 * @category Widgets
 */
const ConnectedFormWidget = connect(mapStateToProps)(FormWidget)

export default ConnectedFormWidget
