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

import session from './session'
import router from './router'
import screen from './screen'
import view from './view'
import data from './data'
import { Store, CombinedReducersMapObject } from '../interfaces/store'
import { AnyAction } from '../actions/actions'
import depthData from './depthData'

export const reducers: CombinedReducersMapObject<Store, AnyAction> = {
    router,
    session,
    screen,
    view,
    data,
    depthData
}
