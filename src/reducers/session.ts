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

import { Session } from '../interfaces'
import {
    addNotification,
    addPendingRequest,
    login,
    loginDone,
    loginFail,
    logout,
    refreshMeta,
    refreshMetaDone,
    refreshMetaFail,
    removeNotifications,
    removePendingRequest,
    switchDebugMode
} from '../actions'
import { ReducerBuilderManager } from './ReducerBuilderManager'

export const initialSessionState: Session = {
    devPanelEnabled: false,
    activeRole: null,
    roles: null,
    firstName: '',
    lastName: '',
    login: '',
    debugMode: false,
    exportStateEnabled: false,
    active: false,
    logout: false,
    loginSpin: false,
    errorMsg: null,
    screens: [],
    pendingRequests: [],
    notifications: [],
    isMetaRefreshing: false
}

/**
 * Session reducer
 *
 * Stores information about currently active session and dataEpics.ts that should be persistent during all period of
 * user interaction with application.
 */
export const createSessionReducerBuilderManager = <S extends Session>(initialState: S) =>
    new ReducerBuilderManager<S>()
        .addCase(login, state => {
            state.loginSpin = true
            state.errorMsg = null
        })
        .addCase(loginDone, (state, action) => {
            state = Object.assign(state, action.payload)
            state.loginSpin = false
            state.active = true
            state.logout = false
        })
        .addCase(loginFail, (state, action) => {
            state.loginSpin = false
            state.errorMsg = action.payload.errorMsg
        })
        .addCase(logout, state => {
            state.loginSpin = false
            state.active = false
            state.logout = true
        })
        .addCase(switchDebugMode, (state, action) => {
            state.debugMode = action.payload
        })
        .addCase(addPendingRequest, (state, action) => {
            state.pendingRequests?.push(action.payload.request)
        })
        .addCase(removePendingRequest, (state, action) => {
            state.pendingRequests = state.pendingRequests?.filter(item => item.requestId !== action.payload.requestId)
        })
        .addCase(addNotification, (state, action) => {
            state.notifications.push(action.payload)
        })
        .addCase(removeNotifications, (state, action) => {
            const closingKeys = action.payload
            state.notifications = state.notifications.filter(notification => !closingKeys.includes(notification.key))
        })
        .addCase(refreshMeta, state => {
            state.isMetaRefreshing = true
        })
        .addCase(refreshMetaDone, state => {
            state.isMetaRefreshing = false
        })
        .addCase(refreshMetaFail, state => {
            state.isMetaRefreshing = false
        })
