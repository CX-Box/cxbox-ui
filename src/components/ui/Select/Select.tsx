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
import { Select as AntdSelect } from 'antd'
import { SelectProps as AntdSelectProps, SelectValue } from 'antd/lib/select'

export type SelectProps = AntdSelectProps & {
    forwardedRef?: React.RefObject<AntdSelect<string>>
}

/**
 * Wrapper for original rc-select due to performance problems with last version
 * https://github.com/react-component/select/issues/378
 *
 * @category Components
 */
export class Select<T = SelectValue> extends React.PureComponent<SelectProps> {
    /**
     * STUB
     */
    static Option = AntdSelect.Option

    /**
     * STUB
     */
    render() {
        const extendedProps: any = {
            ...this.props,
            transitionName: ''
        }

        return <AntdSelect {...extendedProps} className={this.props.className} ref={this.props.forwardedRef} />
    }
}

/**
 * @category Components
 */
export default Select
