

import { Observable } from 'rxjs'
import { Store } from 'redux'
import { Epic, types, AnyAction, ActionsMap, $do } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { parseBcCursors } from '../../utils/history'

/**
 *
 * TODO: Rename to `selectView` in 2.0.0
 *
 * @param action$ `selectView` action
 * @param store
 */
export const changeView: Epic = (action$, store) =>
    action$.ofType(types.selectView).switchMap(action => {
        return selectViewImpl(action, store)
    })

/**
 *
 * @param action
 * @param store
 * @category Epics
 */
export function selectViewImpl(action: ActionsMap['selectView'], store: Store<CoreStore>): Observable<AnyAction> {
    const state = store.getState()
    const nextCursors = parseBcCursors(state.router.bcPath) || {}
    const cursorsDiffMap: Record<string, string> = {}
    Object.entries(nextCursors).forEach(entry => {
        const [bcName, cursor] = entry
        const bc = state.screen.bo.bc[bcName]
        if (!bc || bc.cursor !== cursor) {
            cursorsDiffMap[bcName] = cursor
        }
    })
    if (Object.keys(cursorsDiffMap).length) {
        return Observable.of($do.bcChangeCursors({ cursorsMap: cursorsDiffMap }))
    }
    return Observable.empty()
}
