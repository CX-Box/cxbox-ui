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
import { catchError, filter, mergeMap, of, race } from 'rxjs'
import { bcFetchDataFail, bcFetchDataSuccess, inlinePickListFetchDataRequest } from '../../actions'
import { buildBcUrl } from '../../utils'
import { cancelRequestActionTypes, cancelRequestEpic } from '../../utils/cancelRequestEpic'

export const inlinePickListFetchDataEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(inlinePickListFetchDataRequest.match),
        mergeMap(action => {
            const { bcName, searchSpec, searchString } = action.payload
            const bcUrl = buildBcUrl(bcName, false)
            const canceler = api.createCanceler()
            const cancelFlow = cancelRequestEpic(action$, cancelRequestActionTypes, canceler.cancel, bcFetchDataFail({ bcName, bcUrl }))
            const normalFlow = api
                .fetchBcData(state$.value.screen.screenName, bcUrl, { [searchSpec + '.contains']: searchString }, canceler.cancelToken)
                .pipe(
                    mergeMap(data => {
                        return of(bcFetchDataSuccess({ bcName, data: data.data, bcUrl }))
                    }),
                    catchError((error: any) => {
                        console.error(error)
                        return of(bcFetchDataFail({ bcName: action.payload.bcName, bcUrl }))
                    })
                )

            return race(cancelFlow, normalFlow)
        })
    )
