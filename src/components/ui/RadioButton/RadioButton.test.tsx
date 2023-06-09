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
import { mount } from 'enzyme'
import RadioButton from './RadioButton'
import { FieldType } from '../../../interfaces/view'
import { BaseFieldProps } from '../../Field/Field'

describe('RadioButton component test', () => {
    const values = [{ value: 'testRadio-0' }, { value: 'testRadio-1' }, { value: 'testRadio-2' }]

    it('component should render 3 values', () => {
        const wrapper = mount(<RadioButton {...baseFieldProps} value={'testRadio-2'} values={values} />)
        const radios = wrapper.find('input[type="radio"]')
        const checkedRadio = wrapper.find('input[type="radio"][checked=true]')

        expect(wrapper.find(RadioButton).length).toBe(1)
        expect(radios.length).toBe(3)
        expect(checkedRadio.getDOMNode().getAttribute('value')).toEqual('2')
    })

    it('values is correctly switched', () => {
        const onChange = jest.fn(() => {
            wrapper.setProps({ value: 'testRadio-1' })
        })
        const wrapper = mount(<RadioButton {...baseFieldProps} values={values} onChange={onChange} />)
        const radios = wrapper.find('input[type="radio"]')
        radios.at(1).simulate('change')
        expect(onChange.mock.calls.length).toBe(1)

        const checkedRadio = wrapper.find('input[type="radio"][checked=true]')

        expect(checkedRadio.getDOMNode().getAttribute('value')).toEqual('1')
    })

    it('values is null or undefined', () => {
        const wrapper = mount(<RadioButton {...baseFieldProps} values={null} />)
        expect(wrapper.find(RadioButton).length).toBe(1)
        expect(wrapper.find('input[type="radio"]').length).toBe(0)
    })
})

const baseFieldProps: BaseFieldProps = {
    widgetName: 'widget-example',
    cursor: null,
    meta: {
        type: FieldType.radio,
        key: 'field-example'
    }
}
