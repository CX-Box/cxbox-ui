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
import WidgetErrorBoundary from './WidgetErrorBoundary'
import { WidgetTextMeta } from '../../interfaces/widget'
import { WidgetTypes } from '@cxbox-ui/schema'
import React from 'react'
import { Store } from 'redux'
import { Store as CoreStore } from '../../interfaces/store'
import { mockStore } from '../../tests/mockStore'
import { Provider } from 'react-redux'

describe('WidgetErrorBoundary test', function () {
    const meta: WidgetTextMeta = {
        name: 'name',
        title: 'title',
        bcName: 'test',
        fields: [],
        gridWidth: 2,
        position: 1,
        type: WidgetTypes.Text,
        description: 'test text',
        descriptionTitle: 'test title'
    }
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
        store.getState().view.widgets = [meta]
    })
    afterAll(() => {
        jest.clearAllMocks()
    })
    it('should render with DebugPanel and "msg"', function () {
        const ThrowError = () => {
            throw new Error('Test')
        }
        const wrapper = mount(
            <Provider store={store}>
                <WidgetErrorBoundary meta={meta} msg="test msg">
                    <ThrowError />
                </WidgetErrorBoundary>
            </Provider>
        )
        expect(wrapper.find('.errorMessage').props().children).toBe('Test')
        expect(wrapper.find('Memo(DebugPanel)')).toHaveLength(1)
        expect((wrapper.find('.stackContainer').props().children as React.ReactNode[])[0]).toBe('test msg')
        expect(wrapper.find('.errorStack')).toHaveLength(1)
    })
    it('should render error message and stack only', function () {
        const ThrowError = () => {
            throw new Error('Test')
        }
        const wrapper = mount(
            <Provider store={store}>
                <WidgetErrorBoundary>
                    <ThrowError />
                </WidgetErrorBoundary>
            </Provider>
        )
        expect(wrapper.find('.errorMessage').props().children).toBe('Test')
        expect(wrapper.find('.errorStack')).toHaveLength(1)
        expect(wrapper.find('Memo(DebugPanel)')).toHaveLength(0)
    })
})
