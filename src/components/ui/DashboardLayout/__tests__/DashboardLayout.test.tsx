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
import { shallow } from 'enzyme'
import { DashboardLayout } from '../DashboardLayout'
import { WidgetMeta, WidgetTypes } from '../../../../interfaces/widget'
import { Widget } from '../../../index'

describe('DashboardLayout testing', () => {
    const widgets: WidgetMeta[] = [
        {
            name: 'name',
            bcName: 'bcName',
            type: WidgetTypes.List,
            title: 'title',
            position: 1,
            gridWidth: 2,
            fields: []
        }
    ]

    it('should render widgets', () => {
        const wrapper = shallow(<DashboardLayout widgets={widgets} />)
        expect(wrapper.find(Widget).length).toBe(widgets.length)
    })

    it('should pass customSpinner', () => {
        const customSpinner: React.FunctionComponent<{ props: any }> = props => {
            return <div>customLayout</div>
        }
        customSpinner.displayName = 'customSpinner'
        const wrapper = shallow(<DashboardLayout widgets={widgets} customSpinner={customSpinner} />)
        expect(wrapper.find(Widget).props().customSpinner === customSpinner).toBeTruthy()
    })
})
