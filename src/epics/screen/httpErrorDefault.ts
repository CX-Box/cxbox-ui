

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ApplicationErrorType } from '../../interfaces/view'
import { knownHttpErrors } from './apiError'

export const httpErrorDefault: Epic = (action$, store) =>
    action$
        .ofType(types.httpError)
        .filter(action => !knownHttpErrors.includes(action.payload.statusCode))
        .mergeMap(action => {
            return httpErrorDefaultImpl(action, store)
        })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function httpErrorDefaultImpl(action: ActionsMap['httpError'], store: Store<CoreStore, AnyAction>) {
    const businessError = {
        type: ApplicationErrorType.BusinessError,
        code: action.payload.error.response.status,
        details: action.payload.error.response.data
    }
    return Observable.of($do.showViewError({ error: businessError }))
}
