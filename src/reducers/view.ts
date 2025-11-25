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
import { DataItem, OperationTypeCrud } from '@cxbox-ui/schema'
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
    clearSelectedRows,
    clearValidationFails,
    closeConfirmModal,
    closeNotification,
    closeViewError,
    closeViewPopup,
    deselectRows,
    deselectTableRow,
    dropAllAssociations,
    dropAllAssociationsFull,
    dropAllAssociationsSameBc,
    forceActiveChangeFail,
    forceActiveRmUpdate,
    operationConfirmation,
    processPostInvoke,
    applyPendingPostInvoke,
    selectRows,
    selectTableRow,
    selectView,
    sendOperation,
    sendOperationFail,
    sendOperationSuccess,
    setPendingPostInvoke,
    showFileUploadPopup,
    showNotification,
    showViewError,
    showViewPopup,
    viewClearPickMap,
    viewPutPickMap
} from '../actions'
import { ReducerBuilderManager } from './ReducerBuilderManager'
import { applyValidationFails, calculateNewPendingChanges, extractForceActiveInfo, updateHandledForceActive } from './view.utils'
import { isEmptyFieldValue } from '../utils/isEmptyFieldValue'

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
    pendingPostInvoke: {},
    pendingDataChangesNow: {},
    infiniteWidgets: [],
    pendingValidationFailsFormat: PendingValidationFailsFormat.old,
    pendingValidationFails: {},
    handledForceActive: {},
    selectedRow: null,
    selectedRows: {},
    ignoreHistory: null,
    systemNotifications: [],
    error: null,
    modalInvoke: null
}

const getFailsByRequiredFields = (data: PendingDataItem, isRequired: (fieldKey: string) => boolean) => {
    const fails: Record<string, string> = {}

    Object.keys(data).forEach(fieldKey => {
        if (isRequired(fieldKey) && isEmptyFieldValue(data[fieldKey])) {
            fails[fieldKey] = 'This field is mandatory'
        }
    })

    return fails
}

/**
 * View reducer
 *
 * Stores information about currently active view and various fast-living pending values which should be stored
 * until we navigate to a different view.
 */
