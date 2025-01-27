import { BcDataResponse, CXBoxEpic, OperationPostInvokeWaitUntil, Store } from '../../interfaces'
import { actions, Api } from '../../index'
import { catchError, concat, delay, EMPTY, filter, map, mergeMap, Observable, of, timeout, TimeoutError } from 'rxjs'
import { bcForceUpdate, closeViewPopup, showViewPopup, WaitUntilPopupOptions } from '../../actions'
import { buildBcUrl, createApiErrorObservable, getFilters, getSorters } from '../../utils'
import { DataItem } from '@cxbox-ui/schema'

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
    bcName: string
): Observable<BcDataResponse> => {
    const { timeout: repeatTimeout = 5000, timeoutMaxRequests = 5 } = postInvoke
    const { successCondition_bcName, successCondition_fieldKey, successCondition_value } = postInvoke
    const requestInterval = Math.floor(+repeatTimeout / +timeoutMaxRequests)

    return fetchDataRequest(successCondition_bcName ?? bcName, state, api).pipe(
        mergeMap(response => {
            const data = response.data

            return successCondition(data, successCondition_fieldKey, successCondition_value)
                ? of(response)
                : of(null).pipe(
                      delay(requestInterval),
                      mergeMap(() => recursiveQueryWithRepeat(state, api, postInvoke, bcName))
                  )
        }),
        timeout(+repeatTimeout)
    )
}

export const waitUntilEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(actions.waitUntil.match),
        mergeMap(action => {
            const { bcName, postInvoke } = action.payload

            const showPopup = (status: WaitUntilPopupOptions['status'], message?: string) => {
                const popupIsActive = state$.value.view.popupData.type === 'waitUntil'
                const isProgressStatus = status === 'progress'
                const isFinalStatus = !isProgressStatus

                if (isProgressStatus || (isFinalStatus && message && popupIsActive)) {
                    return of(
                        showViewPopup({
                            type: 'waitUntil',
                            bcName,
                            calleeBCName: bcName,
                            options: { status, message }
                        })
                    )
                }

                if (isFinalStatus && !message && popupIsActive) {
                    return of(closeViewPopup({ bcName }))
                }

                return EMPTY
            }

            const forceUpdate = () => {
                const popupIsActive = state$.value.view.popupData.type === 'waitUntil'
                const currentBcIsExist = state$.value.screen.bo.bc[bcName]

                return currentBcIsExist && popupIsActive ? of(bcForceUpdate({ bcName })) : EMPTY
            }

            const requestResult = recursiveQueryWithRepeat(state$.value, api, postInvoke, bcName).pipe(
                map(response => response.data),
                mergeMap(data => {
                    return concat(forceUpdate(), showPopup('success', postInvoke.successMessage))
                }),
                catchError(error => {
                    if (error instanceof TimeoutError) {
                        return concat(forceUpdate(), showPopup('timeout', postInvoke.timeoutMessage))
                    }

                    return concat(of(closeViewPopup({ bcName })), createApiErrorObservable(error))
                })
            )

            return concat(showPopup('progress', postInvoke.inProgressMessage), requestResult)
        })
    )
