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

import { sendOperationAssociate } from '../sendOperationAssociate'
import { mockStore } from '../../../tests/mockStore'
import { testEpic } from '../../../tests/testEpic'
import { $do } from '../../../actions/actions'
import { OperationTypeCrud } from '../../../interfaces/operation'
import { ActionsObservable } from 'redux-observable'

describe('showFileUploadPopup', () => {
    const store = mockStore()
    it('fires `showViewPopup` with `bcName` templated as `${bcName}Assoc`', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.associate,
            widgetName: 'test-widget'
        })
        testEpic(sendOperationAssociate(ActionsObservable.of(action), store), result => {
            expect(result.length).toBe(1)
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.showViewPopup({
                        bcName: 'bcExampleAssoc',
                        calleeWidgetName: 'test-widget',
                        calleeBCName: 'bcExample',
                        active: true
                    })
                )
            )
        })
    })

    it('fires `showViewPopup` with `bcName` templated as `bcKey` if specified', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: OperationTypeCrud.associate,
            widgetName: 'test-widget',
            bcKey: 'some-value'
        })
        testEpic(sendOperationAssociate(ActionsObservable.of(action), store), result => {
            expect(result.length).toBe(1)
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.showViewPopup({
                        bcName: 'some-value',
                        calleeWidgetName: 'test-widget',
                        calleeBCName: 'bcExample',
                        active: true
                    })
                )
            )
        })
    })
})
