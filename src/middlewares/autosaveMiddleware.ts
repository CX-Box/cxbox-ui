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
import { $do, types } from '../actions/actions'
import { coreOperations, OperationTypeCrud } from '../interfaces/operation'
import { Store as CoreStore } from '../interfaces/store'
import { autosaveRoutine, checkUnsavedChangesOfBc } from '../utils/autosave'
import { WidgetOperations } from '@cxbox-ui/schema'

const saveFormMiddleware = ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, CoreStore>) => (next: Dispatch) => (
    action: AnyAction
) => {
    const state = getState()

    // TODO: Should offer to save pending changes or drop them

    const isSendOperation = action.type === types.sendOperation
    const isCoreSendOperation = isSendOperation && coreOperations.includes(action.payload.operationType)
    const isSelectTableCellInit = action.type === types.selectTableCellInit

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
    const isChangeLocation = defaultSaveWidget && action.type === types.changeLocation && Object.keys(pendingData || {}).length > 0
    if (isChangeLocation) {
        return next(
            $do.sendOperation({
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
