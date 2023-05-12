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

import { mount } from 'enzyme'
import React from 'react'
import RefreshButton from './RefreshButton'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'

describe('RefreshButton test', function () {
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
    })
    afterAll(() => {
        jest.clearAllMocks()
    })
    it('should render and handle click', function () {
        const wrapper = mount(
            <Provider store={store}>
                <RefreshButton />
            </Provider>
        )
        wrapper.find('button').at(0).simulate('click')
        expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: null, type: 'refreshMetaAndReloadPage' }))
    })
})
