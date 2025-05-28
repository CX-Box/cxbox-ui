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

import { CXBoxEpic, OperationError, OperationErrorEntity } from '../../interfaces'
import { EMPTY, concat, filter, mergeMap, of, Observable, catchError } from 'rxjs'
import {
    addPendingRequest,
    bcRemoveAllFilters,
    changeDataItem,
    closeViewPopup,
    forceActiveChangeFail,
    forceActiveRmUpdate,
    removePendingRequest,
    viewClearPickMap
} from '../../actions'
import { WidgetTypes } from '@cxbox-ui/schema'
import { buildBcUrl } from '../../utils'
import { AnyAction, nanoid } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { createApiErrorObservable } from '../../utils/apiError'

/**
 * Sends row meta request when `forceActive` field fires `onChange`
 */
export const getRowMetaByForceActiveEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(changeDataItem.match),
        mergeMap(action => {
            const state = state$.value
            const initUrl = state.view.url
            const { bcName, cursor, disableRetry } = action.payload

            const isBcHierarchy = state.view.widgets.some(widget => {
                return (
                    widget.bcName === bcName &&
                    widget.type === WidgetTypes.AssocListPopup &&
                    (widget.options?.hierarchySameBc || widget.options?.hierarchyFull)
                )
            })
            if (isBcHierarchy) {
                return EMPTY
            }

            const isPickListPopup = state.view.widgets.find(
                item =>
                    item.name === state.view.popupData?.widgetName &&
                    [WidgetTypes.PickListPopup, WidgetTypes.FlatTreePopup].includes(item.type as WidgetTypes)
            )

            const needPopupClose = isPickListPopup && !state.session.disableDeprecatedFeatures?.popupCloseAfterChangeData

            const bcUrl = buildBcUrl(bcName, true, state)
            const pendingChanges = state.view.pendingDataChanges[bcName]?.[cursor]
            const pendingChangesNow = state.view.pendingDataChangesNow[bcName]?.[cursor]
            const handledForceActive = state.view.handledForceActive[bcName]?.[cursor] || {}
            const currentRecordData = state.data[bcName]?.find(record => record.id === cursor)
            const fieldsRowMeta = state.view.rowMeta[bcName]?.[bcUrl]?.fields
            let changedFiledKey: string = null

            const closePopup = concat(of(closeViewPopup(null)), of(viewClearPickMap(null)), of(bcRemoveAllFilters({ bcName })))

            // среди forceActive-полей в дельте ищем то которое изменилось по отношению к обработанным forceActive
            // или не содержится в нем, устанавливаем флаг необходимости отправки запроса если такое поле найдено
            const someForceActiveChanged = fieldsRowMeta
                ?.filter(field => field.forceActive && pendingChanges[field.key] !== undefined)
                .some(field => {
                    const result = pendingChanges[field.key] !== handledForceActive[field.key]
                    if (result) {
                        changedFiledKey = field.key
                    }
                    return result
                })
            const requestId = nanoid()
            if (someForceActiveChanged && !disableRetry) {
                return concat(
                    of(addPendingRequest({ request: { requestId, type: 'force-active' } })),
                    api
                        .getRmByForceActive(
                            state.screen.screenName,
                            bcUrl,
                            { ...pendingChanges, vstamp: currentRecordData?.vstamp },
                            pendingChangesNow
                        )
                        .pipe(
                            mergeMap(data => {
                                const result: Array<Observable<AnyAction>> = [of(removePendingRequest({ requestId }))]
                                if (state.view.url === initUrl) {
                                    result.push(
                                        of(
                                            forceActiveRmUpdate({
                                                rowMeta: data,
                                                currentRecordData,
                                                bcName,
                                                bcUrl,
                                                cursor
                                            })
                                        )
                                    )
                                }
                                if (needPopupClose) {
                                    result.push(closePopup)
                                }
                                return concat(...result)
                            }),
                            catchError((e: AxiosError) => {
                                console.error(e)
                                let viewError: string = null
                                let entityError: OperationErrorEntity = null
                                const operationError = e.response?.data as OperationError
                                if (e.response?.data === Object(e.response?.data)) {
                                    entityError = operationError?.error?.entity
                                    viewError = operationError?.error?.popup?.[0]
                                }
                                return concat(
                                    of(removePendingRequest({ requestId })),
                                    state.view.url === initUrl
                                        ? concat(
                                              of(
                                                  changeDataItem({
                                                      bcName,
                                                      bcUrl: buildBcUrl(bcName, true, state),
                                                      cursor,
                                                      dataItem: { [changedFiledKey]: currentRecordData?.[changedFiledKey] },
                                                      disableRetry: true
                                                  })
                                              ),
                                              of(forceActiveChangeFail({ bcName, bcUrl, viewError, entityError }))
                                          )
                                        : EMPTY,
                                    createApiErrorObservable(e)
                                )
                            })
                        )
                )
            }
            return needPopupClose ? closePopup : EMPTY
        })
    )
