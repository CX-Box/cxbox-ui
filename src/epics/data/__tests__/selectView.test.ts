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
import { selectView } from '../selectView'
import { $do } from '../../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { WidgetTableMeta, WidgetTypes } from '../../../interfaces/widget'
import { FieldType, ViewMetaResponse } from '../../../interfaces/view'
import { testEpic } from '../../../tests/testEpic'

describe('bcFetchRowMetaRequest', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.screenName = 'screen-example'
        store.getState().view.widgets = viewMetaResponse.widgets
        store.getState().screen.bo.bc = {
            'bcExample-1-1-1': {
                ...bcExample,
                name: 'bcExample-1-1-1',
                parentName: 'bcExample-1-1',
                url: 'bcExample-1/:id/bcExample-1-1/:id/bcExample-1-1-1/:id'
            },
            'bcExample-1-1-2': {
                ...bcExample,
                name: 'bcExample-1-1-2',
                parentName: 'bcExample-1-1',
                url: 'bcExample-1/:id/bcExample-1-1/:id/bcExample-1-1-2/:id'
            },
            'bcExample-1-1': {
                ...bcExample,
                name: 'bcExample-1-1',
                parentName: 'bcExample-1',
                url: 'bcExample-1/:id/bcExample-1-1/:id'
            },
            'bcExample-1': {
                ...bcExample,
                name: 'bcExample-1',
                url: 'bcExample-1/:id'
            },
            'bcExample-2': {
                ...bcExample,
                name: 'bcExample-2',
                url: 'bcExample-2/:id'
            }
        }
    })

    it('Schedules `bcFetchDataRequest` for every widget on the view', () => {
        const action = $do.selectView(viewMetaResponse)
        const epic = selectView(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result.length).toBe(2)
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.bcFetchDataRequest({
                        bcName: 'bcExample-1',
                        widgetName: 'widget-example-1-1-1'
                    })
                )
            )
            expect(result[1]).toEqual(
                expect.objectContaining(
                    $do.bcFetchDataRequest({
                        bcName: 'bcExample-2',
                        widgetName: 'widget-example-2'
                    })
                )
            )
        })
    })
})

function getWidgetMeta(): WidgetTableMeta {
    return {
        name: 'widget-example',
        type: WidgetTypes.List,
        title: null,
        bcName: 'bcExample',
        position: 1,
        gridWidth: null,
        fields: [
            {
                key: 'name',
                title: 'Test Column',
                type: FieldType.input
            }
        ]
    }
}

const bcExample = {
    name: 'bcExample',
    parentName: null as string,
    url: 'bcExample/:id',
    cursor: '1',
    page: 2,
    limit: 5,
    loading: false
}

const viewMetaResponse: ViewMetaResponse = {
    name: 'view-example',
    url: 'screen-example/view-example',
    widgets: [
        { ...getWidgetMeta(), name: 'widget-example-1-1-1', bcName: 'bcExample-1-1-1' },
        { ...getWidgetMeta(), name: 'widget-example-1-1-2', bcName: 'bcExample-1-1-2' },
        { ...getWidgetMeta(), name: 'widget-example-1-1', bcName: 'bcExample-1-1' },
        { ...getWidgetMeta(), name: 'widget-example-1', bcName: 'bcExample-1' },
        { ...getWidgetMeta(), name: 'widget-example-2', bcName: 'bcExample-2' },
        { ...getWidgetMeta(), name: 'widget-example-3', bcName: 'bcExample-1-1' },
        { ...getWidgetMeta(), name: 'widget-example-header', bcName: null }
    ]
}
