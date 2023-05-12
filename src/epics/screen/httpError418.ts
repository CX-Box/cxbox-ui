

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { ApplicationErrorType, BusinessError } from '../../interfaces/view'
import { OperationError } from '../../interfaces/operation'

export const httpError418: Epic = (action$, store) =>
    action$
        .ofType(types.httpError)
        .filter(action => action.payload.statusCode === 418)
        .mergeMap(action => {
            return httpError418Impl(action, store)
        })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function httpError418Impl(action: ActionsMap['httpError'], store: Store<CoreStore, AnyAction>): Observable<AnyAction> {
    const { error, callContext } = action.payload
    const result: Array<Observable<AnyAction>> = []
    const typedError = error.response.data as OperationError
    if (!typedError.error.popup) {
        return Observable.empty()
    }
    const businessError: BusinessError = {
        type: ApplicationErrorType.BusinessError,
        message: typedError.error.popup[0]
    }
    result.push(Observable.of($do.showViewError({ error: businessError })))
    if (typedError.error.postActions?.[0]) {
        const widget = store.getState().view.widgets.find(item => item.name === callContext.widgetName)
        const bcName = widget.bcName
        result.push(
            Observable.of(
                $do.processPostInvoke({
                    bcName,
                    postInvoke: typedError.error.postActions[0],
                    widgetName: widget.name
                })
            )
        )
    }
    return Observable.concat(...result)
}
