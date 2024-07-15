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

import { Route, RouteType } from '../interfaces'
import { changeLocation } from '../actions'
import { ReducerBuilderManager } from './ReducerBuilderManager'

export const initialRouterState: Route = { type: RouteType.default, path: '/', search: '', params: null, screenName: null }

/**
 * Router reducer
 *
 * Stores information about currently active route
 */
export const createRouterReducerBuilderManager = <S extends Route>(initialState: S) =>
    new ReducerBuilderManager<S>().addCase(changeLocation, (state, action) => {
        return action.payload.location as S
    })
