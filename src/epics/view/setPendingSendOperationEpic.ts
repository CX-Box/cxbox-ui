import { catchError, EMPTY, filter, map, switchMap, take, withLatestFrom } from 'rxjs'
import { isAnyOf } from '@reduxjs/toolkit'
import { addNotification, forceActiveChangeFail, forceActiveRmUpdate, sendOperation, setPendingSendOperation } from '../../actions'
import { CXBoxEpic } from '../../interfaces'
import { buildBcUrl, flattenOperations } from '../../utils'

export const setPendingSendOperationEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(setPendingSendOperation.match),
        switchMap(action => {
            return action$.pipe(
                filter(isAnyOf(forceActiveRmUpdate, forceActiveChangeFail)),
                take(1),
                withLatestFrom(state$),
                map(([_, state]) => {
                    const { operationType, widgetName } = action.payload
                    const bcName = state.view.widgets.find(widgetItem => widgetItem.name === widgetName)?.bcName
                    const bcUrl = buildBcUrl(bcName, true, state)
                    const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
                    const actions = rowMeta && flattenOperations(rowMeta.actions)
                    const operation = actions?.find(item => item.type === operationType)

                    return operation
                        ? sendOperation({ ...action.payload, confirmOperation: operation.preInvoke, bcKey: operation.bcKey })
                        : addNotification({
                              key: 'rowMetaActionMissing',
                              type: 'error',
                              message: 'Operation not available',
                              options: {
                                  messageOptions: { operationType }
                              },
                              duration: 15
                          })
                }),
                catchError(() => EMPTY)
            )
        })
    )
