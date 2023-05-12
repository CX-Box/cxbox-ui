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

import { mockStore } from '../../../tests/mockStore'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mount, shallow } from 'enzyme'
import { Provider } from 'react-redux'
import React from 'react'
import AssocTable, { AssocTableOwnProps, mapDispatchToProps } from './AssocTable'
import { WidgetTypes } from '../../../interfaces/widget'
import { FieldType } from '../../../interfaces/view'

describe('AssocTable test', () => {
    let store: Store<CoreStore> = null
    const assocTableProps: AssocTableOwnProps = {
        meta: {
            name: 'name',
            bcName: 'bcName',
            fields: [
                {
                    title: 'aaa',
                    key: 'aaa',
                    type: FieldType.input
                }
            ],
            type: WidgetTypes.List,
            title: 'title',
            position: 1,
            gridWidth: 1
        }
    }
    beforeAll(() => {
        store = mockStore()
    })
    it('should render', () => {
        const wrapper = mount(
            <Provider store={store}>
                <AssocTable {...assocTableProps} />
            </Provider>
        )
        expect(wrapper.find('TableWidget').length).toBeGreaterThan(0)
    })
    // broken. Should simulate calls of `onSelect` and `onSelectAll`
    it.skip('should handle select', () => {
        const testStore = {
            ...store,
            data: {
                bcName: {
                    aaa: 'aaa'
                }
            }
        }
        const wrapper = mount(
            <Provider store={testStore}>
                <AssocTable {...assocTableProps} />
            </Provider>
        )
        const forSpyProps = shallow(wrapper.find('AssocTable').get(0)).props()
        const onSelectSpy = jest.spyOn(forSpyProps.rowSelection, 'onSelect')
        const onSelectAllSpy = jest.spyOn(forSpyProps.rowSelection, 'onSelectAll')
        console.log(shallow(wrapper.find('TableWidget').get(0)).debug())
        const checkbox = shallow(
            wrapper
                .find('Checkbox')
                .findWhere(i => i.prop('prefixCls') === 'ant-checkbox')
                .get(0)
        )
        checkbox.simulate('change', { target: { checked: true } })
        expect(onSelectSpy).toHaveBeenCalled()
        expect(onSelectAllSpy).toHaveBeenCalled()
        onSelectSpy.mockRestore()
        onSelectAllSpy.mockRestore()
    })
    it('should mapDispatchToProps', () => {
        const dispatch = jest.fn()
        mapDispatchToProps(dispatch).onSelect('bcName', {
            id: '1111',
            vstamp: 1,
            _associate: true
        })
        mapDispatchToProps(dispatch).onSelectAll(
            'bcName',
            ['111'],
            [
                {
                    id: '1111',
                    vstamp: 1,
                    _associate: true
                }
            ]
        )
        expect(dispatch.mock.calls[0][0].type).toEqual('changeDataItem')
        expect(dispatch.mock.calls[1][0].type).toEqual('changeDataItems')
    })
})
