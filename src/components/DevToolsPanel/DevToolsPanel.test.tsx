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

import { shallow } from 'enzyme'
import DevToolsPanel from './DevToolsPanel'
import React from 'react'
import { Button } from 'antd'

describe('DevToolsPanel', () => {
    it('should render buttons and client controls', () => {
        const wrapper = shallow(
            <DevToolsPanel>
                <Button icon="icon-close" />
                <Button icon="down-circle" />
            </DevToolsPanel>
        )
        expect(wrapper.find('Memo(RefreshMetaButton)').length).toBe(1)
        expect(wrapper.find('Memo(DebugModeButton)').length).toBe(1)
        expect(wrapper.find('Button').findWhere(i => i.props().icon === 'icon-close').length).toBe(1)
        expect(wrapper.find('Button').findWhere(i => i.props().icon === 'down-circle').length).toBe(1)
    })
})
