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
import { Tag, Icon } from 'antd'
import { MultivalueSingleValue } from '../../../interfaces/data'
import { MultivalueFieldMeta } from '../../../interfaces/widget'
import styles from './MultivalueTag.less'
import cn from 'classnames'

export interface MultivalueTagProps {
    disabled: boolean
    placeholder?: string
    value: MultivalueSingleValue[]
    widgetFieldMeta: MultivalueFieldMeta
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of `widgetName`
     */
    bcName: string
    widgetName?: string
    loading?: boolean
    page: number
    metaError: string
    onPopupOpen: (bcName: string, widgetFieldMeta: MultivalueFieldMeta, page: number, widgetName?: string) => void
    onChange: (newValue: MultivalueSingleValue[], removedValue: MultivalueSingleValue) => void
}

/**
 *
 * @param props
 * @category Components
 */
const MultivalueTag: React.FunctionComponent<MultivalueTagProps> = ({
    loading,
    disabled,
    onPopupOpen,
    bcName,
    widgetName,
    page,
    widgetFieldMeta,
    metaError,
    value,
    placeholder,
    onChange
}) => {
    const handleOpen = React.useCallback(() => {
        if (!disabled) {
            onPopupOpen(bcName, widgetFieldMeta, page, widgetName)
        }
    }, [disabled, onPopupOpen, bcName, page, widgetFieldMeta, widgetName])

    const handleDeleteTag = React.useCallback(
        (recordId: string) => {
            if (!disabled) {
                onChange(
                    value.filter(item => item.id !== recordId),
                    value.find(item => item.id === recordId)
                )
            }
        },
        [onChange, value, disabled]
    )

    return (
        <div
            className={cn(styles.multivalue, { [styles.disabled]: disabled, [styles.error]: metaError })}
            onClick={loading && disabled ? undefined : handleOpen}
        >
            <div data-text={placeholder} className={cn(styles.enabled, { [styles.disabled]: disabled })}>
                {(value || []).map(val => {
                    return (
                        <Tag
                            data-test-field-multivalue-current-item={true}
                            onClick={e => {
                                e.stopPropagation()
                            }}
                            title={val.value}
                            closable={!disabled && !loading}
                            id={val.id}
                            key={val.id}
                            onClose={() => {
                                handleDeleteTag(val.id)
                            }}
                        >
                            {val.value}
                        </Tag>
                    )
                })}
            </div>
            <div className={cn(styles.iconContainer, { [styles.disabled]: disabled })}>
                <Icon data-test-field-multivalue-popup={true} type={loading ? 'loading' : 'folder-open'} spin={loading} />
            </div>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedMultivalueTag = React.memo(MultivalueTag)

export default MemoizedMultivalueTag
