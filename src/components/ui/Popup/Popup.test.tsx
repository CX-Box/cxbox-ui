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
import { Popup, PopupProps, widths } from './Popup'
import { shallow } from 'enzyme'
import { Modal } from 'antd'

describe('Popup test', () => {
    const defProps: PopupProps = {
        onOkHandler: jest.fn(),
        onCancelHandler: jest.fn(),
        children: <p>default child</p>,
        showed: true,
        bcName: 'bcName',
        widgetName: 'widgetName',
        disablePagination: true,
        defaultOkText: 'defaultOkText',
        defaultCancelText: 'defaultCancelText'
    }

    it('should be rendered with medium width as default', () => {
        const wrapper = shallow(<Popup {...defProps} />)
        expect(wrapper.find(Modal).length).toEqual(1)
        expect(wrapper.find(Modal).props().width).toEqual(widths.medium)
    })

    it('should accept custom width', () => {
        const customWidth = 111
        const wrapper = shallow(<Popup {...defProps} width={customWidth} />)
        expect(wrapper.find(Modal).props().width).toEqual(customWidth)
    })
})
