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

import { catchError, concat, EMPTY, filter, mergeMap, of } from 'rxjs'
import { buildBcUrl, matchOperationRole } from '../../utils'
import { DataItem, OperationTypeCrud } from '@cxbox-ui/schema'
import { CXBoxEpic } from '../../interfaces'
import {
    bcFetchRowMetaSuccess,
    bcNewDataFail,
    bcNewDataSuccess,
    changeDataItem,
    processPostInvoke,
    selectTableRow,
    sendOperation
} from '../../actions'
import { createApiErrorObservable } from '../../utils/apiError'

/**
 * Access `row-meta-new` API endpoint for business component endpoint; response will contain
 * row meta where `currentValue` of `id` field will contain an id for newly created record.
 *
 * `bcNewDataSuccess` action dispatched with new dataEpics.ts item draft (vstamp = -1).
 * `bcFetchRowMetaSuccess` action dispatched to set BC cursor to this new id.
 * `changeDataItem` action dispatched to add this new item to pending changes.
 * `processPostInvokeEpic` dispatched to handle possible post invokes.
 *
 * In case of an error message is logged as warning and `bcNewDataFail` action dispatched.
 *
 */
export const bcNewDataEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(sendOperation.match),
        filter(action => matchOperationRole(OperationTypeCrud.create, action.payload, state$.value)),
        mergeMap(action => {
            /**
             * Default implementation for `bcNewDataEpic` epic
             *
             * Access `row-meta-new` API endpoint for business component endpoint; response will contain
             * row meta where `currentValue` of `id` field will contain an id for newly created record.
             *
             * `bcNewDataSuccess` action dispatched with new dataEpics.ts item draft (vstamp = -1).
             * `bcFetchRowMetaSuccess` action dispatched to set BC cursor to this new id.
             * `changeDataItem` action dispatched to add this new item to pending changes.
             * `processPostInvokeEpic` dispatched to handle possible post invokes.
             *
             * In case of an error message is logged as warning and `bcNewDataFail` action dispatched.
             *
             */
            const state = state$.value
            const bcName = action.payload.bcName
            const bcUrl = buildBcUrl(bcName, false, state) ?? ''
            const context = { widgetName: action.payload.widgetName }
            const params = { _action: action.payload.operationType }
            return api.newBcData(state.screen.screenName, bcUrl, context, params).pipe(
                mergeMap(data => {
                    const rowMeta = data.row
                    const dataItem: DataItem = { id: null as any, vstamp: -1 }
                    data.row.fields.forEach(field => {
                        dataItem[field.key] = field.currentValue
                    })
                    const postInvoke = data.postActions?.[0]
                    const cursor = dataItem.id
                    return concat(
                        of(bcNewDataSuccess({ bcName, dataItem, bcUrl })),
                        of(bcFetchRowMetaSuccess({ bcName, bcUrl: `${bcUrl}/${cursor}`, rowMeta, cursor })),
                        of(
                            changeDataItem({
                                bcName,
                                bcUrl: buildBcUrl(bcName, true, state) ?? '',
                                cursor: cursor,
                                dataItem: {
                                    id: cursor
                                }
                            })
                        ),
                        of(selectTableRow({ widgetName: action.payload.widgetName, rowId: cursor })),
                        postInvoke ? of(processPostInvoke({ bcName, postInvoke, cursor, widgetName: action.payload.widgetName })) : EMPTY
                    )
                }),
                catchError((error: any) => {
                    console.error(error)
                    return concat(of(bcNewDataFail({ bcName })), createApiErrorObservable(error, context))
                })
            )
        })
    )
