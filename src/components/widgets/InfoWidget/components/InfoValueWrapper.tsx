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

import cn from 'classnames'
import React, { ReactNode } from 'react'
import styles from './InfoValueWrapper.less'
import { Col } from 'antd'
import { LayoutCol, LayoutRow } from '../../../../interfaces/widget'

interface ValueWrapperProps {
    row: LayoutRow
    col: LayoutCol
    children?: ReactNode
}
export const InfoValueWrapper: React.FunctionComponent<ValueWrapperProps> = props => {
    return (
        <Col span={props.col.span}>
            <div className={cn(styles.fieldArea, { [styles.columnDirection]: props.row.cols.length > 1 })}>{props.children}</div>
        </Col>
    )
}

InfoValueWrapper.displayName = 'InfoValueWrapper'

export default React.memo(InfoValueWrapper)
