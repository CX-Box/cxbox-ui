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
import { filter, map } from 'rxjs'
import { sendOperation, showFileUploadPopup, showViewPopup } from '../../actions'
import { buildBcUrl, flattenOperations, matchOperationRole } from '../../utils'
import { OperationTypeCrud } from '@cxbox-ui/schema'

/**
 * Opens a popup with associate component.
 */
export const sendOperationAssociateEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(sendOperation.match),
        filter(action => matchOperationRole(OperationTypeCrud.associate, action.payload, state$.value)),
        map(action => {
            const state = state$.value
            const bcUrl = buildBcUrl(action.payload.bcName, true, state)
            const operations = flattenOperations(state.view.rowMeta[action.payload.bcName]?.[bcUrl]?.actions)
            const operation = operations.find(item => item.type === action.payload.operationType)
            if (operation.subtype === 'multiFileUpload') {
                return showFileUploadPopup({
                    widgetName: action.payload.widgetName
                })
            }
            return showViewPopup({
                // TODO: 2.0.0 bcKey and bcName will be removed in favor `widgetName`
                bcName: action.payload.bcKey ? `${action.payload.bcKey}` : `${action.payload.bcName}Assoc`,
                calleeBCName: action.payload.bcName,
                active: true,
                calleeWidgetName: action.payload.widgetName
            })
        })
    )
