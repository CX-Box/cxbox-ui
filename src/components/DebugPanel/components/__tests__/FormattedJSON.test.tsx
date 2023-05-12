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
import React from 'react'
import FormattedJSON from '../FormattedJSON'

describe('FormattedJSON testing', () => {
    const ex = {
        name: 'name',
        bcName: 'exampleBcName',
        type: 'List',
        title: 'title',
        position: 1,
        gridWidth: 2,
        fields: [] as any
    }

    it('should render', () => {
        const wrapper = shallow(<FormattedJSON json={ex} />)
        expect(wrapper.find('code').length).toBe(1)
    })
})
