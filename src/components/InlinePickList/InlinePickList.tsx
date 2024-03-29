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
import { DataItem, PickMap } from '../../interfaces/data'
import ReadOnlyField from '../ui/ReadOnlyField/ReadOnlyField'
import { ChangeDataItemPayload, BaseFieldProps } from '../Field/Field'
import Select from '../ui/Select/Select'
import { $do } from '../../index'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Icon } from 'antd'
import styles from './InlinePickList.less'
import { Store } from '../../interfaces/store'
import { useDebounce } from '../../hooks/useDebounce'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'

interface InlinePickListOwnProps extends BaseFieldProps {
    fieldName: string
    searchSpec: string
    bcName: string
    popupBcName: string
    pickMap: PickMap
    value?: string
    placeholder?: string
}

interface InlinePickListProps extends InlinePickListOwnProps {
    data: DataItem[]
    onClick: (bcName: string, pickMap: PickMap, widgetName?: string) => void
    onChange: (payload: ChangeDataItemPayload) => void
    onSearch: (bcName: string, searchSpec: string, searchString: string) => void
}

/**
 *
 * @param props
 * @category Components
 */
const InlinePickList: React.FunctionComponent<InlinePickListProps> = ({
    searchSpec,
    popupBcName,
    widgetName,
    pickMap,
    disabled,
    data,
    bcName,
    cursor,
    readOnly,
    className,
    meta,
    backgroundColor,
    value,
    placeholder,
    fieldName,
    onClick,
    onChange,
    onSearch,
    onDrillDown
}) => {
    const { t } = useTranslation()

    const [searchTerm, setSearchTerm] = React.useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    React.useEffect(() => {
        if (debouncedSearchTerm) {
            onSearch(popupBcName, searchSpec, searchTerm)
        }
    }, [debouncedSearchTerm, onSearch, popupBcName, searchSpec, searchTerm])

    const handleClick = React.useCallback(() => {
        if (!disabled) {
            onClick(popupBcName, pickMap, widgetName)
        }
    }, [disabled, popupBcName, pickMap, onClick, widgetName])

    const handleChange = React.useCallback(
        (valueKey: string) => {
            const row = data.find(item => item.id === valueKey)
            Object.keys(pickMap).forEach(field => {
                onChange({
                    bcName,
                    cursor,
                    dataItem: { [field]: row ? row[pickMap[field]] : '' }
                })
            })
        },
        [onChange, pickMap, bcName, cursor, data]
    )

    if (readOnly) {
        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={meta}
                className={className}
                backgroundColor={backgroundColor}
                onDrillDown={onDrillDown}
            >
                {value}
            </ReadOnlyField>
        )
    }

    return (
        <span className={styles.inlinePickList}>
            <Select
                disabled={disabled}
                value={value}
                allowClear={!!value}
                clearIcon={<Icon data-test-field-inlinepicklist-clear={true} type="close-circle" theme="filled" />}
                showSearch
                placeholder={placeholder ?? t('Enter value')}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={setSearchTerm}
                onChange={handleChange}
                notFoundContent={null}
                className={className}
            >
                {data.map(item => {
                    const title = item[pickMap[fieldName]] as string
                    return (
                        <Select.Option title={title} key={item.id} value={item.id}>
                            <span data-test-field-inlinepicklist-item={true}>{title}</span>
                        </Select.Option>
                    )
                })}
            </Select>
            <span className={cn(styles.buttonContainer, { [styles.disabledButton]: disabled })} onClick={!disabled ? handleClick : null}>
                <Icon data-test-field-inlinepicklist-popup={true} type="paper-clip" />
            </span>
        </span>
    )
}

const emptyData: DataItem[] = []
function mapStateToProps(store: Store, ownProps: InlinePickListOwnProps) {
    return {
        data: store.data[ownProps.popupBcName] || emptyData
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onChange: (payload: ChangeDataItemPayload) => {
        return dispatch($do.changeDataItem(payload))
    },
    onClick: (bcName: string, pickMap: PickMap, widgetName?: string) => {
        dispatch($do.showViewPopup({ bcName }))
        dispatch($do.viewPutPickMap({ map: pickMap, bcName }))
    },
    onSearch: (bcName: string, searchSpec: string, searchString: string) => {
        dispatch($do.inlinePickListFetchDataRequest({ bcName, searchSpec, searchString }))
    }
})

/**
 * @category Components
 */
export default connect(mapStateToProps, mapDispatchToProps)(InlinePickList)
