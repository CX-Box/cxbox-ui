/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { bcSelectRecord, selectTableCell, selectTableCellInit } from '../../actions'
import { CXBoxEpic } from '../../interfaces'
import { concat, filter, mergeMap, Observable, of } from 'rxjs'
import { AnyAction } from '@reduxjs/toolkit'

export const selectTableCellInitEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(selectTableCellInit.match),
        mergeMap(action => {
            const resultObservables: Array<Observable<AnyAction>> = []
            const state = state$.value

            const { rowId: nextRowId, fieldKey } = action.payload

            const nextWidget = state.view.widgets.find(widget => widget.name === action.payload.widgetName)
            const nextBcName = nextWidget?.bcName
            const nextBcCursor = state.screen.bo.bc[nextBcName]?.cursor

            const selectedCell = state.view.selectedCell
            if (nextRowId !== nextBcCursor) {
                resultObservables.push(of(bcSelectRecord({ bcName: nextBcName, cursor: nextRowId })))
            }

            if (
                !selectedCell ||
                fieldKey !== selectedCell.fieldKey ||
                nextRowId !== selectedCell.rowId ||
                nextWidget?.name !== selectedCell.widgetName
            ) {
                resultObservables.push(of(selectTableCell({ widgetName: nextWidget?.name, rowId: nextRowId, fieldKey })))
            }

            return concat(...resultObservables)
        })
    )
