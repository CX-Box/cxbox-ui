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

import { PendingValidationFailsFormat, ViewState, PendingDataItem } from '../interfaces'
import { OperationTypeCrud } from '@cxbox-ui/schema'
import { buildBcUrl } from '../utils'
import {
    bcCancelPendingChanges,
    bcFetchRowMeta,
    bcFetchRowMetaFail,
    bcFetchRowMetaSuccess,
    bcLoadMore,
    bcNewDataFail,
    bcNewDataSuccess,
    bcSaveDataFail,
    bcSaveDataSuccess,
    changeDataItem,
    changeDataItems,
    changeLocation,
    clearValidationFails,
    closeConfirmModal,
    closeNotification,
    closeViewError,
    closeViewPopup,
    dropAllAssociations,
    dropAllAssociationsFull,
    dropAllAssociationsSameBc,
    forceActiveChangeFail,
    forceActiveRmUpdate,
    operationConfirmation,
    processPostInvoke,
    selectTableCell,
    selectView,
    sendOperation,
    sendOperationFail,
    sendOperationSuccess,
    showFileUploadPopup,
    showNotification,
    showViewError,
    showViewPopup,
    viewClearPickMap,
    viewPutPickMap
} from '../actions'
import { ReducerBuilderManager } from './ReducerBuilderManager'

export const initialViewState: ViewState = {
    id: undefined,
    name: null,
    url: null,
    widgets: [],
    columns: null,
    readOnly: false,
    rowHeight: null,
    rowMeta: {},
    metaInProgress: {},
    popupData: { bcName: null },
    pendingDataChanges: {},
    infiniteWidgets: [],
    pendingValidationFailsFormat: PendingValidationFailsFormat.old,
    pendingValidationFails: {},
    handledForceActive: {},
    selectedCell: null,
    ignoreHistory: null,
    systemNotifications: [],
    error: null,
    modalInvoke: null
}

/**
 * View reducer
 *
 * Stores information about currently active view and various fast-living pending values which should be stored
 * until we navitage to a different view.
 */
