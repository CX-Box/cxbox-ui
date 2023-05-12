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
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import NumberInput from './NumberInput'
import { NumberTypes } from './formaters'
import React from 'react'
import { FieldType } from '../../../interfaces/view'
import { NumberFieldMeta } from '../../../interfaces/widget'

describe('NumberInput testing', () => {
    const fieldName = 'fieldName'
    const numberFieldMeta = { key: 'someInput', type: FieldType.number, label: fieldName }

    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
    })

    it('should render ReadOnly', () => {
        const wrapper = mount(
            <Provider store={store}>
                <NumberInput value={100} type={NumberTypes.number} readOnly={true} meta={numberFieldMeta as NumberFieldMeta} />
            </Provider>
        )
        expect(wrapper.find('Memo(ReadOnlyField)').length).toBe(1)
    })
})
