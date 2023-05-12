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
import { mockStore } from '../../../../tests/mockStore'
import { Store as CoreStore } from '../../../../interfaces/store'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import ViewInfoLabel from '../ViewInfoLabel'

describe('ViewInfoLabel', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'some screen name'
        store.getState().view.name = 'some view name'
    })

    it('should render', () => {
        const wrapper = mount(
            <Provider store={store}>
                <ViewInfoLabel />
            </Provider>
        )
        expect(wrapper.find('span').findWhere(i => i.text() === 'Screen').length).toBeGreaterThan(0)
        expect(wrapper.find('span').findWhere(i => i.text() === 'View').length).toBeGreaterThan(0)
    })
})
