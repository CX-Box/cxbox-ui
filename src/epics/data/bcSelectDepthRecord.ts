

import { Observable } from 'rxjs'
import { Epic, types, $do, AnyAction, ActionsMap } from '../../actions/actions'

export const bcSelectDepthRecord: Epic = action$ =>
    action$.ofType(types.bcSelectDepthRecord).mergeMap(action => {
        return bcSelectDepthRecordImpl(action)
    })

/**
 * Set a cursor when expanding a record in hierarchy widgets builded around single business components
 * and fetch the data for children of expanded record.
 *
 * {@link ActionPayloadTypes.bcChangeDepthCursor | bcChangeDepthCursor} action is dispatched to set the cursor
 * for expanded record; only one expanded record is allowed per hierarchy depth level.
 *
 * {@link ActionPayloadTypes.bcFetchDataRequest | bcFetchDataRequest} action is dispatched to fetch children data
 * for expanded record. `ignorePageLimit`` is set as there are no controls for navigating between data pages
 * in nested levels of hierarchy so instead all records are fetched.
 *
 * TODO: There is no apparent reason why `widgetName` is empty; probably will be mandatory and replace `bcName` in 2.0.0.
 *
 * @param action This epic will fire on {@link ActionPayloadTypes.bcSelectDepthRecord | bcSelectDepthRecord} action
 * @deprecated Do not use; TODO: Will be removed in 2.0.0
 * @category Epics
 */
export function bcSelectDepthRecordImpl(action: ActionsMap['bcSelectDepthRecord']): Observable<AnyAction> {
    const { bcName, cursor, depth } = action.payload
    return Observable.concat(
        Observable.of($do.bcChangeDepthCursor({ bcName, depth, cursor })),
        Observable.of(
            $do.bcFetchDataRequest({
                bcName,
                depth: depth + 1,
                widgetName: '',
                ignorePageLimit: true
            })
        )
    )
}
