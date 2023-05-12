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

import { ScreenMetaResponse } from './screen'
import { CxboxResponse } from './objectMap'
import { RequestType } from './operation'

export interface UserRole {
    type: string
    key: string
    value: string
    description: string
    language: string
    displayOrder: number
    active: boolean
    cacheLoaderName: string
}

export interface Session {
    /**
     * Whether dev tools panel is shown
     */
    devPanelEnabled?: boolean
    activeRole?: string
    roles?: UserRole[]
    /**
     * Shows if debug mode is enabled
     */
    debugMode?: boolean
    /**
     * Enables availability of saving redux store and other info on user device.
     * There is need to set it to `true` from client application.
     */
    exportStateEnabled?: boolean
    firstName?: string
    lastName?: string
    login?: string
    active: boolean
    screens: SessionScreen[]
    loginSpin: boolean
    errorMsg?: string
    pendingRequests?: PendingRequest[]
}

export interface LoginResponse extends CxboxResponse {
    devPanelEnabled?: boolean
    activeRole?: string
    roles?: UserRole[]
    firstName?: string
    lastName?: string
    login?: string
    screens: SessionScreen[]
    // TODO: Сравнить ответы досье и УОР
}

export interface SessionScreen {
    id: string
    name: string
    text: string // Отображаемое название
    url: string
    primary?: string
    defaultScreen?: boolean
    meta?: ScreenMetaResponse
    icon?: string
    notification?: number
}

export interface PendingRequest {
    requestId: string
    type: RequestType
}
