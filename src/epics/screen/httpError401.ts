

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { historyObj } from '../../reducers/router'

export const httpError401: Epic = (action$, store) =>
    action$
        .ofType(types.httpError)
        .filter(action => action.payload.statusCode === 401)
        .mergeMap(action => {
            return httpError401Impl(action, store)
        })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function httpError401Impl(action: ActionsMap['httpError'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    store.dispatch($do.logoutDone(null))
    historyObj.push('/')
    return Observable.empty()
}
