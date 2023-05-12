

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { buildBcUrl } from '../../utils/strings'
import { customAction } from '../../api/api'
import { postOperationRoutine } from '../view'
import { OperationTypeCrud } from '../../interfaces/operation'

/**
 * It sends customAction request for `file-upload-save` endpoint with `bulkIds` data
 * containing ids of uploaded files.
 * On success it fires `sendOperationSuccess`, `bcForceUpdate` and `closeViewPopup` actions
 * to refresh business component and close popup.
 *
 * It also launces postOperationRoutine to handle pre and post invokes.
 *
 * @param action removeMultivalueTag
 * @param store Store instance
 */
export const fileUploadConfirm: Epic = (action$, store) =>
    action$.ofType(types.bulkUploadFiles).mergeMap(action => {
        return fileUploadConfirmImpl(action, store)
    })

/**
 * Default implementation for `fileUploadConfirm` epic
 *
 * It sends customAction request for `file-upload-save` endpoint with `bulkIds` data
 * containing ids of uploaded files.
 * On success it fires `sendOperationSuccess`, `bcForceUpdate` and `closeViewPopup` actions
 * to refresh business component and close popup.
 *
 * It also launces postOperationRoutine to handle pre and post invokes.
 *
 * @param action removeMultivalueTag
 * @param store Store instance
 * @category Epics
 */
export function fileUploadConfirmImpl(action: ActionsMap['bulkUploadFiles'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    const state = store.getState()
    const bcName = state.view.popupData.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const widgetName = state.view.widgets.find(item => item.bcName === bcName)?.name
    const data = {
        bulkIds: action.payload.fileIds
    }
    return customAction(state.screen.screenName, bcUrl, data, null, { _action: 'file-upload-save' }).mergeMap(response => {
        const postInvoke = response.postActions[0]
        const preInvoke = response.preInvoke
        return Observable.concat(
            Observable.of($do.sendOperationSuccess({ bcName, cursor: null })),
            Observable.of($do.bcForceUpdate({ bcName })),
            Observable.of($do.closeViewPopup(null)),
            ...postOperationRoutine(widgetName, postInvoke, preInvoke, OperationTypeCrud.save, bcName)
        )
    })
}
