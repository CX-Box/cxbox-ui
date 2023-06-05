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
import { bcChangeCursors, sendOperation, showFileUploadPopup } from '../../actions'
import { concat, filter, mergeMap, of } from 'rxjs'
import { matchOperationRole } from '../../utils'
import { OperationTypeCrud } from '@cxbox-ui/schema'

/**
 * Fires `bcChangeCursors` and `showFileUploadPopupEpic` to drop the cursors and show file upload popup.
 */
export const showFileUploadPopupEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(sendOperation.match),
        filter(action => matchOperationRole(OperationTypeCrud.fileUpload, action.payload, state$.value)),
        mergeMap(action => {
            return concat(
                of(bcChangeCursors({ cursorsMap: { [action.payload.bcName]: null } })),
                of(showFileUploadPopup({ widgetName: action.payload.widgetName }))
            )
        })
    )
