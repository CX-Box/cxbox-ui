

import { Epic, types, $do, ActionsMap, AnyAction } from '../../actions/actions'
import { Observable } from 'rxjs'
import { matchOperationRole } from '../../utils/operations'
import { OperationTypeCrud } from '../../interfaces/operation'

/**
 * Fires `bcChangeCursors` and `showFileUploadPopup` to drop the cursors and show file upload popup.
 *
 * @param action sendOperation
 * @param store Store instance
 */
export const showFileUploadPopup: Epic = (action$, store) =>
    action$
        .ofType(types.sendOperation)
        .filter(action => matchOperationRole(OperationTypeCrud.fileUpload, action.payload, store.getState()))
        .mergeMap(action => {
            return showFileUploadPopupImpl(action)
        })

/**
 * Default implementation for `showFileUploadPopupImpl` epic
 *
 * Fires `bcChangeCursors` and `showFileUploadPopup` to drop the cursors and show file upload popup.
 *
 * @param action sendOperation
 * @param store Store instance
 * @category Epics
 */
export function showFileUploadPopupImpl(action: ActionsMap['sendOperation']): Observable<AnyAction> {
    return Observable.concat(
        Observable.of($do.bcChangeCursors({ cursorsMap: { [action.payload.bcName]: null } })),
        Observable.of($do.showFileUploadPopup({ widgetName: action.payload.widgetName }))
    )
}
