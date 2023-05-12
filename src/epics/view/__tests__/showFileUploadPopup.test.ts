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

import { showFileUploadPopup } from '../showFileUploadPopup'
import { mockStore } from '../../../tests/mockStore'
import { testEpic } from '../../../tests/testEpic'
import { $do, types as coreActions } from '../../../actions/actions'
import { OperationTypeCrud } from '../../../interfaces/operation'
import { ActionsObservable } from 'redux-observable'

describe('showFileUploadPopup', () => {
    const store = mockStore()
    it('fires `bcChangeCursors` and `showFileUploadPopup`', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.fileUpload,
            widgetName: 'test-widget'
        })
        testEpic(showFileUploadPopup(ActionsObservable.of(action), store), result => {
            expect(result.length).toBe(2)
            expect(result[0]).toEqual(
                expect.objectContaining({
                    type: coreActions.bcChangeCursors,
                    payload: { cursorsMap: { bcExample: null } }
                })
            )
            expect(result[1]).toEqual(
                expect.objectContaining({
                    type: coreActions.showFileUploadPopup,
                    payload: { widgetName: 'test-widget' }
                })
            )
        })
    })
})
