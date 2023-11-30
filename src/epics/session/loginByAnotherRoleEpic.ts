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

import { CXBoxEpic } from '../../interfaces'
import { catchError, concat, filter, mergeMap, of, switchMap } from 'rxjs'
import { changeLocation, login, loginDone, loginFail } from '../../actions'
import { AxiosError } from 'axios'
import { defaultParseURL } from '../../utils'
import { createApiErrorObservable } from '../../utils/apiError'

const responseStatusMessages: Record<number, string> = {
    401: 'Invalid credentials',
    403: 'Access denied'
}

/**
 * Performed on role switching
 */
export const loginByAnotherRoleEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(login.match),
        filter(action => !!action.payload?.role),
        switchMap(action => {
            /**
             * Default implementation of `loginByAnotherRoleEpic` epic
             *
             * Performs login request with `role` parameter
             *
             * If `role` changed, epic changes location to default view
             */

            const role = action.payload.role ?? ''
            const isSwitchRole = role && role !== state$.value.session.activeRole
            return api.loginByRoleRequest(role).pipe(
                mergeMap(data => {
                    const result = []
                    if (isSwitchRole) {
                        const defaultScreen = data.screens.find(screen => screen.defaultScreen) || data.screens[0]
                        const defaultViewName = defaultScreen?.primary ?? defaultScreen.meta.views[0].name
                        const defaultView = defaultScreen?.meta.views.find(view => defaultViewName === view.name)
                        if (defaultView)
                            result.push(changeLocation({ location: defaultParseURL(new URL(defaultView.url, window.location.origin)) }))
                    }

                    return concat([
                        ...result,
                        loginDone({
                            devPanelEnabled: data.devPanelEnabled,
                            activeRole: data.activeRole,
                            roles: data.roles,
                            screens: data.screens,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            login: data.login
                        })
                    ])
                }),
                catchError((error: AxiosError) => {
                    console.error(error)
                    const errorMsg = error.response
                        ? responseStatusMessages[error.response.status] || 'Server application unavailable'
                        : 'Empty server response'
                    return concat(of(loginFail({ errorMsg })), createApiErrorObservable(error))
                })
            )
        })
    )
