

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { notification } from 'antd'
import i18n from 'i18next'

/**
 * Throws a error popup when attempting to navigate to the view which is missing for current session
 *
 * @param action$ selectViewFail
 */
export const selectViewFail: Epic = (action$, store) =>
    action$.ofType(types.selectViewFail).mergeMap(action => {
        return selectViewFailImpl(action, store)
    })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function selectViewFailImpl(action: ActionsMap['selectViewFail'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    notification.error({
        message: i18n.t('View is missing or unavailable for your role', { viewName: action.payload.viewName }),
        duration: 15
    })
    return Observable.empty()
}
