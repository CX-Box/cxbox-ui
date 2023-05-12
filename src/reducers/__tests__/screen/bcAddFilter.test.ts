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

import { screen, initialState } from '../../screen'
import { $do } from '../../../actions/actions'
import { FieldType, WidgetTypes } from '@cxbox-ui/schema'
import { FilterType } from '../../../interfaces/filters'
import { mockStore } from '../../../tests/mockStore'
import { WidgetTableMeta } from '../../../interfaces/widget'

describe(`bcAddFilter reducer`, () => {
    it('sets date filters to local day', () => {
        const store = mockStore().getState()
        store.screen.bo.bc.bcExample = { name: '', parentName: null, url: '', cursor: '' }
        store.view.widgets = [widget]
        const action = $do.bcAddFilter({
            bcName: 'bcExample',
            widgetName: 'text',
            filter: {
                fieldName: 'key',
                type: FilterType.equals,
                value: `2021-08-19T23:15:17.498-03:00`
            }
        })
        const newState = screen(initialState, action, store)
        expect(newState.filters.bcExample[0].value).toBe(`2021-08-20T00:00:00.000Z`)
    })
})

const widget: WidgetTableMeta = {
    bcName: 'bcExample',
    name: 'text',
    type: WidgetTypes.List,
    title: 'text',
    gridWidth: 0,
    position: 0,
    fields: [
        {
            type: FieldType.date,
            key: 'key',
            title: 'test'
        }
    ]
}
