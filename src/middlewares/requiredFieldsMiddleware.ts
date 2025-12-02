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

/**
 * Handles validation of "required fields" for widget operations
 */

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'
import {
    isWidgetFieldBlock,
    Operation,
    OperationGroup,
    OperationTypeCrud,
    PendingDataItem,
    PendingValidationFailsFormat,
    PopupWidgetTypes,
    RowMetaField,
    Store,
    TableLikeWidgetTypes,
    WidgetFieldBlock,
    WidgetTableMeta
} from '../interfaces'
import {
    addNotification,
    bcCancelPendingChanges,
    changeDataItem,
    clearValidationFails,
    selectTableRowInit,
    sendOperation
} from '../actions'
import { buildBcUrl, checkShowCondition, flattenOperations } from '../utils'
import { WidgetField } from '@cxbox-ui/schema'
import { FieldType } from '../interfaces/view'
import { getRequiredFieldsMissing } from '../utils/getRequiredFieldsMissing'

const skipValidationTypes = [...PopupWidgetTypes, 'FormPopup']

export const requiredFields: Middleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch, Store>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        const state = getState()
        if (sendOperation.match(action)) {
            const { bcName, operationType, widgetName, confirmOperation } = action.payload
            const cursor = state.screen.bo.bc[bcName]?.cursor
            if (cursor) {
                const bcUrl = buildBcUrl(bcName, true, state)
                const record = state.data[bcName]?.find(item => item.id === cursor)
                const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
                const pendingValues = state.view.pendingDataChanges[bcName]?.[cursor]
                const widget = state.view.widgets.find(item => item.name === widgetName)
                const confirmWidgetName = confirmOperation?.widget
                const confirmWidget = confirmWidgetName && state.view.widgets.find(item => item.name === confirmWidgetName)
                // If operation marked as validation-sensetive, mark all 'required' fields which haven't been filled as dirty and invalid
                if (operationRequiresAutosave(operationType, rowMeta?.actions)) {
                    // While `required` fields are assigned via rowMeta, only visually visible fields should be checked
                    // to avoid situations when field is marked as `required` but not available for user to interact.
                    const hiddenFieldKeys: string[] = []
                    const fieldsToCheck: Record<string, RowMetaField> = {}
                    const skipConfirmWidgetFieldsCheck = confirmWidget && confirmWidget.bcName === bcName
                    const popupWidgetName = state.view.popupData?.widgetName
                    // Form could be split into multiple widgets so we check all widget with the same BC as action initiator.
                    // TODO: use visibleSameBcWidgets instead of state.view.widgets (i.e. widgets showCondition should be respected)
                    state.view.widgets
                        .filter(
                            item =>
                                item.bcName === widget?.bcName &&
                                (!skipValidationTypes.includes(item.type) || item.name === popupWidgetName)
                        )
                        .forEach(item => {
                            const showConditionBcName = item.showCondition?.bcName
                            const isWidgetVisible = checkShowCondition(
                                item.showCondition,
                                state.screen.bo.bc[showConditionBcName]?.cursor || '',
                                state.data[showConditionBcName],
                                state.view.pendingDataChanges
                            )
                            const itemFieldsCalc = [...item.fields]
                            if (item.fields) {
                                item.fields.forEach((block: Record<string, unknown> | WidgetFieldBlock<unknown>) => {
                                    if (isWidgetFieldBlock(block)) {
                                        block.fields.forEach((field: []) => itemFieldsCalc.push(field))
                                    }
                                })
                            }
                            itemFieldsCalc.forEach((widgetField: WidgetField) => {
                                const matchingRowMeta = rowMeta?.fields?.find(rowMetaField => rowMetaField.key === widgetField.key)
                                const isConfirmWidgetField =
                                    skipConfirmWidgetFieldsCheck &&
                                    confirmWidget?.fields?.find((field: WidgetField) => field.key === widgetField.key)

                                if (!fieldsToCheck[widgetField.key] && matchingRowMeta && !isConfirmWidgetField) {
                                    fieldsToCheck[widgetField.key] = matchingRowMeta

                                    if (
                                        !isWidgetVisible ||
                                        widgetField.hidden ||
                                        widgetField.type === FieldType.hidden ||
                                        matchingRowMeta.hidden
                                    ) {
                                        hiddenFieldKeys.push(widgetField.key)
                                    }
                                }
                            })
                        })
                    const dataItem: PendingDataItem = getRequiredFieldsMissing(record, pendingValues, Object.values(fieldsToCheck))
                    // For tables, try to autofocus on first missing field
                    if (dataItem && TableLikeWidgetTypes.includes((widget as WidgetTableMeta)?.type)) {
                        dispatch(selectTableRowInit({ widgetName, rowId: cursor }))
                    }

                    const requiredHiddenFieldKeys = dataItem && hiddenFieldKeys.filter(item => item in dataItem)
                    const requiredHiddenFieldKeysLength = requiredHiddenFieldKeys?.length

                    if (requiredHiddenFieldKeysLength) {
                        dispatch(
                            addNotification({
                                key: 'requiredFieldHidden',
                                type: 'error',
                                message:
                                    requiredHiddenFieldKeysLength === 1
                                        ? 'The form contains a required field that is not available for completion. Contact your administrator.'
                                        : 'The form contains required fields that are not available for completion. Contact your administrator.',
                                duration: 0,
                                options: {
                                    messageOptions: { value: requiredHiddenFieldKeys.join('", "') }
                                }
                            })
                        )
                    }

                    return dataItem
                        ? next(changeDataItem({ bcName, bcUrl: buildBcUrl(bcName, true, state), cursor, dataItem }))
                        : next(action)
                }

                // If operation is in cancelling pool, there is no need to validate
                if (isOperationSkipsValidation(operationType)) {
                    return next(action)
                }

                // If operation is not validation-sensetive and validation failed, offer to drop pending changes
                if (hasPendingValidationFails(state, bcName)) {
                    return next(
                        addNotification({
                            key: 'requiredFieldsMissing',
                            type: 'buttonWarningNotification',
                            message: 'Required fields are missing',
                            duration: 0,
                            options: {
                                buttonWarningNotificationOptions: {
                                    buttonText: 'Cancel changes',
                                    actionsForClick: [bcCancelPendingChanges(null), clearValidationFails(null)]
                                }
                            }
                        })
                    )
                }
            }
        }

        return next(action)
    }

