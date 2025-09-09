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

import { OperationError, OperationErrorEntity, OperationTypeCrud } from '../../interfaces'
import { buildBcUrl, getEagerBcChildren, getWidgetsForLazyLoad, matchOperationRole } from '../../utils'
import { catchError, concat, EMPTY, filter, mergeMap, Observable, of } from 'rxjs'
import { CXBoxEpic } from '../../interfaces'
import {
    addNotification,
    bcCancelPendingChanges,
    bcFetchDataRequest,
    bcFetchRowMeta,
    bcSaveDataFail,
    bcSaveDataSuccess,
    deselectTableRow,
    processPostInvoke,
    sendOperation,
    setOperationFinished
} from '../../actions'
import { AxiosError } from 'axios'
import { AnyAction } from '@reduxjs/toolkit'
import { createApiErrorObservable } from '../../utils/apiError'
import { removeDisabledFields } from '../../utils/data'

/**
 * Post record's pending changes to `save dataEpics.ts` API endpoint.
 * Pending changes for fields disabled through row meta are not send; please notice that fields are
 * disabled by default.
 *
 * On success following actions are dispatched:
 * - {@link bcSaveDataSuccess}
 * - {@link bcFetchRowMeta}
 * - one {@link bcFetchDataRequest} for each child of saved business component
 * - optional {@link ActionPayloadTypes.processPostInvokeEpic | processPostInvokeEpic } if present in response
 * - optional `onSuccessAction` callback if provided in payload.
 *
 * On failure, console\.error called and {@link ActionPayloadTypes.bcSaveDataFail | bcSaveDataFail} action
 * dispatched.
 *
 * If there was a `onSuccessAction` callback provided in action payload (and widget option
 * {@link WidgetOptions.disableNotification} was not set)
 * then a notification will be shown on failure with suggestion to cancel pending changes and a button that fires
 * {@link bcCancelPendingChanges}
 *
 * @category Epics
 */

export const bcSaveDataEpic: CXBoxEpic = (action$, state$, { api, utils }) =>
    action$.pipe(
        filter(sendOperation.match),
        filter(action => matchOperationRole(OperationTypeCrud.save, action.payload, state$.value)),
        mergeMap(action => {
            /**
             * Default implementation for `bcSaveData` epic
             *
             * Post record's pending changes to `save dataEpics.ts` API endpoint.
             * Pending changes for fields disabled through row meta are not send; pleace notice that fields are
             * disabled by default.
             *
             * On success following actions are dispatched:
             * - {@link ActionPayloadTypes.bcSaveDataSuccess | bcSaveDataSuccess}
             * - {@link ActionPayloadTypes.bcFetchRowMeta | bcFetchRowMeta}
             * - one {@link ActionPayloadTypes.bcFetchDataRequest | bcFetchDataRequest } for each children of saved
             * business component
             * - optional {@link ActionPayloadTypes.processPostInvokeEpic | processPostInvokeEpic } if present in response
             * - optional `onSuccessAction` callback if provided in payload.
             *
             * On failure, console\.error called and {@link ActionPayloadTypes.bcSaveDataFail | bcSaveDataFail} action
             * dispatched.
             *
             * If there was a `onSuccessAction` callback provided in action payload (and widget option
             * {@link WidgetOptions.disableNotification | disableNotification } was not set)
             * then a notification will be shown on failure with suggestion to cancel pending changes and a button that fires
             * {@link ActionPayloadTypes.bcCancelPendingChanges | bcCancelPendingChanges}
             */
            const state = state$.value
            const bcName = action.payload.bcName
            const bcUrl = buildBcUrl(bcName, true, state) ?? ''
            const widgetName = action.payload.widgetName
            const cursor = state.screen.bo.bc[bcName].cursor as string
            const dataItem = state.data[bcName].find(item => item.id === cursor)
            const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
            const options = state.view.widgets.find(widget => widget.name === widgetName)?.options

            const pendingChanges = removeDisabledFields(state.view.pendingDataChanges[bcName]?.[cursor], rowMeta)

            const lazyWidgetNames = getWidgetsForLazyLoad(state.view.widgets, utils?.getInternalWidgets)
            const fetchChildrenBcData = Object.entries(
                getEagerBcChildren(bcName, state.view.widgets, state.screen.bo.bc, lazyWidgetNames, false)
            ).map(entry => {
                const [childBcName, widgetNames] = entry
                return bcFetchDataRequest({ bcName: childBcName, widgetName: widgetNames[0] })
            })

            const context = { widgetName: action.payload.widgetName }
            return api.saveBcData(state.screen.screenName, bcUrl, { ...pendingChanges, vstamp: dataItem?.vstamp as number }, context).pipe(
                mergeMap(data => {
                    const postInvoke = data.postActions?.[0]
                    const responseDataItem = data.record
                    return concat(
                        of(setOperationFinished({ bcName, operationType: OperationTypeCrud.save })),
                        of(bcSaveDataSuccess({ bcName, cursor, dataItem: responseDataItem })),
                        of(bcFetchRowMeta({ widgetName, bcName })),
                        of(deselectTableRow()),
                        of(...fetchChildrenBcData),
                        postInvoke
                            ? of(
                                  processPostInvoke({
                                      bcName,
                                      widgetName,
                                      postInvoke,
                                      cursor: responseDataItem.id
                                  })
                              )
                            : EMPTY,
                        action.payload.onSuccessAction ? of(action.payload.onSuccessAction) : EMPTY
                    )
                }),
                catchError((e: AxiosError) => {
                    console.error(e)
                    let notification$: Observable<AnyAction> = EMPTY
                    // Protection against widget blocking while autosaving
                    if (action.payload.onSuccessAction && !options?.disableNotification) {
                        notification$ = of(
                            addNotification({
                                key: 'data_autosave_undo',
                                type: 'buttonWarningNotification',
                                message: 'There are pending changes. Please save them or cancel.',
                                duration: 0,
                                options: {
                                    buttonWarningNotificationOptions: {
                                        buttonText: 'Cancel changes',
                                        actionsForClick: [bcCancelPendingChanges({ bcNames: [bcName] })]
                                    }
                                }
                            })
                        )
                    }
                    let viewError: string = null as any
                    let entityError: OperationErrorEntity = null as any
                    const operationError = e.response?.data as OperationError
                    if (e.response?.data === Object(e.response?.data)) {
                        entityError = operationError?.error?.entity ?? entityError
                        viewError = operationError?.error?.popup?.[0] ?? viewError
                    }

                    return concat(
                        of(setOperationFinished({ bcName, operationType: OperationTypeCrud.save })),
                        of(bcSaveDataFail({ bcName, bcUrl, viewError, entityError })),
                        notification$,
                        createApiErrorObservable(e, context)
                    )
                })
            )
        })
    )
