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
import { catchError, concat, filter, mergeMap, of, race } from 'rxjs'
import { bcFetchDataFail, bcFetchDataSuccess, bcLoadMore } from '../../actions'
import { buildBcUrl, getFilters, getSorters } from '../../utils'
import { cancelRequestActionTypes, cancelRequestEpic } from '../../utils/cancelRequestEpic'
import { DataItem } from '@cxbox-ui/schema'
import { createApiErrorObservable } from '../../utils/apiError'

export const bcLoadMoreEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(bcLoadMore.match),
        mergeMap(action => {
            const state = state$.value
            const bcName = action.payload.bcName
            const bc = state.screen.bo.bc[bcName]
            const { cursor, page } = bc
            const limit = state.view.widgets.find(i => i.bcName === bcName)?.limit || bc.limit
            const limitBySelfCursor = state.router.bcPath?.includes(`${bcName}/${cursor}`)
            const bcUrl = buildBcUrl(bcName, limitBySelfCursor, state)
            const filters = state.screen.filters[bcName] || []
            const sorters = state.screen.sorters[bcName]

            const fetchParams: Record<string, any> = {
                _page: page,
                _limit: limit,
                ...getFilters(filters),
                ...getSorters(sorters)
            }

            const canceler = api.createCanceler()
            const cancelFlow = cancelRequestEpic(action$, cancelRequestActionTypes, canceler.cancel, bcFetchDataFail({ bcName, bcUrl }))
            const normalFlow = api.fetchBcData(state.screen.screenName, bcUrl, fetchParams, canceler.cancelToken).pipe(
                mergeMap(data => {
                    const oldBcDataIds = state.data[bcName]?.map(i => i.id)
                    const newData = [...state.data[bcName], ...data.data.filter((i: DataItem) => !oldBcDataIds.includes(i.id))]
                    return of(
                        bcFetchDataSuccess({
                            bcName,
                            data: newData,
                            bcUrl,
                            hasNext: data.hasNext
                        })
                    )
                }),
                catchError((error: any) => {
                    console.error(error)
                    return concat(of(bcFetchDataFail({ bcName, bcUrl })), createApiErrorObservable(error))
                })
            )
            return race(cancelFlow, normalFlow)
        })
    )
