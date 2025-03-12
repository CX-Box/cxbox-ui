import { BcDataResponse, BcMetaState, CXBoxEpic, OperationPostInvokeWaitUntil, Store } from '../../interfaces'
import {
    catchError,
    concat,
    delay,
    EMPTY,
    filter,
    map,
    mergeMap,
    Observable,
    of,
    switchMap,
    take,
    takeUntil,
    timeout,
    TimeoutError
} from 'rxjs'
import { bcForceUpdate, closeViewPopup, showViewPopup, waitUntil, WaitUntilPopupOptions } from '../../actions'
import { buildBcUrl, createApiErrorObservable, getFilters, getSorters } from '../../utils'
import { DataItem } from '@cxbox-ui/schema'
import { Api } from '../../api'
import { StateObservable } from 'redux-observable'

const fetchDataRequest = <S extends Store, A extends Api>(bcName: string, state: S, api: A) => {
    const bc = state.screen.bo.bc[bcName]
    const limitBySelfCursor = state.router.bcPath?.includes(`${bcName}/${bc.cursor}`)
    const bcUrl = buildBcUrl(bcName, limitBySelfCursor, state)
    const fetchParams: Record<string, any> = {
        _page: bc.page ?? 1,
        _limit: bc.limit ?? 5,
        ...getFilters(state.screen.filters[bcName] || []),
        ...getSorters(state.screen.sorters[bcName])
    }

    return api.fetchBcData(state.screen.screenName, bcUrl, fetchParams)
}

const successCondition = (data: DataItem[], fieldKey: string, valueForComparison: unknown) => {
    return data.some(dataItem => dataItem[fieldKey] === valueForComparison)
}

const recursiveQueryWithRepeat = <S extends Store, A extends Api>(
    state: S,
    api: A,
    postInvoke: Omit<OperationPostInvokeWaitUntil, 'type'>,
    currentBcName: string
): Observable<BcDataResponse> => {
    const { timeout: repeatTimeout = 5000, timeoutMaxRequests = 5 } = postInvoke
    const { successCondition_fieldKey, successCondition_value } = postInvoke
    const requestInterval = Math.floor(+repeatTimeout / +timeoutMaxRequests)

    return fetchDataRequest(currentBcName, state, api).pipe(
        mergeMap(response => {
            const data = response.data

            return successCondition(data, successCondition_fieldKey, successCondition_value)
                ? of(response)
                : of(null).pipe(
                      delay(requestInterval),
                      mergeMap(() => recursiveQueryWithRepeat(state, api, postInvoke, currentBcName))
                  )
        }),
        timeout(+repeatTimeout)
    )
}

const getBcHierarchyArr = (bcDictionary: Record<string, BcMetaState>, bcName: string): string[] => {
    const bcHierarchy: string[] = [bcName]
    let parentBcName = bcDictionary[bcName]?.parentName

    while (parentBcName) {
        bcHierarchy.push(parentBcName)

        parentBcName = bcDictionary[parentBcName]?.parentName
    }

    return bcHierarchy.reverse()
}

const checkingReadinessForBuildBcUrl =
    (bcName: string) =>
    <S extends Store>(state: S) => {
        const bcDictionary = state.screen.bo.bc
        const bcNamesForChecking = getBcHierarchyArr(bcDictionary, bcName)

        return bcNamesForChecking.every(
            bcNameForChecking => bcDictionary[bcNameForChecking]?.loading === false && bcDictionary[bcNameForChecking]?.cursor
        )
    }

const getCheckedStateForBuildBcUrl = (state$: StateObservable<Store>, currentBcName: string) => {
    const currentState = state$.value

    return checkingReadinessForBuildBcUrl(currentBcName)(currentState)
        ? of(currentState)
        : state$.pipe(filter(checkingReadinessForBuildBcUrl(currentBcName)), take(1))
}

export const waitUntilEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(waitUntil.match),
        mergeMap(action => {
            const { bcName: actionBcName, postInvoke } = action.payload
            const { successCondition_bcName } = postInvoke
            const currentBcName = successCondition_bcName ?? actionBcName

            const switchPopup = (status: WaitUntilPopupOptions['status'], message?: string) => {
                const isProgressStatus = status === 'progress'
                const isFinalStatus = !isProgressStatus

                if (isProgressStatus || (isFinalStatus && message)) {
                    return of(
                        showViewPopup({
                            type: 'waitUntil',
                            bcName: actionBcName,
                            calleeBCName: actionBcName,
                            options: { status, message }
                        })
                    )
                }

                if (isFinalStatus && !message) {
                    return of(closeViewPopup({ bcName: actionBcName }))
                }

                return EMPTY
            }

            const forceUpdate = (bcName: string) => {
                const currentBcIsExist = state$.value.screen.bo.bc[bcName]

                return currentBcIsExist ? of(bcForceUpdate({ bcName })) : EMPTY
            }

            const requestResult = getCheckedStateForBuildBcUrl(state$, currentBcName).pipe(
                switchMap(checkedState => {
                    return recursiveQueryWithRepeat(checkedState, api, postInvoke, currentBcName).pipe(
                        takeUntil(
                            action$.pipe(
                                filter(closeAction => {
                                    return closeViewPopup.match(closeAction)
                                })
                            )
                        ),
                        map(response => response.data),
                        mergeMap(data => {
                            return concat(forceUpdate(currentBcName), switchPopup('success', postInvoke.successMessage))
                        }),
                        catchError(error => {
                            if (error instanceof TimeoutError) {
                                return concat(forceUpdate(currentBcName), switchPopup('timeout', postInvoke.timeoutMessage))
                            }

                            return concat(of(closeViewPopup({ bcName: actionBcName })), createApiErrorObservable(error))
                        })
                    )
                })
            )

            return concat(switchPopup('progress', postInvoke.inProgressMessage), requestResult)
        })
    )
