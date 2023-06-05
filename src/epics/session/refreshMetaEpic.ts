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
import { catchError, concat, filter, mergeMap, switchMap } from 'rxjs'
import { login, loginFail, logoutDone, refreshMeta, refreshMetaDone, refreshMetaFail } from '../../actions'
import { createApiError } from '../../utils/apiError'

/**
 * Performed on refresh meta dataEpics.ts process.
 */
export const refreshMetaEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(refreshMeta.match),
        mergeMap(() => {
            const state = state$.value
            const { activeRole } = state.session
            return api.refreshMeta().pipe(
                switchMap(() => concat([refreshMetaDone(), logoutDone(null), login({ login: '', password: '', role: activeRole })])),
                catchError(error => concat([loginFail(error), refreshMetaFail(), createApiError(error)]))
            )
        })
    )
