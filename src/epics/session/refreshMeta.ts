

import { $do, Epic, types } from '../../actions/actions'
import { Observable } from 'rxjs/Observable'
import { refreshMeta } from '../../api'

/**
 * Performed on refresh meta data process.
 *
 * @param action$ This epic will fire on {@link ActionPayloadTypes.refreshMeta | refreshMeta} action
 * @param store Redux store instance
 * @category Epics
 */
export const refreshMetaEpic: Epic = (action$, store): Observable<any> =>
    action$.ofType(types.refreshMeta).mergeMap(() => {
        const state = store.getState()
        const { router } = state
        const { activeRole } = state.session
        console.log('refreshMetaEpic')
        return refreshMeta().switchMap(() => {
            return Observable.concat([
                $do.logoutDone(null),
                $do.login({ login: null, password: null, role: activeRole }),
                $do.changeLocation({
                    location: router,
                    action: 'PUSH'
                })
            ]).catch(error => Observable.of($do.loginFail(error)))
        })
    })
