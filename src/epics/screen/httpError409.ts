

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { openButtonWarningNotification } from '../../utils/notifications'

export const httpError409: Epic = (action$, store) =>
    action$
        .ofType(types.httpError)
        .filter(action => action.payload.statusCode === 409)
        .mergeMap(action => {
            return httpError409Impl(action, store)
        })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function httpError409Impl(action: ActionsMap['httpError'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    const notificationMessage = action.payload.error.response.data.error?.popup?.[0] || ''
    openButtonWarningNotification(notificationMessage, 'OK', 0, null, 'action_edit_error')
    return Observable.empty()
}
