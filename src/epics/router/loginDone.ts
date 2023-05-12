

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { RouteType } from '../../interfaces/router'

/**
 * Fires `selectScreen` or `selectScreenFail` to set requested in url screen as active
 * after succesful login.
 *
 * For server-side router fires `handleRouter` instead.
 *
 * @param action$ loginDone
 */
export const loginDone: Epic = (action$, store) =>
    action$.ofType(types.loginDone).switchMap(action => {
        return loginDoneImpl(action, store)
    })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function loginDoneImpl(action: ActionsMap['loginDone'], store: Store<CoreStore>): Observable<AnyAction> {
    const state = store.getState()

    if (state.router.type === RouteType.router) {
        return Observable.of($do.handleRouter(state.router))
    }

    const nextScreenName = state.router.screenName
    const nextScreen =
        state.session.screens.find(item => (nextScreenName ? item.name === nextScreenName : item.defaultScreen)) || state.session.screens[0]
    return nextScreen
        ? Observable.of<AnyAction>($do.selectScreen({ screen: nextScreen }))
        : Observable.of<AnyAction>($do.selectScreenFail({ screenName: nextScreenName }))
}
