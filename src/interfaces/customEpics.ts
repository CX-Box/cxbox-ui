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

/**
 * This module includes types to support overriding redux-observable Epics that we use in Cxbox UI by
 * custom implementations from client application.
 */
import { Epic } from 'redux-observable'
import { AnyAction } from '@reduxjs/toolkit'
import { Store } from './store'
import { Api } from '../api'
import { WidgetMeta } from './widget'

export interface EpicDependencyInjection<A = Api, B = { getInternalWidgets?: (widgets: WidgetMeta[]) => string[] }> {
    api: A
    utils?: B
}

/**
 * Default Epic typing with dependency injection
 */
export type CXBoxEpic<S = Store, A = Api> = Epic<AnyAction, AnyAction, S, EpicDependencyInjection<A>>
