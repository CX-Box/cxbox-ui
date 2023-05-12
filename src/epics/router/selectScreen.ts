

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'

/**
 *
 * TODO: Rename to `selectScreen` in 2.0.0
 *
 * @param action$ `selectScreen` action
 * @param store
 */
export const changeScreen: Epic = (action$, store) =>
    action$.ofType(types.selectScreen).switchMap(action => {
        return selectScreenImpl(action, store)
    })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function selectScreenImpl(action: ActionsMap['selectScreen'], store: Store<CoreStore>): Observable<AnyAction> {
    const state = store.getState()
    const nextViewName = state.router.viewName
    const requestedView = state.screen.views.find(item => item.name === nextViewName)
    const defaultView = !nextViewName && state.screen.primaryView && state.screen.views.find(item => item.name === state.screen.primaryView)
    const nextView = requestedView || defaultView || state.screen.views[0]
    return nextView
        ? Observable.of<AnyAction>($do.selectView(nextView))
        : Observable.of<AnyAction>($do.selectViewFail({ viewName: nextViewName }))
}
