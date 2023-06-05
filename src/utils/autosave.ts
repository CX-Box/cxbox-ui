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

import { WidgetMeta } from '../interfaces/widget'
import { OperationTypeCrud } from '../interfaces/operation'
import { Store as CoreStore } from '../interfaces/store'
import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { sendOperation } from '../actions'

/**
 * Performs mechanism of autosave
 *
 * @param action
 * @param store
 * @param next
 * @category Utils
 */
export function autosaveRoutine(action: AnyAction, store: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>, next: Dispatch) {
    const state = store.getState()
    const dispatch = store.dispatch
    const pendingDataChanges = state.view.pendingDataChanges
    const bcList = Object.keys(pendingDataChanges)
    /**
     * Here we need to find BC with unsaved changes called `baseBcName`
     * because current action will be dispatched after `baseBcName` saving.
     * 1. We need to check out if bcName of current action is suitable for that aim
     * 2. Otherwise find first unsaved bcName
     */
    const baseBcNameIndex =
        action.payload?.bcName &&
        bcHasPendingAutosaveChanges(state, action.payload.bcName, state.screen.bo.bc[action.payload.bcName]?.cursor)
            ? bcList.findIndex(bcName => bcName === action.payload?.bcName)
            : bcList.findIndex(bcName => bcHasPendingAutosaveChanges(state, bcName, state.screen.bo.bc[bcName]?.cursor))
    const baseBcName = bcList[baseBcNameIndex]
    /**
     * Here we need to form a list of rest BC names.
     * We exclude `baseBcName` from `bcList`
     */
    if (baseBcNameIndex > -1) {
        bcList.splice(baseBcNameIndex, 1)
    }
    /**
     * Saving process
     */
    if (baseBcName) {
        /**
         * Save all BCs except `baseBcName`
         */
        bcList.forEach(bcName => {
            const widget = state.view.widgets.find((v: WidgetMeta) => v.bcName === bcName)
            const cursor = state.screen.bo.bc[bcName]?.cursor
            if (bcHasPendingAutosaveChanges(state, bcName, cursor)) {
                dispatch(
                    sendOperation({
                        bcName: bcName,
                        operationType: OperationTypeCrud.save,
                        widgetName: widget.name
                    })
                )
            }
        })
        /**
         * save `baseBcName`'s BC
         */
        const baseWidget = state.view.widgets.find((v: WidgetMeta) => v.bcName === baseBcName)
        return next(
            sendOperation({
                bcName: baseBcName,
                operationType: OperationTypeCrud.save,
                widgetName: baseWidget.name,
                onSuccessAction: action
            })
        )
    }
    return next(action)
}

/**
 * Checks presence of pending changes suitable for autosave
 *
 * @param store
 * @param bcName
 * @param cursor
 */
export function bcHasPendingAutosaveChanges(store: CoreStore, bcName: string, cursor: string) {
    const pendingChanges = store.view.pendingDataChanges
    const cursorChanges = pendingChanges[bcName]?.[cursor]
    const result = cursorChanges && !Object.keys(cursorChanges).includes('_associate') && Object.values(cursorChanges).length > 0
    return result
}

/**
 * Checks presence of unsaved data.ts for specified BC
 *
 * @param store
 * @param bcName
 */
export function checkUnsavedChangesOfBc(store: CoreStore, bcName: string) {
    const pendingCursors = Object.keys(store.view.pendingDataChanges?.[bcName] ?? {})
    return pendingCursors.some(cursor => bcHasPendingAutosaveChanges(store, bcName, cursor))
}
