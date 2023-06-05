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

import {
    CXBoxEpic,
    OperationPostInvokeDownloadFile,
    OperationPostInvokeDownloadFileByUrl,
    OperationPostInvokeDrillDown,
    OperationPostInvokeRefreshBc,
    OperationPostInvokeShowMessage,
    OperationPostInvokeType
} from '../../interfaces'
import { EMPTY, filter, mergeMap, of } from 'rxjs'
import {
    bcChangeCursors,
    bcFetchDataPages,
    bcFetchDataRequest,
    downloadFile,
    downloadFileByUrl,
    drillDown,
    processPostInvoke,
    showNotification
} from '../../actions'
import { AnyAction } from '@reduxjs/toolkit'

export const processPostInvokeEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(processPostInvoke.match),
        mergeMap(action => {
            const state = state$.value
            switch (action.payload.postInvoke.type) {
                case OperationPostInvokeType.drillDown:
                    return of(
                        drillDown({
                            ...(action.payload.postInvoke as OperationPostInvokeDrillDown),
                            route: state.router,
                            widgetName: action.payload.widgetName
                        })
                    )
                case OperationPostInvokeType.postDelete: {
                    const cursorsMap: Record<string, string> = { [action.payload.bcName]: null }
                    const result: AnyAction[] = [bcChangeCursors({ cursorsMap })]
                    if (state.router.bcPath.includes(`${action.payload.bcName}/`)) {
                        // const newBcUrl = state.router.bcPath.split(action.payload.bcName)[0] || ''
                        // const newUrl = `/screen/${state.router.screenName}/view/${state.router.viewName}/${newBcUrl}`
                        //historyObj.push(newUrl)
                    } else {
                        result.push(
                            bcFetchDataRequest({
                                bcName: action.payload.bcName,
                                widgetName: action.payload.widgetName
                            })
                        )
                    }
                    return of(...result)
                }
                case OperationPostInvokeType.refreshBC: {
                    const bo = state.screen.bo
                    const postInvoke = action.payload.postInvoke as OperationPostInvokeRefreshBc
                    const postInvokeBC = postInvoke.bc
                    const postInvokeBCItem = bo.bc[postInvoke.bc]
                    const widgetName = action.payload.widgetName || ''
                    const infiniteWidgets: string[] = state.view.infiniteWidgets || []
                    const infinitePagination = state.view.widgets.some(
                        item => item.bcName === postInvokeBC && infiniteWidgets.includes(item.name)
                    )
                    return infinitePagination
                        ? of(
                              bcFetchDataPages({
                                  bcName: postInvokeBCItem.name,
                                  widgetName: widgetName,
                                  from: 1,
                                  to: postInvokeBCItem.page
                              })
                          )
                        : of(
                              bcFetchDataRequest({
                                  bcName: postInvokeBCItem.name,
                                  widgetName
                              })
                          )
                }
                case OperationPostInvokeType.showMessage: {
                    const postInvoke = action.payload.postInvoke as OperationPostInvokeShowMessage
                    return of(showNotification({ type: postInvoke.messageType, message: postInvoke.messageText }))
                }
                case OperationPostInvokeType.downloadFile: {
                    const postInvoke = action.payload.postInvoke as OperationPostInvokeDownloadFile
                    return of(downloadFile({ fileId: postInvoke.fileId }))
                }
                case OperationPostInvokeType.downloadFileByUrl: {
                    const postInvoke = action.payload.postInvoke as OperationPostInvokeDownloadFileByUrl
                    return of(downloadFileByUrl({ url: postInvoke.url }))
                }
                default:
                    // Other types can be handled by client application
                    return EMPTY
            }
        })
    )