export const createViewReducerBuilderManager = <S extends ViewState>(initialState: S) =>
    new ReducerBuilderManager<S>()
        .addCase(selectView, (state, action) => {
            state.rowMeta = initialViewState.rowMeta
            Object.assign(state, action.payload)
        })
        .addCase(bcFetchRowMeta, (state, action) => {
            state.metaInProgress[action.payload.bcName] = true
        })
        .addCase(bcLoadMore, (state, action) => {
            const infiniteWidgets: string[] = state.infiniteWidgets || []
            if (action.payload.widgetName !== undefined) {
                infiniteWidgets.push(action.payload.widgetName)
            }
            state.infiniteWidgets = Array.from(new Set(infiniteWidgets))
        })
        .addCase(sendOperation, (state, action) => {
            if (action.payload.operationType === OperationTypeCrud.create) {
                state.metaInProgress[action.payload.bcName] = true
            }
        })
        .addCase(bcFetchRowMetaSuccess, (state, action) => {
            state.rowMeta[action.payload.bcName][action.payload.bcUrl] = action.payload.rowMeta
            state.metaInProgress[action.payload.bcName] = false
        })
        .addCase(bcNewDataSuccess, (state, action) => {
            state.selectedCell = initialViewState.selectedCell
        })
        .addCase(forceActiveRmUpdate, (state, action) => {
            const { bcName, bcUrl, currentRecordData, rowMeta, cursor } = action.payload
            const handledForceActive: PendingDataItem = {}
            const rowMetaForcedValues: PendingDataItem = {}
            const newPendingChangesDiff: PendingDataItem = {}
            const forceActiveFieldKeys: string[] = []

            // приведем значения переданные в forcedValue в вид дельты изменений
            rowMeta.fields.forEach(field => {
                rowMetaForcedValues[field.key] = field.currentValue
                if (field.forceActive) {
                    forceActiveFieldKeys.push(field.key)
                }
            })

            const consolidatedFrontData: PendingDataItem = { ...currentRecordData, ...state.pendingDataChanges[bcName][cursor] }
            // вычислим "разницу" между консолид.данными и полученными forcedValue's в пользу последних
            Object.keys(consolidatedFrontData).forEach(key => {
                if (rowMetaForcedValues[key] !== undefined && consolidatedFrontData[key] !== rowMetaForcedValues[key]) {
                    newPendingChangesDiff[key] = rowMetaForcedValues[key]
                }
            })

            // консолидация полученной разницы с актуальной дельтой
            const newPendingDataChanges = { ...state.pendingDataChanges[bcName][cursor], ...newPendingChangesDiff }

            // отразим в списке обработанных forceActive полей - те что содержатся в новой дельте
            forceActiveFieldKeys.forEach(key => {
                if (newPendingDataChanges[key] !== undefined) {
                    handledForceActive[key] = newPendingDataChanges[key]
                }
            })

            Object.assign(state.handledForceActive[bcName][cursor], handledForceActive)
            state.pendingDataChanges[bcName][cursor] = newPendingDataChanges
            state.rowMeta[bcName][bcUrl] = rowMeta
        })
        .addCase(changeDataItem, (state, action) => {
            const actionBcName = action.payload.bcName
            const prevBc = state.pendingDataChanges[action.payload.bcName] || {}
            const prevCursor = prevBc[action.payload.cursor] || {}
            const prevPending = prevCursor || {}
            const nextPending = { ...prevPending, ...action.payload.dataItem }
            const bcUrl = buildBcUrl(actionBcName, true)
            const rowMeta = state.rowMeta[actionBcName]?.[bcUrl]
            const nextValidationFails: Record<string, string> = {}
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            Object.keys(nextPending).forEach(fieldKey => {
                const required = rowMeta?.fields.find(item => item.required && item.key === fieldKey)
                const isEmpty =
                    nextPending[fieldKey] === null ||
                    nextPending[fieldKey] === undefined ||
                    nextPending[fieldKey] === '' ||
                    (Array.isArray(nextPending[fieldKey]) && Object.keys(nextPending[fieldKey]).length === 0)
                if (required && isEmpty) {
                    nextValidationFails[fieldKey] = 'This field is mandatory'
                }
            })
            state.pendingDataChanges[action.payload.bcName][action.payload.cursor] = nextPending
            if (isTargetFormatPVF) {
                ;(state.pendingValidationFails[actionBcName] as { [cursor: string]: Record<string, string> })[action.payload.cursor] =
                    nextValidationFails
            } else {
                state.pendingValidationFails = nextValidationFails
            }
        })
        .addCase(changeDataItems, (state, action) => {
            const newPendingChanges = { ...state.pendingDataChanges[action.payload.bcName] }
            action.payload.cursors.forEach((cursor, index) => {
                newPendingChanges[cursor] = action.payload.dataItems[index]
            })
            state.pendingDataChanges[action.payload.bcName] = newPendingChanges
        })
        .addCase(dropAllAssociations, (state, action) => {
            const pendingDataChanges = { ...state.pendingDataChanges }
            action.payload.bcNames.forEach(bcName => {
                const pendingBcChanges: Record<string, PendingDataItem> = {}
                // ;(store.data[bcName] || [])
                //     .filter(item => item._associate)
                //     .forEach(item => {
                //         pendingBcChanges[item.id] = { id: item.id, _associate: false }
                //     })
                Object.keys(pendingDataChanges[bcName] || {}).forEach(itemId => {
                    pendingBcChanges[itemId] = { id: itemId, _associate: false }
                })
                pendingDataChanges[bcName] = pendingBcChanges
            })
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            const pendingValidationFails = { ...state.pendingValidationFails }
            if (isTargetFormatPVF) {
                action.payload.bcNames.forEach(i => {
                    pendingValidationFails[i] = {}
                })
            }
            state.pendingDataChanges = pendingDataChanges
            state.pendingValidationFails = isTargetFormatPVF ? pendingValidationFails : initialViewState.pendingValidationFails
        })
        //TODO: rewrite correctly (get data outside of reducer, place it in epic)
        .addCase(dropAllAssociationsSameBc, (state, action) => {
            //     const pendingDataChanges = { ...state.pendingDataChanges }
            //
            //     Object.entries({ ...store.depthData, 1: store.data }).forEach(([depthLevelKey, depthLevelData]) => {
            //         const depthLevel = Number(depthLevelKey)
            //         const pendingBcChanges: Record<string, PendingDataItem> = {}
            //         if (depthLevel >= action.payload.depthFrom && depthLevelData[action.payload.bcName]) {
            //             depthLevelData[action.payload.bcName]
            //                 .filter((item: any) => item._associate)
            //                 .forEach((item: any) => {
            //                     pendingBcChanges[item.id] = { _associate: false }
            //                 })
            //         }
            //         pendingDataChanges[action.payload.bcName] = pendingBcChanges
            //     })
            //     const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            //
            //     return {
            //         ...state,
            //         pendingDataChanges,
            //         pendingValidationFails: isTargetFormatPVF
            //             ? {
            //                   ...(state.pendingValidationFails as PendingValidationFails),
            //                   [action.payload.bcName]: {}
            //               }
            //             : initialState.pendingValidationFails
            //     }
        })
        //TODO: rewrite correctly (get data outside of reducer, place it in epic)
        .addCase(dropAllAssociationsFull, (state, action) => {
            // const bcName = action.payload.bcName
            // const pendingDataChanges = { ...state.pendingDataChanges }
            // const dropDesc = action.payload.dropDescendants
            //
            // const pendingBcChanges: Record<string, PendingDataItem> = {}
            // ;(store.data[bcName] || [])
            //     .filter(item => item._associate)
            //     .forEach(item => {
            //         if ((dropDesc && item.level === action.payload.depth) || item.level >= action.payload.depth) {
            //             pendingBcChanges[item.id] = { ...item, _associate: false }
            //         }
            //     })
            // Object.entries(pendingDataChanges[bcName] || {}).forEach(([itemId, item]) => {
            //     if ((dropDesc && item.level === action.payload.depth) || item.level >= action.payload.depth) {
            //         pendingBcChanges[itemId] = { ...item, _associate: false }
            //     }
            // })
            // pendingDataChanges[bcName] = pendingBcChanges
            // const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            //
            // return {
            //     ...state,
            //     pendingDataChanges,
            //     pendingValidationFails: isTargetFormatPVF
            //         ? {
            //               ...(state.pendingValidationFails as PendingValidationFails),
            //               [action.payload.bcName]: {}
            //           }
            //         : initialState.pendingValidationFails
            // }
        })
        .addCase(bcNewDataFail, (state, action) => {
            state.metaInProgress[action.payload.bcName] = false
        })
        .addCase(bcFetchRowMetaFail, (state, action) => {
            state.metaInProgress[action.payload.bcName] = false
        })
        .addCase(forceActiveChangeFail, (state, action) => {
            const { bcName, bcUrl, entityError } = action.payload
            const errors: Record<string, string> = {}
            if (entityError) {
                Object.entries(entityError.fields).forEach(([fieldName, violation]) => {
                    errors[fieldName] = violation
                })
            }
            state.rowMeta[bcName][bcUrl].errors = errors
        })
        .addCase(bcSaveDataFail, (state, action) => {
            const { bcName, bcUrl, entityError } = action.payload
            const errors: Record<string, string> = {}
            if (entityError) {
                Object.entries(entityError.fields).forEach(([fieldName, violation]) => {
                    errors[fieldName] = violation
                })
            }
            state.rowMeta[bcName][bcUrl].errors = errors
        })
        .addCase(sendOperationFail, (state, action) => {
            const { bcName, bcUrl, entityError } = action.payload
            const errors: Record<string, string> = {}
            if (entityError) {
                Object.entries(entityError.fields).forEach(([fieldName, violation]) => {
                    errors[fieldName] = violation
                })
            }
            state.rowMeta[bcName][bcUrl].errors = errors
        })
        .addCase(sendOperationSuccess, (state, action) => {
            const { bcName, cursor } = action.payload
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            state.pendingDataChanges[bcName][cursor] = {}
            if (isTargetFormatPVF) {
                ;(state.pendingValidationFails[bcName] as { [cursor: string]: Record<string, string> })[cursor] = {}
            } else {
                state.pendingValidationFails = initialViewState.pendingValidationFails
            }
            state.handledForceActive[bcName][cursor] = {}
        })
        .addCase(bcSaveDataSuccess, (state, action) => {
            const { bcName, cursor } = action.payload
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            state.pendingDataChanges[bcName][cursor] = {}
            if (isTargetFormatPVF) {
                ;(state.pendingValidationFails[bcName] as { [cursor: string]: Record<string, string> })[cursor] = {}
            } else {
                state.pendingValidationFails = initialViewState.pendingValidationFails
            }
            state.handledForceActive[bcName][cursor] = {}
        })
        .addCase(bcCancelPendingChanges, (state, action) => {
            // TODO: Check if this works for hierarchy after 1.1.0
            const pendingDataChanges = { ...state.pendingDataChanges }
            for (const bcName in state.pendingDataChanges) {
                if (action.payload ? action.payload.bcNames.includes(bcName) : true) {
                    pendingDataChanges[bcName] = {}
                }
            }
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            let pendingValidationFails = { ...state.pendingValidationFails }
            if (isTargetFormatPVF) {
                if (action.payload?.bcNames?.length > 0) {
                    /**
                     * Clear a `pendingValidationFails` for specific BC names
                     */
                    action.payload.bcNames.forEach(i => {
                        pendingValidationFails[i] = {}
                    })
                } else {
                    /**
                     * Clear a `pendingValidationFails` completely
                     */
                    pendingValidationFails = initialViewState.pendingValidationFails
                }
            }
            state.pendingDataChanges = pendingDataChanges
            state.pendingValidationFails = isTargetFormatPVF ? pendingValidationFails : initialViewState.pendingValidationFails
        })
        .addCase(clearValidationFails, state => {
            state.pendingValidationFails = initialViewState.pendingValidationFails
        })
        .addCase(showViewPopup, (state, action) => {
            const { bcName, calleeBCName, calleeWidgetName, associateFieldKey, assocValueKey, active, isFilter, type, widgetName } =
                action.payload
            // const widgetValueKey = store.view.widgets.find(item => item.bcName === bcName)?.options?.displayedValueKey
            state.popupData = {
                widgetName,
                type,
                bcName,
                calleeBCName,
                calleeWidgetName,
                associateFieldKey,
                assocValueKey: assocValueKey,
                active,
                isFilter
            }
        })
        .addCase(showFileUploadPopup, (state, action) => {
            const bcName = state.widgets.find(item => item.name === action.payload.widgetName)?.bcName
            state.popupData = {
                type: 'file-upload',
                bcName, // should be null
                calleeBCName: bcName
            }
        })
        .addCase(viewPutPickMap, (state, action) => {
            state.pickMap = action.payload.map
        })
        .addCase(viewClearPickMap, state => {
            state.pickMap = null
        })
        .addCase(closeViewPopup, state => {
            state.popupData.bcName = null
        })
        .addCase(selectTableCell, (state, action) => {
            state.selectedCell = { widgetName: action.payload.widgetName, rowId: action.payload.rowId, fieldKey: action.payload.fieldKey }
        })
        .addCase(changeLocation, (state, action) => {
            state.pendingDataChanges = initialViewState.pendingDataChanges
            state.selectedCell = initialViewState.selectedCell
        })
        .addCase(showNotification, (state, action) => {
            state.systemNotifications.push({
                type: action.payload.type,
                message: action.payload.message,
                id: state.systemNotifications.length
            })
        })
        .addCase(closeNotification, (state, action) => {
            state.systemNotifications = state.systemNotifications.filter(item => item.id !== action.payload.id)
        })
        .addCase(showViewError, (state, action) => {
            state.error = action.payload.error
        })
        .addCase(operationConfirmation, (state, action) => {
            state.modalInvoke = action.payload
        })
        .addCase(closeConfirmModal, (state, action) => {
            state.modalInvoke = null
        })
        .addCase(closeViewError, state => {
            state.error = null
        })
        .addCase(processPostInvoke, state => {
            state.selectedCell = null
        })
