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

import { Route } from './router'
import { Session } from './session'
import { ScreenState } from './screen'
import { ViewState } from './view'
import { DataState, DepthDataState } from './data'
import { AnyAction } from '../actions/actions'

export interface Store {
    router: Route
    session: Session
    screen: ScreenState
    view: ViewState
    data: DataState
    depthData: DepthDataState
    [reducerName: string]: any // TODO: Fix how reducers are combined and remove
}

export type CoreReducer<ReducerState, ClientActions, State = Store> = (
    /**
     * The state of Redux store slice
     */
    state: ReducerState,
    /**
     * Redux action
     */
    action: AnyAction & ClientActions,
    /**
     * Allows direct access to other slices of redux store from the reducer
     */
    store?: Readonly<State>,
    /**
     * The original state of Redux store slice before in went through Cxbox reducer;
     *
     * Can be used to implement your own logic in client application reducer for built-in action.
     */
    originalState?: ReducerState
) => ReducerState

export interface ClientReducer<ReducerState, ClientActions> {
    /**
     * Initial state for Redux store slice; will replace built-in Cxbox initial state for matching slice
     */
    initialState: ReducerState
    /**
     * If true than custom reducer will replace built-in Cxbox reducer for this store slice
     *
     * @deprecated TODO: This functionality is conceptionally flawed and will be removed in 2.0.0
     */
    override?: boolean
    /**
     * Reducer function for specific store slice
     */
    reducer: CoreReducer<ReducerState, ClientActions>
}

export type ClientReducersMapObject<ClientStore, ClientActions> = {
    [reducerName in keyof ClientStore]: ClientReducer<ClientStore[keyof ClientStore], ClientActions>
}

export type CombinedReducersMapObject<ReducerState, ClientActions> = {
    [reducerName in keyof ReducerState]: CoreReducer<ReducerState[keyof ReducerState], ClientActions, ReducerState>
}
