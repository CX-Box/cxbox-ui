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

import { BcFilter, BcSorter, FilterType, DataValue, FieldType } from '../interfaces'

/**
 * Maps an input array of BcFilter objects into a dictionary of GET-request params
 *
 * Name of the param formed as field name and filter type, separated by dot,
 * e.g. `${filter.fieldName}.${filter.type}`
 *
 * Value of the param is:
 * - for non-array values, stringified filter value
 * - for array values, a comma-separated list of stringified elements with each element enclosed in double quotes
 *
 * @see {@link parseFilters} Reverse function
 *
 * @param filters Filters for business components
 * @returns Dictionary of query-params for GET-request
 * @category Utils
 */
export function getFilters(filters: BcFilter[]) {
    if (!filters || !filters.length) {
        return null
    }
    const result: Record<string, string> = {}
    filters.forEach(item => {
        if (item.type === FilterType.range) {
            const values = item.value as DataValue[]
            if (values[0]) {
                result[`${item.fieldName}.${FilterType.greaterOrEqualThan}`] = String(values[0])
            }
            if (values[1]) {
                result[`${item.fieldName}.${FilterType.lessOrEqualThan}`] = String(values[1])
            }
        } else {
            const value = Array.isArray(item.value) ? JSON.stringify(item.value) : String(item.value)
            const separator = item.fieldName ? '.' : ''
            result[`${item.fieldName}${separator}${item.type}`] = value
        }
    })
    return result
}

/**
 * Maps an input array of business component sorters into a dictionary of query params for
 * Cxbox API, where values are field names and keys follows the template:
 * `_sort.${index}.${item.direction}`
 *
 * @param sorters Array of business component sorters
 * @returns Dictionary of query-params for GET-request
 * @category Utils
 */
export function getSorters(sorters: BcSorter[]) {
    if (!sorters || !sorters.length) {
        return null
    }
    const result: Record<string, string> = {}
    sorters.forEach((item, index) => {
        result[`_sort.${index}.${item.direction}`] = item.fieldName
    })
    return result
}

const jsonParse = <T extends string>(value: T) => {
    try {
        return JSON.parse(value)
    } catch (e) {
        console.warn(e)

        return null
    }
}

/**
 * Function for parsing filters from string into BcFilter type
 *
 * @see {@link getFilters} Reverse function
 * @param defaultFilters string representation of filters
 * @category Utils
 */
export function parseFilters(defaultFilters: string = '') {
    const result: BcFilter[] = []
    const urlParams = new URLSearchParams(defaultFilters)
    const paramKeys = Object.keys(Object.fromEntries(urlParams))

    paramKeys.forEach(param => {
        const [fieldName, type] = param.split('.')
        const isStandardFilter = fieldName && type && urlParams.get(param)

        if (isStandardFilter) {
            let value: string | string[] = urlParams.getAll(param)

            if (type === FilterType.containsOneOf || type === FilterType.equalsOneOf) {
                if (value.length === 1) {
                    value = jsonParse(value[0]) ?? value
                }

                value = Array.isArray(value) ? value : []
            } else {
                value = Array.isArray(value) ? value[0] : value
            }

            result.push({
                fieldName,
                type: type as FilterType,
                value
            })
        } else if (defaultFilters) {
            let value: string | string[] = urlParams.getAll(param)

            if (value.length === 1) {
                value = jsonParse(value[0]) ?? value[0]
            }

            result.push({
                fieldName: '',
                type: param as any,
                value: value
            })
        }
    })

    return result.length ? result : null
}

/**
 * Parse sorter string into separate sorter objects.
 * String representation of sorters is url based:
 * "_sort.{order}.{direction}={fieldKey}&_sort.{order}.{direction}"
 *
 * fieldKey Sort by field
 * order Priority of this specfic sorter
 * direction "asc" or "desc"
 *
 * i.e. "_sort.0.asc=firstName"
 *
 * @param sorters string representation of sorters
 * @category Utils
 */
export function parseSorters(sorters?: string) {
    if (!sorters || !sorters.length) {
        return null
    }
    const result: BcSorter[] = []
    const dictionary = new URLSearchParams(sorters)
    Array.from(dictionary.entries())
        .map(([sort, fieldKey]) => {
            const [order, direction] = sort.split('.').slice(1)
            return { fieldName: fieldKey as string, order: Number.parseInt(order, 10), direction }
        })
        .sort((a, b) => a.order - b.order)
        .forEach(item => {
            result.push({ fieldName: item.fieldName, direction: item.direction as 'asc' | 'desc' })
        })
    return result
}

/**
 * Returns appropriate filtration type for specified field type.
 *
 * - Text-based fields use `contains`
 * - Checkbox fields use `specified` (boolean)
 * - Dictionary fiels use `equalsOneOf`
 *
 * All other field types use strict `equals`
 *
 * @param fieldType Field type
 */
export function getFilterType(fieldType: FieldType) {
    switch (fieldType) {
        case FieldType.dictionary: {
            return FilterType.equalsOneOf
        }
        case FieldType.checkbox: {
            return FilterType.specified
        }
        case FieldType.input:
        case FieldType.text: {
            return FilterType.contains
        }
        default:
            return FilterType.equals
    }
}

/**
 * Function for converting filters from 'moreOrEqualThan' and 'lessOrEqualThan' types to a 'range' type
 *
 * @param filters array of BcFilter objects
 * @category Utils
 */
export const processDrilldownFilters = (filters: BcFilter[]) => {
    const result: BcFilter[] = []
    const rangeFilters: Record<string, BcFilter> = {}

    filters.forEach(filterItem => {
        const { type, fieldName, value } = filterItem

        if (type === FilterType.greaterOrEqualThan || type === FilterType.lessOrEqualThan) {
            if (!rangeFilters[fieldName]) {
                rangeFilters[fieldName] = { ...filterItem, type: FilterType.range, value: [null, null] }
            }
            const rangeFilterValue = rangeFilters[fieldName].value as DataValue[]
            rangeFilterValue[type === FilterType.greaterOrEqualThan ? 0 : 1] = value as DataValue
        } else {
            result.push(filterItem)
        }
    })

    return [...result, ...Object.values(rangeFilters)]
}