/**
 * Check operations and operation groups for 'autoSaveBefore' flag (i.e. operation is validation-sensetive)
 *
 * @param operationType Key of operation to check
 * @param actions List of operations and/or operation groups
 */
export function operationRequiresAutosave(operationType: string, actions: Array<Operation | OperationGroup>) {
    let result = false
    if (!actions) {
        console.error('rowMeta is missing in the middle of "sendOperation" action')
        return result
    }
    result = flattenOperations(actions).some(action => action.type === operationType && action.autoSaveBefore)
    return result
}

/**
 * Checks if `pendingValidationFails` is not empty
 *
 * @param store
 * @param bcName
 */
export function hasPendingValidationFails(store: Store, bcName: string) {
    // TODO 2.0.0: remove this `if` block of code
    if (
        store.view.pendingValidationFailsFormat !== PendingValidationFailsFormat.target &&
        store.view.pendingValidationFails &&
        Object.keys(store.view.pendingValidationFails).length
    ) {
        return true
    }
    let checkResult = false
    const bcPendingValidations = store.view.pendingValidationFails?.[bcName] as { [cursor: string]: Record<string, string> }
    const cursorsList = bcPendingValidations && Object.keys(bcPendingValidations)
    if (!cursorsList) {
        return false
    }
    let i = 0
    for (; i < cursorsList.length; i++) {
        if (Object.keys(bcPendingValidations[cursorsList[i]]).length) {
            checkResult = true
            break
        }
    }
    return checkResult
}

function isOperationSkipsValidation(operationType: string) {
    return [OperationTypeCrud.delete, OperationTypeCrud.cancelCreate, 'cancel'].includes(operationType)
}
