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
 * A dictionary for a values of specified type
 *
 * @deprecated TODO: Remove in 2.0.0 in favor of native `Record` type
 *
 * @template T Value type
 */
export interface ObjectMap<T> {
    [key: string]: T | undefined
}

/**
 * Basic type for Cxbox API responses
 *
 * TODO: Move this to a an appropriate module
 */
export interface CxboxResponse {
    /**
     * If any response returs with this field, browser should redirect on this address
     */
    redirectUrl?: string
}

/**
 * Types of notification messages
 */
export enum AppNotificationType {
    success = 'success',
    info = 'info',
    warning = 'warning',
    error = 'error'
}

export interface SystemNotification {
    id: number
    type: AppNotificationType
    message: string
}