export const createViewReducerBuilderManager = <S extends ViewState>(initialState: S) =>
    new ReducerBuilderManager<S>()
        .addCase(selectView, (state, action) => {
            if (!action.payload.isTab) {
                state.rowMeta = initialViewState.rowMeta
            }
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
            state.rowMeta[action.payload.bcName] = state.rowMeta[action.payload.bcName] ?? {}
            state.rowMeta[action.payload.bcName][action.payload.bcUrl] = action.payload.rowMeta
            state.metaInProgress[action.payload.bcName] = false
        })
        .addCase(bcNewDataSuccess, (state, action) => {
            state.selectedRow = initialViewState.selectedRow
        })
        .addCase(forceActiveRmUpdate, (state, action) => {
            const { bcName, bcUrl, currentRecordData, rowMeta, cursor } = action.payload

            const { rowMetaForcedValues, forceActiveFieldKeys } = extractForceActiveInfo(rowMeta.fields)

            state.pendingDataChanges[bcName] = state.pendingDataChanges[bcName] ?? {}
            const currentPendingChanges = state.pendingDataChanges[bcName][cursor]

            const { newPendingDataChanges } = calculateNewPendingChanges(currentRecordData, currentPendingChanges, rowMetaForcedValues)

            const isRequired = (fieldKey: string) => !!rowMeta.fields.some(item => item.required && item.key === fieldKey)
            const nextValidationFails = getFailsByRequiredFields(newPendingDataChanges, isRequired)

            applyValidationFails(state, bcName, cursor, nextValidationFails)

            updateHandledForceActive(state, bcName, cursor, forceActiveFieldKeys, newPendingDataChanges)

            state.pendingDataChanges[bcName][cursor] = newPendingDataChanges

            state.pendingDataChangesNow[bcName] = state.pendingDataChangesNow[bcName] ?? {}
            state.pendingDataChangesNow[bcName][cursor] = {}

            state.rowMeta[bcName] = state.rowMeta[bcName] ?? {}
            state.rowMeta[bcName][bcUrl] = rowMeta
        })
        .addCase(changeDataItem, (state, action) => {
            const { bcName, cursor, dataItem, bcUrl } = action.payload

            state.pendingDataChanges[bcName] = state.pendingDataChanges[bcName] ?? {}
            const prevPending = state.pendingDataChanges[bcName][cursor] || {}
            const nextPending = { ...prevPending, ...dataItem }
            state.pendingDataChanges[bcName][cursor] = nextPending

            state.pendingDataChangesNow[bcName] = state.pendingDataChangesNow[bcName] ?? {}
            const prevPendingNow = state.pendingDataChangesNow[bcName][cursor] || {}
            state.pendingDataChangesNow[bcName][cursor] = { ...prevPendingNow, ...dataItem }

            const isRequired = (fieldKey: string) =>
                !!state.rowMeta[bcName]?.[bcUrl]?.fields.some(item => item.required && item.key === fieldKey)
            const nextValidationFails = getFailsByRequiredFields(nextPending, isRequired)

            applyValidationFails(state, bcName, cursor, nextValidationFails)
        })
        .addCase(changeDataItems, (state, action) => {
            const newPendingChanges = { ...state.pendingDataChanges[action.payload.bcName] }
            const newPendingChangesNow = { ...state.pendingDataChangesNow[action.payload.bcName] }
            action.payload.cursors.forEach((cursor, index) => {
                newPendingChanges[cursor] = action.payload.dataItems[index]
                newPendingChangesNow[cursor] = action.payload.dataItems[index]
            })
            state.pendingDataChanges[action.payload.bcName] = newPendingChanges
            state.pendingDataChangesNow[action.payload.bcName] = newPendingChangesNow
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
            const pendingValidationFails = state.pendingValidationFails ? { ...state.pendingValidationFails } : {}

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
            state.rowMeta[bcName] = state.rowMeta[bcName] ?? {}
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
            state.rowMeta[bcName] = state.rowMeta[bcName] ?? {}
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
            state.rowMeta[bcName] = state.rowMeta[bcName] ?? {}
            state.rowMeta[bcName][bcUrl].errors = errors
        })
        .addCase(sendOperationSuccess, (state, action) => {
            const bcName = action.payload.bcName
            const cursor = action.payload.cursor as string

            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            state.pendingDataChanges[bcName] = state.pendingDataChanges[bcName] ?? {}
            state.pendingDataChanges[bcName][cursor] = {}
            state.pendingDataChangesNow[bcName] = state.pendingDataChangesNow[bcName] ?? {}
            state.pendingDataChangesNow[bcName][cursor] = {}
            if (isTargetFormatPVF) {
                state.pendingValidationFails = state.pendingValidationFails ?? {}
                state.pendingValidationFails[bcName] = state.pendingValidationFails[bcName] ?? {}
                ;(state.pendingValidationFails[bcName] as { [cursor: string]: Record<string, string> })[cursor] = {}
            } else {
                state.pendingValidationFails = initialViewState.pendingValidationFails
            }
            state.handledForceActive[bcName] = state.handledForceActive[bcName] ?? {}
            state.handledForceActive[bcName][cursor] = {}
        })
        .addCase(bcSaveDataSuccess, (state, action) => {
            const { bcName, cursor } = action.payload
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            state.pendingDataChanges[bcName] = state.pendingDataChanges[bcName] ?? {}
            state.pendingDataChanges[bcName][cursor] = {}
            state.pendingDataChangesNow[bcName] = state.pendingDataChangesNow[bcName] ?? {}
            state.pendingDataChangesNow[bcName][cursor] = {}
            if (isTargetFormatPVF) {
                state.pendingValidationFails = state.pendingValidationFails ?? {}
                state.pendingValidationFails[bcName] = state.pendingValidationFails[bcName] ?? {}
                ;(state.pendingValidationFails[bcName] as { [cursor: string]: Record<string, string> })[cursor] = {}
            } else {
                state.pendingValidationFails = initialViewState.pendingValidationFails
            }
            state.handledForceActive[bcName] = state.handledForceActive[bcName] ?? {}
            state.handledForceActive[bcName][cursor] = {}
        })
        .addCase(bcCancelPendingChanges, (state, action) => {
            // TODO: Check if this works for hierarchy after 1.1.0
            const pendingDataChanges = { ...state.pendingDataChanges }
            const pendingDataChangesNow = state.pendingDataChangesNow
            for (const bcName in state.pendingDataChanges) {
                if (action.payload ? action.payload.bcNames.includes(bcName) : true) {
                    pendingDataChanges[bcName] = {}
                    pendingDataChangesNow[bcName] = {}
                }
            }
            const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target
            let pendingValidationFails = state.pendingValidationFails ? { ...state.pendingValidationFails } : {}

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
                    pendingValidationFails = initialViewState.pendingValidationFails as typeof pendingValidationFails
                }
            }
            state.pendingDataChanges = pendingDataChanges
            state.pendingDataChangesNow = pendingDataChangesNow
            state.pendingValidationFails = isTargetFormatPVF ? pendingValidationFails : initialViewState.pendingValidationFails
        })
        .addCase(clearValidationFails, state => {
            state.pendingValidationFails = initialViewState.pendingValidationFails
        })
        .addCase(showViewPopup, (state, action) => {
            const { bcName, calleeBCName, calleeWidgetName, associateFieldKey, assocValueKey, active, isFilter, type, widgetName } =
                action.payload

            state.popupData = {
                widgetName,
                type,
                bcName,
                calleeBCName,
                calleeWidgetName,
                associateFieldKey,
                assocValueKey,
                active,
                isFilter
            }
        })
        .addCase(showFileUploadPopup, (state, action) => {
            const bcName = state.widgets?.find(item => item.name === action.payload.widgetName)?.bcName
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
            state.popupData = {}
            state.popupData.bcName = null
        })
        .addCase(selectTableRow, (state, action) => {
            state.selectedRow = { widgetName: action.payload.widgetName, rowId: action.payload.rowId }
        })
        .addCase(deselectTableRow, (state, action) => {
            state.selectedRow = null
        })
        .addCase(changeLocation, (state, action) => {
            if (!action.payload.isTab) {
                state.pendingDataChanges = initialViewState.pendingDataChanges
                state.pendingDataChangesNow = initialViewState.pendingDataChangesNow
            }
            state.popupData = initialViewState.popupData
            state.selectedRow = initialViewState.selectedRow
        })
        .addCase(showNotification, (state, action) => {
            state.systemNotifications = state.systemNotifications ?? []
            state.systemNotifications.push({
                type: action.payload.type,
                message: action.payload.message,
                id: state.systemNotifications?.length as number
            })
        })
        .addCase(closeNotification, (state, action) => {
            state.systemNotifications = state.systemNotifications ?? []
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
            state.selectedRow = null
        })
        .addCase(selectRows, (state, action) => {
            const { bcName, dataItems } = action.payload
            const selectedRowsDictionary: Record<string, Omit<DataItem, 'vstamp'>> = {}
            state.selectedRows[bcName] = state.selectedRows[bcName] ?? []

            state.selectedRows[bcName].forEach(row => {
                selectedRowsDictionary[row.id as string] = row
            })
            const newDataItems = dataItems
            const dataItemIdsToDelete: string[] = []

            dataItems.forEach((row, index) => {
                if (selectedRowsDictionary[row.id as string]) {
                    newDataItems[index] = { ...selectedRowsDictionary[row.id as string], ...row }
                    dataItemIdsToDelete.push(row.id as string)
                }
            })

            state.selectedRows[bcName] = state.selectedRows[bcName].filter(dataItem => !dataItemIdsToDelete.includes(dataItem.id as string))

            state.selectedRows[bcName].splice(0, 0, ...dataItems)
        })
        .addCase(deselectRows, (state, action) => {
            const { bcName, ids } = action.payload
            state.selectedRows[bcName] = state.selectedRows[bcName] ?? []
            state.selectedRows[bcName] = state.selectedRows[bcName].filter(dataItem => !ids.includes(dataItem.id as string))
        })
        .addCase(clearSelectedRows, (state, action) => {
            const { bcName } = action.payload
            delete state.selectedRows[bcName]
        })
        .addCase(setPendingPostInvoke, (state, action) => {
            const { bcName, operationType, postInvoke } = action.payload
            state.pendingPostInvoke[bcName] = state.pendingPostInvoke[bcName] ?? {}
            state.pendingPostInvoke[bcName][operationType] = postInvoke
        })
        .addCase(applyPendingPostInvoke, (state, action) => {
            const { bcName, operationType } = action.payload
            if (state.pendingPostInvoke[bcName]) {
                delete state.pendingPostInvoke[bcName][operationType]
            }
        })
