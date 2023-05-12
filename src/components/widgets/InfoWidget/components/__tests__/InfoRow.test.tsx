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
import * as React from 'react'
import InfoRow, { InfoRowProps } from '../InfoRow'
import { WidgetTypes } from '../../../../../interfaces/widget'
import { FieldType } from '../../../../../interfaces/view'

describe('InfoRow test', () => {
    const props: InfoRowProps = {
        cursor: '5000',
        data: { id: '5000', vstamp: 3, name: 'Test Name', number: '123456' },
        fields: [
            {
                key: 'name',
                currentValue: 'Test Name',
                disabled: true,
                forceActive: false,
                ephemeral: false,
                hidden: false
            },
            {
                key: 'number',
                currentValue: '123456',
                disabled: true,
                forceActive: false,
                ephemeral: false,
                hidden: false
            }
        ],
        flattenWidgetFields: [
            { label: '#', key: 'number', type: FieldType.input },
            { label: 'Name', key: 'name', type: FieldType.input }
        ],
        index: 10,
        meta: {
            name: 'testInfo',
            type: WidgetTypes.Info,
            title: 'Test Info',
            bcName: 'testBcName',
            gridWidth: 2,
            position: 1,
            fields: [
                {
                    blockId: 1,
                    name: 'AAA',
                    fields: [
                        { label: '#', key: 'number', type: FieldType.input },
                        { label: 'Name', key: 'name', type: FieldType.input }
                    ]
                }
            ]
        },
        onDrillDown: jest.fn(),
        row: {
            cols: [
                {
                    fieldKey: 'name',
                    span: 10
                }
            ]
        }
    }

    it('should render one InfoCell', () => {
        const wrapper = shallow(<InfoRow {...props} />)
        expect(wrapper.find('Memo(InfoCell)').length).toEqual(1)
    })

    it('should render no one InfoCell', () => {
        const noCellProps = { ...props }
        noCellProps.fields[0].hidden = true
        const wrapper = shallow(<InfoRow {...noCellProps} />)
        expect(wrapper.find('Memo(InfoCell)').length).toEqual(0)
    })
})
