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

import { createStore } from 'redux'
import { reducers } from '../reducers/index'
import { setStoreInstance } from '../Provider'
import { combineReducers } from '../utils/redux'

/**
 * redux-стор для использования в тестах
 *
 * Поддерживает редьюсеры, не поддерживает эпики (тестируются отдельно).
 */
export const mockStore = () => {
    const store = createStore(combineReducers(reducers))
    const origDispatch = store.dispatch
    store.dispatch = jest.fn(origDispatch)
    setStoreInstance(store)
    return store
}
