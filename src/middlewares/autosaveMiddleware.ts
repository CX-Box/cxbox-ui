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

import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { coreOperations, OperationTypeCrud } from '../interfaces'
import { Store as CoreStore } from '../interfaces/store'
import { autosaveRoutine, checkUnsavedChangesOfBc } from '../utils/autosave'
import { WidgetOperations } from '@cxbox-ui/schema'
import { changeLocation, selectTableCellInit, sendOperation } from '../actions'

const saveFormMiddleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        const state = getState()

        // TODO: Should offer to save pending changes or drop them

        const isSendOperation = sendOperation.match(action)
        const isCoreSendOperation = isSendOperation && coreOperations.includes(action.payload.operationType as OperationTypeCrud)
        const isSelectTableCellInit = selectTableCellInit.match(action)

        /**
         * Saving actions should be ignored
         */
        const isSaveAction = isSendOperation && action.payload.operationType === OperationTypeCrud.save
        const isNotSaveAction = !isSaveAction

        /**
         * Checking if the action is `sendOperation` of core type which called for another BC
         * Also BCs having pending `_associate` should be ignored
         */
        const actionBcName = isSendOperation && action.payload.bcName
        const hasAnotherUnsavedBc =
            Object.keys(state.view.pendingDataChanges)
                .filter(key => key !== actionBcName)
                .filter(key => checkUnsavedChangesOfBc(state, key)).length > 0
        const isSendOperationForAnotherBc = isCoreSendOperation && hasAnotherUnsavedBc

        /**
         * Checking if the action is `selectTableCellInit` called for another row or another widget
         */
        const selectedCell = state.view.selectedCell
        const isSelectTableCellInitOnAnotherRowOrWidget =
            selectedCell &&
            isSelectTableCellInit &&
            (selectedCell.widgetName !== action.payload.widgetName || selectedCell.rowId !== action.payload.rowId)

        /**
         * Default save operation as custom action
         *
         * If widget have only custom actions, `defaultSave` option mean witch action
         * must be executed as save record.
         * Current changeLocation action as onSuccessAction
         */
        const defaultSaveWidget = state.view.widgets?.find(item => item?.options?.actionGroups?.defaultSave)
        const defaultCursor = state.screen.bo.bc?.[defaultSaveWidget?.bcName]?.cursor
        const pendingData = state.view?.pendingDataChanges?.[defaultSaveWidget?.bcName]?.[defaultCursor]
        const isChangeLocation = defaultSaveWidget && changeLocation.match(action) && Object.keys(pendingData || {}).length > 0
        if (isChangeLocation) {
            return next(
                sendOperation({
                    bcName: defaultSaveWidget.bcName,
                    operationType: (defaultSaveWidget.options.actionGroups as WidgetOperations).defaultSave,
                    widgetName: defaultSaveWidget.name,
                    onSuccessAction: action
                })
            )
        }

        /**
         * final condition
         */
        const isNeedSaveCondition = isNotSaveAction && (isSendOperationForAnotherBc || isSelectTableCellInitOnAnotherRowOrWidget)
        /**
         * Default save operation CRUD
         */
        if (isNeedSaveCondition) {
            return autosaveRoutine(action, { getState, dispatch }, next)
        }

        return next(action)
    }

/**
 *
 */
export function createAutoSaveMiddleware() {
    return saveFormMiddleware
}
