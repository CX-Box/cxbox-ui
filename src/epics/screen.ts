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

import { $do, types, Epic } from '../actions/actions'
import { Observable } from 'rxjs/Observable'
import { OperationPostInvokeConfirmType, OperationPreInvokeType } from '../interfaces/operation'
import { axiosInstance } from '../Provider'
import { processPostInvoke } from './screen/processPostInvoke'
import { apiError } from './screen/apiError'
import { httpError401 } from './screen/httpError401'
import { httpError409 } from './screen/httpError409'
import { httpError418 } from './screen/httpError418'
import { httpError500 } from './screen/httpError500'
import { httpErrorDefault } from './screen/httpErrorDefault'

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const downloadFile: Epic = (action$, store) =>
    action$.ofType(types.downloadFile).mergeMap(action => {
        const { fileId } = action.payload
        const anchor = document.createElement('a')
        anchor.href = `${axiosInstance.defaults.baseURL}file?id=${encodeURIComponent(fileId)}`
        anchor.style.display = 'none'
        document.body.appendChild(anchor)
        setTimeout(() => {
            anchor.click()
            document.body.removeChild(anchor)
        }, 100)
        return Observable.empty()
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const downloadFileByUrl: Epic = (action$, store) =>
    action$.ofType(types.downloadFileByUrl).mergeMap(action => {
        const { url } = action.payload
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.style.display = 'none'
        document.body.appendChild(anchor)
        setTimeout(() => {
            anchor.click()
            document.body.removeChild(anchor)
        }, 100)
        return Observable.empty()
    })

/**
 *
 * @param action$
 * @param store
 * @category Epics
 */
export const processPostInvokeConfirm: Epic = (action$, store) =>
    action$.ofType(types.processPostInvokeConfirm, types.processPreInvoke).mergeMap(action => {
        const { bcName, operationType, widgetName } = action.payload
        const confirm = action.type === types.processPostInvokeConfirm ? action.payload.postInvokeConfirm : action.payload.preInvoke
        switch (confirm.type) {
            case OperationPostInvokeConfirmType.confirm:
            case OperationPreInvokeType.info:
            case OperationPreInvokeType.error:
            case OperationPostInvokeConfirmType.confirmText: {
                return Observable.of(
                    $do.operationConfirmation({
                        operation: {
                            bcName,
                            operationType,
                            widgetName
                        },
                        confirmOperation: confirm
                    })
                )
            }
            default:
                return Observable.empty()
        }
    })

export const screenEpics = {
    processPostInvoke,
    downloadFile,
    downloadFileByUrl,
    processPostInvokeConfirm,
    apiError,
    httpError401,
    httpError409,
    httpError418,
    httpError500,
    httpErrorDefault
}

export default screenEpics
