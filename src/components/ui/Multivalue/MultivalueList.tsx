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
import { MultivalueSingleValue } from '../../../interfaces/data'
import { MultivalueFieldMeta } from '../../../interfaces/widget'
import styles from './MultivalueList.less'
import cn from 'classnames'
import MultiValueListRecord from '../../Multivalue/MultiValueListRecord'

export interface MultivalueListProps {
    fieldTitle: React.ReactNode
    field: MultivalueFieldMeta
    data: MultivalueSingleValue[]
    isFloat: boolean
    noLineSeparator: boolean
    isColumnDirection?: boolean
    className?: string
}

/**
 *
 * @param props
 * @category Components
 */
const MultivalueList: React.FunctionComponent<MultivalueListProps> = props => {
    return (
        <div
            key={`${props.field.key}_${props.field.label}`}
            className={cn(props.className, {
                [styles.fieldAreaFloat]: props.isFloat,
                [styles.fieldAreaBase]: !props.isFloat,
                [styles.noFieldSeparator]: props.noLineSeparator,
                [styles.fieldAreaDirection]: props.isColumnDirection
            })}
        >
            <div
                className={cn({
                    [styles.labelAreaFloat]: props.isFloat,
                    [styles.labelAreaBase]: !props.isFloat,
                    [styles.lableDirection]: props.isColumnDirection
                })}
            >
                {props.fieldTitle}
            </div>
            <div
                className={cn({
                    [styles.fieldDataFloat]: props.isFloat,
                    [styles.fieldDataBase]: !props.isFloat
                })}
            >
                {props.data.map((multivalueSingleValue, index) => {
                    return <MultiValueListRecord key={index} isFloat={props.isFloat} multivalueSingleValue={multivalueSingleValue} />
                })}
            </div>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedMultivalueList = React.memo(MultivalueList)

export default MemoizedMultivalueList
