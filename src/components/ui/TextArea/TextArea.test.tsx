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
import { TextArea } from './TextArea'
import { shallow } from 'enzyme'
import { BaseFieldProps } from '../../Field/Field'
import { FieldType } from '../../../interfaces/view'

describe('TextArea test', () => {
    it('should render ReadOnlyField', () => {
        const wrapper = shallow(<TextArea {...baseFieldProps} defaultValue="test" readOnly />)
        expect(wrapper.find('Memo(ReadOnlyField)').findWhere(i => i.text() === 'test').length).toBeGreaterThan(0)
    })

    it('should render antd TextArea', () => {
        const wrapper = shallow(<TextArea {...baseFieldProps} defaultValue="test" />)
        expect(wrapper.find('TextArea').findWhere(i => i.prop('defaultValue') === 'test').length).toEqual(1)
    })

    it('should render antd Popover', () => {
        const wrapper = shallow(<TextArea {...baseFieldProps} defaultValue="test" popover />)
        expect(wrapper.find('Popover').length).toEqual(1)
    })
})

const baseFieldProps: BaseFieldProps = {
    widgetName: 'widget-example',
    cursor: null,
    meta: {
        type: FieldType.text,
        key: 'field-example'
    }
}
