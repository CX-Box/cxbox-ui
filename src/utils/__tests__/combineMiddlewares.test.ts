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

import { CoreMiddlewares, CustomMiddleware, CustomMiddlewares } from '../../interfaces/customMiddlewares'
import { combineMiddlewares } from '../combineMiddlewares'
import { Dispatch, MiddlewareAPI } from 'redux'
import { AnyAction } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { middlewares } from '../../middlewares'

interface TestCustomMiddlewares extends Partial<CoreMiddlewares> {
    testAutosave: CustomMiddleware
}
describe('combineMiddlewares test', () => {
    const testAutosave = (store: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) => (action: AnyAction) => {
        return next(action)
    }
    const coreMiddlewares = middlewares
    const coreMiddlewaresArray = Object.values(coreMiddlewares)
    const coreMiddlewaresLength = coreMiddlewaresArray.length
    it('should return core middlewares', () => {
        expect(combineMiddlewares(coreMiddlewares).length).toEqual(coreMiddlewaresLength)
        expect(combineMiddlewares(coreMiddlewares).findIndex(i => i.name === coreMiddlewares.autosave.name)).toEqual(
            coreMiddlewaresArray.findIndex(i => i.name === coreMiddlewares.autosave.name)
        )
    })
    it('should disable `autosave`', () => {
        const customMiddewares: CustomMiddlewares<TestCustomMiddlewares> = {
            autosave: null
        }
        const callResult = combineMiddlewares(coreMiddlewares, customMiddewares)
        expect(callResult.length).toEqual(coreMiddlewaresLength - 1)
        expect(callResult.findIndex(i => i.name === coreMiddlewares.autosave.name)).toEqual(-1)
        expect(callResult[callResult.length - 1].name).toEqual(coreMiddlewaresArray[coreMiddlewaresLength - 1].name)
    })
    it('should set custom middleware `after`', () => {
        const customMiddewares: CustomMiddlewares<TestCustomMiddlewares> = {
            testAutosave: { implementation: testAutosave, priority: 'AFTER' }
        }
        const callResult = combineMiddlewares(coreMiddlewares, customMiddewares)
        expect(callResult.length).toEqual(coreMiddlewaresLength + 1)
        expect(callResult[coreMiddlewaresLength].name).toEqual('testAutosave')
    })
    it('should set custom middleware `before`', () => {
        const customMiddewares: CustomMiddlewares<TestCustomMiddlewares> = {
            testAutosave: { implementation: testAutosave, priority: 'BEFORE' }
        }
        const callResult = combineMiddlewares(coreMiddlewares, customMiddewares)
        expect(callResult.length).toEqual(coreMiddlewaresLength + 1)
        expect(callResult[0].name).toEqual('testAutosave')
    })
    it('should replace core middleware', () => {
        const testCustomMiddewares: CustomMiddlewares<TestCustomMiddlewares> = {
            autosave: testAutosave
        }
        const callResult = combineMiddlewares(coreMiddlewares, testCustomMiddewares)
        expect(callResult.length).toEqual(coreMiddlewaresLength)
        expect(callResult.findIndex(i => i.name === testCustomMiddewares.autosave.name)).toEqual(
            coreMiddlewaresArray.findIndex(i => i.name === coreMiddlewares.autosave.name)
        )
    })
})
