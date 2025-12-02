import { PendingDataItem, PendingValidationFailsFormat, RowMeta, ViewState } from '../interfaces'
import { DataItem } from '@cxbox-ui/schema'
import { isEmptyFieldValue } from '../utils/isEmptyFieldValue'

/**
 * Извлекает значения полей и список ключей с forceActive из метаданных строки
 */
export const extractForceActiveInfo = (fields: RowMeta['fields']) => {
    const rowMetaForcedValues: PendingDataItem = {}
    const forceActiveFieldKeys: string[] = []

    fields.forEach(field => {
        rowMetaForcedValues[field.key] = field.currentValue
        if (field.forceActive) {
            forceActiveFieldKeys.push(field.key)
        }
    })

    return { rowMetaForcedValues, forceActiveFieldKeys }
}

/**
 * Вычисляет итоговые изменения (консолидация текущих изменений и пришедших с бэка forceActive значений)
 */
export const calculateNewPendingChanges = (
    currentRecordData: DataItem,
    currentPendingChanges: PendingDataItem,
    rowMetaForcedValues: PendingDataItem
) => {
    const consolidatedFrontData: PendingDataItem = { ...currentRecordData, ...currentPendingChanges }
    const newPendingChangesDiff: PendingDataItem = {}

    Object.keys(consolidatedFrontData).forEach(key => {
        const currentValue = consolidatedFrontData[key]
        const forcedValue = rowMetaForcedValues[key]

        const isChangedFieldValue =
            (!isEmptyFieldValue(forcedValue) && currentValue !== forcedValue) ||
            (isEmptyFieldValue(forcedValue) && !isEmptyFieldValue(currentValue))

        if (isChangedFieldValue) {
            newPendingChangesDiff[key] = forcedValue
        }
    })

    return {
        newPendingDataChanges: { ...currentPendingChanges, ...newPendingChangesDiff },
        newPendingChangesDiff
    }
}

/**
 * Применяет ошибки валидации в стейт в зависимости от формата (target или old)
 */
export const applyValidationFails = (state: ViewState, bcName: string, cursor: string, fails: Record<string, string>) => {
    const isTargetFormatPVF = state.pendingValidationFailsFormat === PendingValidationFailsFormat.target

    if (isTargetFormatPVF) {
        state.pendingValidationFails = state.pendingValidationFails ?? {}
        state.pendingValidationFails[bcName] = state.pendingValidationFails[bcName] ?? {}
        const bcFails = state.pendingValidationFails[bcName] as { [cursor: string]: Record<string, string> }
        bcFails[cursor] = fails
    } else {
        state.pendingValidationFails = fails
    }
}

/**
 * Обновляет список обработанных forceActive полей (handledForceActive)
 */
export const updateHandledForceActive = (
    state: ViewState,
    bcName: string,
    cursor: string,
    forceActiveFieldKeys: string[],
    newPendingDataChanges: PendingDataItem
) => {
    const handledForceActiveUpdates: PendingDataItem = {}

    // отразим в списке обработанных forceActive полей - те что содержатся в новой дельте
    forceActiveFieldKeys.forEach(key => {
        if (newPendingDataChanges[key] !== undefined) {
            handledForceActiveUpdates[key] = newPendingDataChanges[key]
        }
    })

    state.handledForceActive[bcName] = state.handledForceActive[bcName] ?? {}
    state.handledForceActive[bcName][cursor] = state.handledForceActive[bcName][cursor] ?? {}
    Object.assign(state.handledForceActive[bcName][cursor], handledForceActiveUpdates)
}
