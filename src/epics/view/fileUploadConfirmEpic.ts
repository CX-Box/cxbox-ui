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
import { bcForceUpdate, bulkUploadFiles, closeViewPopup, sendOperationSuccess } from '../../actions'
import { concat, filter, mergeMap, of } from 'rxjs'
import { buildBcUrl } from '../../utils'
import { OperationTypeCrud } from '@cxbox-ui/schema'
import { postOperationRoutine } from '../utils/postOperationRoutine'

/**
 * It sends customAction request for `file-upload-save` endpoint with `bulkIds` dataEpics.ts
 * containing ids of uploaded files.
 * On success it fires `sendOperationSuccess`, `bcForceUpdate` and `closeViewPopup` actions
 * to refresh business component and close popup.
 *
 * It also launces postOperationRoutine to handle pre and post invokes.
 *
 */
export const fileUploadConfirmEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(bulkUploadFiles.match),
        mergeMap(action => {
            /**
             * Default implementation for `fileUploadConfirmEpic` epic
             *
             * It sends customAction request for `file-upload-save` endpoint with `bulkIds` dataEpics.ts
             * containing ids of uploaded files.
             * On success it fires `sendOperationSuccess`, `bcForceUpdate` and `closeViewPopup` actions
             * to refresh business component and close popup.
             *
             * It also launces postOperationRoutine to handle pre and post invokes.
             */
            const state = state$.value
            const bcName = state.view.popupData.bcName
            const bcUrl = buildBcUrl(bcName, true)
            const widgetName = state.view.widgets.find(item => item.bcName === bcName)?.name
            const data = {
                bulkIds: action.payload.fileIds
            }
            return api.customAction(state.screen.screenName, bcUrl, data, null, { _action: 'file-upload-save' }).pipe(
                mergeMap(response => {
                    const postInvoke = response.postActions[0]
                    const preInvoke = response.preInvoke
                    return concat(
                        of(sendOperationSuccess({ bcName, cursor: null })),
                        of(bcForceUpdate({ bcName })),
                        of(closeViewPopup(null)),
                        ...postOperationRoutine(widgetName, postInvoke, preInvoke, OperationTypeCrud.save, bcName)
                    )
                })
            )
        })
    )
