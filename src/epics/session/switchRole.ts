

import { $do, Epic, types } from '../../actions/actions'
import { Observable } from 'rxjs'

/**
 * Activates process of role switching
 *
 * @param action$ This epic will fire on {@link ActionPayloadTypes.switchRole | switchRole} action
 * @param store Redux store instance
 * @category Epics
 */
export const switchRoleEpic: Epic = (action$, store) =>
    action$.ofType(types.switchRole).switchMap(action => {
        return Observable.concat([$do.logoutDone(null), $do.login({ login: null, password: null, role: action.payload.role })])
    })
