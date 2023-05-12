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
import { NavigationWidgetMeta } from '../../../interfaces/widget'
import { WidgetTypes } from '@cxbox-ui/schema'
import { shallow } from 'enzyme'
import NavigationTabsWidget from './NavigationTabsWidget'
import NavigationTabs from '../../ui/NavigationTabs/NavigationTabs'

describe('NavigationTabsWidget test', () => {
    const meta: NavigationWidgetMeta = {
        name: 'NavigationWidgetMeta',
        title: '',
        position: 0,
        gridWidth: 4,
        bcName: '',
        type: WidgetTypes.NavigationTabs,
        fields: [],
        options: {
            navigationLevel: 2
        }
    }

    it('should render', () => {
        const wrapper = shallow(<NavigationTabsWidget meta={meta} />)
        expect(wrapper.find('Memo(NavigationTabs)').findWhere(i => i.props().navigationLevel === 2).length).toBe(1)
    })

    it('should render as first level when `navigationLevel` option is missing', () => {
        let wrapper = shallow(<NavigationTabsWidget meta={{ ...meta, options: {} }} />)
        expect(wrapper.find(NavigationTabs).length).toBe(1)
        expect(wrapper.find(NavigationTabs).props().navigationLevel).toBe(1)
        wrapper = shallow(<NavigationTabsWidget meta={{ ...meta, options: undefined }} />)
        expect(wrapper.find(NavigationTabs).length).toBe(1)
        expect(wrapper.find(NavigationTabs).props().navigationLevel).toBe(1)
    })
})
