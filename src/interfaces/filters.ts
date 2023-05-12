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

import { DataValue } from './data'

export enum FilterType {
    /**
     * Transforms into combination of 'greaterOrEqualThan' and 'lessOrEqualThan' (See src/utils/filters.ts)
     */
    range = 'range',
    equals = 'equals',
    greaterThan = 'greaterThan',
    lessThan = 'lessThan',
    greaterOrEqualThan = 'greaterOrEqualThan',
    lessOrEqualThan = 'lessOrEqualThan',
    contains = 'contains',
    specified = 'specified',
    specifiedBooleanSql = 'specifiedBooleanSql',
    equalsOneOf = 'equalsOneOf',
    containsOneOf = 'containsOneOf'
}

export interface BcFilter {
    type: FilterType
    fieldName: string
    value: DataValue | DataValue[]
    viewName?: string
    widgetName?: string
}

export interface BcSorter {
    fieldName: string
    direction: 'asc' | 'desc'
}

export interface FilterGroup {
    name: string
    filters: string
}
