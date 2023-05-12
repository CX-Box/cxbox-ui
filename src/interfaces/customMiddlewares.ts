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

import { Middleware } from 'redux'
import { middlewares } from '../middlewares'
/**
 * Type of core middlewares
 */
export type CoreMiddlewares = typeof middlewares

/**
 * Custom middleware interface
 */
export interface CustomMiddleware {
    /**
     * Implementation of custom middleware
     */
    implementation: Middleware
    /**
     * Priority of custom middleware
     */
    priority: 'BEFORE' | 'AFTER'
}

/**
 * List the names of all core middlewares
 */
export type CoreMiddlewareType = keyof CoreMiddlewares

/**
 * Descriptor of custom middleware not presented in core middlewares
 */
export type NewMiddlewareDescriptor<T = Record<string, unknown>> = Record<Exclude<keyof T, keyof CoreMiddlewares>, CustomMiddleware>

/**
 * Form a dictionary of override descriptors for those middleware
 */
export type CoreMiddlewareOverrideDescriptors = Record<CoreMiddlewareType, Middleware | null>
/**
 * Type of custom middlewares
 */
export type CustomMiddlewares<T = Record<string, unknown>> = Partial<CoreMiddlewareOverrideDescriptors> | NewMiddlewareDescriptor<T>
