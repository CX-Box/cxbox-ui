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

import { Store } from 'redux'
import { Store as CoreStore } from '../../../../interfaces/store'
import { mockStore } from '../../../../tests/mockStore'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import React from 'react'
import RefreshMetaButton from '../RefreshMetaButton'
import { $do } from '../../../../actions/actions'

describe('RefreshMetaButton', () => {
    let store: Store<CoreStore> = null
    const dispatchMock = jest.fn()

    beforeAll(() => {
        store = mockStore()
    })
    beforeEach(() => {
        jest.spyOn(store, 'dispatch').mockImplementation(dispatchMock)
    })
    afterEach(() => {
        dispatchMock.mockRestore()
    })
    it('should render button and handle click', () => {
        const wrapper = mount(
            <Provider store={store}>
                <RefreshMetaButton />
            </Provider>
        )
        const button = wrapper.find('Button').findWhere(i => i.props().icon === 'sync')
        expect(wrapper.find('Tooltip').findWhere(i => i.props().title === 'Refresh meta').length).toBeGreaterThan(0)
        button.simulate('click')
        expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining($do.refreshMeta(null)))
    })
})
