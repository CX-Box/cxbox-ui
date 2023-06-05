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

import { catchError, concat, filter, map, mergeMap, of, race } from 'rxjs'
import { buildBcUrl } from '../../utils'
import { cancelRequestActionTypes, cancelRequestEpic } from '../../utils/cancelRequestEpic'
import { CXBoxEpic } from '../../interfaces'
import { bcFetchRowMeta, bcFetchRowMetaFail, bcFetchRowMetaSuccess, bcSelectRecord } from '../../actions'
import { createApiErrorObservable } from '../../utils/apiError'

/**
 * Access `row-meta` API endpoint for business component; response will contain information
 * about operations available for row and additional information about row fields.
 *
 * On success, {@link ActionPayloadTypes.bcFetchRowMetaSuccess | bcFetchRowMetaSuccess} action dispatched
 * to store received row meta.
 * On failure, console.error called and {@link ActionPayloadTypes.bcFetchRowMetaFail | bcFetchRowMetaFail} action
 * dispatched to drop fetching state.
 *
 * If any action from `cancelRequestActionTypes` array dispatched while this epic is in progress,
 * this epic will be cancelled and {@link ActionPayloadTypes.bcFetchRowMetaFail | bcFetchRowMetaFail} action
 * will be dispatched.
 *
 * @category Epics
 */
export const bcFetchRowMetaRequestEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(bcFetchRowMeta.match),
        mergeMap(action => {
            /**
             * Default implementation for `bcFetchRowMetaRequest` epic
             *
             * Access `row-meta` API endpoint for business component; response will contain information
             * about operations available for row and additional information about row fields.
             *
             * On success, {@link ActionPayloadTypes.bcFetchRowMetaSuccess | bcFetchRowMetaSuccess} action dispatched
             * to store received row meta.
             * On failure, console.error called and {@link ActionPayloadTypes.bcFetchRowMetaFail | bcFetchRowMetaFail} action
             * dispatched to drop fetching state.
             *
             * If any action from `cancelRequestActionTypes` array dispatched while this epic is in progress,
             * this epic will be cancelled and {@link ActionPayloadTypes.bcFetchRowMetaFail | bcFetchRowMetaFail} action
             * will be dispatched.
             */

            const state = state$.value
            const screenName = state.screen.screenName
            const bcName = action.payload.bcName
            const cursor = state.screen.bo.bc[bcName].cursor ?? ''
            const bcUrl = buildBcUrl(bcName, true, state) ?? ''
            const canceler = api.createCanceler()
            const cancelFlow = cancelRequestEpic(action$, cancelRequestActionTypes, canceler.cancel, bcFetchRowMetaFail({ bcName }))
            const cancelByParentBc = cancelRequestEpic(
                action$,
                [bcSelectRecord],
                canceler.cancel,
                bcFetchRowMetaFail({ bcName }),
                filteredAction => {
                    const actionBc = filteredAction.payload.bcName
                    return state.screen.bo.bc[bcName].parentName === actionBc
                }
            )
            const normalFlow = api.fetchRowMeta(screenName, bcUrl, undefined, canceler.cancelToken).pipe(
                map(rowMeta => {
                    return bcFetchRowMetaSuccess({ bcName, rowMeta, bcUrl, cursor })
                }),
                catchError(error => {
                    console.error(error)
                    return concat(of(bcFetchRowMetaFail({ bcName })), createApiErrorObservable(error))
                })
            )

            return race(cancelFlow, cancelByParentBc, normalFlow)
        })
    )
