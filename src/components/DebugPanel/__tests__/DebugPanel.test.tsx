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
import DebugPanel from '../DebugPanel'
import { WidgetMeta, WidgetTypes } from '../../../interfaces/widget'
import { Collapse } from 'antd'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { Provider } from 'react-redux'
import { BcMetaState } from '../../../interfaces/bc'
import { DataItem } from '@cxbox-ui/schema'

describe('DebugPanel testing', () => {
    let store: Store<CoreStore> = null
    const exampleBcName = 'bcExample'
    const widgetMeta: WidgetMeta = {
        name: 'name',
        bcName: exampleBcName,
        type: WidgetTypes.List,
        title: 'title',
        position: 1,
        gridWidth: 2,
        fields: []
    }
    const bc: BcMetaState = {
        url: 'standard',
        defaultFilter: '',
        filterGroups: null,
        defaultSort: null,
        cursor: '4229649',
        page: 1,
        limit: 20,
        hasNext: true,
        parentName: null,
        name: exampleBcName,
        loading: false
    }
    const data: DataItem[] = [
        {
            id: '4229649',
            vstamp: 7
        }
    ]
    const widgets: WidgetMeta[] = [widgetMeta]
    beforeAll(() => {
        store = mockStore()
        store.getState().view.widgets = widgets
        store.getState().screen.bo.bc[exampleBcName] = bc
        store.getState().data[exampleBcName] = data
    })

    it('should render', () => {
        const wrapper = mount(
            <Provider store={store}>
                <DebugPanel widgetMeta={widgetMeta} />
            </Provider>
        )
        expect(wrapper.find(Collapse).length).toBe(1)
    })
})
