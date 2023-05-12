

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ApplicationErrorType, SystemError } from '../../interfaces/view'

export const httpError500: Epic = (action$, store) =>
    action$
        .ofType(types.httpError)
        .filter(action => action.payload.statusCode === 500)
        .mergeMap(action => {
            return httpError500Impl(action, store)
        })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function httpError500Impl(action: ActionsMap['httpError'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    const systemError: SystemError = {
        type: ApplicationErrorType.SystemError,
        details: action.payload.error.response.statusText,
        error: action.payload.error
    }
    return Observable.of($do.showViewError({ error: systemError }))
}
