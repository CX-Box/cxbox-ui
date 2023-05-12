

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ApplicationErrorType } from '../../interfaces/view'
import axios from 'axios'

export const knownHttpErrors = [401, 409, 418, 500]

export const apiError: Epic = (action$, store) =>
    action$.ofType(types.apiError).mergeMap(action => {
        return apiErrorImpl(action, store)
    })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function apiErrorImpl(action: ActionsMap['apiError'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    const { error, callContext } = action.payload
    if (error.response) {
        return Observable.of(
            $do.httpError({
                statusCode: error.response.status,
                error,
                callContext
            })
        )
    } else if (!axios.isCancel(error)) {
        return Observable.of(
            $do.showViewError({
                error: {
                    type: ApplicationErrorType.NetworkError
                }
            })
        )
    }
    return Observable.empty()
}
