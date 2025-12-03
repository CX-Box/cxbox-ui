import { DataItem } from '@cxbox-ui/schema'
import { PendingDataItem, RowMetaField } from '../interfaces'
import { isEmptyFieldValue } from './isEmptyFieldValue'

/**
 * Check if required records fields have a falsy value.
 * "Falsy" stands for null, undefined, empty string, empty array, empty object.
 *
 * @param record Record to check
 * @param pendingChanges Pending record changes which could override record values
 * @param fieldsMeta
 */
export function getRequiredFieldsMissing(record: DataItem, pendingChanges: PendingDataItem, fieldsMeta: RowMetaField[]) {
    const result: PendingDataItem = {}
    fieldsMeta.forEach(field => {
        const value = record?.[field.key] as string
        const pendingValue = pendingChanges?.[field.key]
        const effectiveValue = pendingValue === undefined ? value : pendingValue // NOSONAR

        if (field.required && isEmptyFieldValue(effectiveValue)) {
            result[field.key] = Array.isArray(effectiveValue) ? [] : null
        }
    })
    return Object.keys(result).length > 0 ? result : null
}
