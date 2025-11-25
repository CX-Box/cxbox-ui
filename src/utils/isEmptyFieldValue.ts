/**
 * Checks if the field value is "empty".
 * Empty is considered to be: null, undefined, empty string, empty array, empty object.
 **/
export const isEmptyFieldValue = (value: unknown): boolean => {
    if (value === null || value === undefined || value === '') {
        return true
    }

    if (Array.isArray(value)) {
        return value.length === 0
    }

    if (typeof value === 'object') {
        return Object.keys(value).length === 0
    }

    return false
}
