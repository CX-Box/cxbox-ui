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
import { $do } from '../../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { refreshMetaEpic } from '../refreshMeta'
import { testEpic } from '../../../tests/testEpic'
import { refreshMeta } from '../../../api'
import * as api from '../../../api/api'
import { Observable } from 'rxjs/Observable'

const res = {}
const refreshMetaMock = jest.fn().mockImplementation((...args: Parameters<typeof refreshMeta>) => {
    return Observable.of(res)
})
jest.spyOn<any, any>(api, 'refreshMeta').mockImplementation(refreshMetaMock)

describe('refreshMeta', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    afterAll(() => {
        refreshMetaMock.mockRestore()
    })
    it('should call refreshMetaDone, logoutDone, login, changeLocation', () => {
        const action = $do.refreshMeta(null)
        const epic = refreshMetaEpic(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result.length).toBe(4)
            expect(result[0]).toEqual(expect.objectContaining({ type: 'refreshMetaDone' }))
            expect(result[1]).toEqual(expect.objectContaining({ type: 'logoutDone' }))
            expect(result[2]).toEqual(expect.objectContaining({ type: 'login' }))
            expect(result[3]).toEqual(expect.objectContaining({ type: 'changeLocation' }))
        })
    })
})
