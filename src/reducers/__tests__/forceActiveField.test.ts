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
import { Store as CoreStore } from '../../interfaces/store'
import { mockStore } from '../../tests/mockStore'
import { $do } from '../../index'
import { RowMeta, RowMetaField } from '../../interfaces/rowMeta'

const exampleBcName = 'bcExample'
const testCursor = '1'
const testBcUrl = `${exampleBcName}/${testCursor}`

describe('Force active field', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('updates store correctly on row meta update action', () => {
        const forceActiveFieldKey = 'faField'
        const forceActiveFieldSelectedValue = 'selectedFAValue'
        const rmForceActiveField: RowMetaField = {
            key: forceActiveFieldKey,
            currentValue: undefined,
            forceActive: true
        }

        const normalFieldKey = 'normalField'
        const normalFieldForcedValue = 'normalFieldForcedValue'
        const rmNormalField: RowMetaField = {
            key: normalFieldKey,
            currentValue: normalFieldForcedValue
        }

        const testRowMeta: RowMeta = {
            actions: [],
            fields: [rmForceActiveField, rmNormalField]
        }

        store.getState().view.pendingDataChanges[exampleBcName] = {
            [testCursor]: {
                [forceActiveFieldKey]: forceActiveFieldSelectedValue
            }
        }

        store.dispatch(
            $do.forceActiveRmUpdate({
                currentRecordData: {
                    id: '1',
                    vstamp: 1,
                    [normalFieldKey]: 'normalFieldRecordValue',
                    [forceActiveFieldKey]: 'faFieldRecordValue'
                },
                rowMeta: testRowMeta,
                bcName: exampleBcName,
                bcUrl: testBcUrl,
                cursor: testCursor
            })
        )

        expect(store.getState().view.handledForceActive[exampleBcName][testCursor][rmForceActiveField.key]).toBe(
            forceActiveFieldSelectedValue
        )
        expect(store.getState().view.pendingDataChanges[exampleBcName][testCursor][rmForceActiveField.key]).toBe(
            forceActiveFieldSelectedValue
        )
        expect(store.getState().view.rowMeta[exampleBcName][testBcUrl]).toEqual(testRowMeta)

        expect(store.getState().view.pendingDataChanges[exampleBcName][testCursor][rmNormalField.key]).toBe(normalFieldForcedValue)
    })
})
