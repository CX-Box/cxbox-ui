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
 * Interfaces for Business Component
 */

import { FilterGroup } from './filters'
import { OperationType } from '@cxbox-ui/schema'

/**
 * Meta data.ts for Business Component
 */
export interface BcMeta {
    /**
     * Name of Business Component
     */
    name: string
    /**
     * Name of parent Business Component
     */
    parentName: string | null
    /**
     * TODO: desc, example
     */
    url: string
    /**
     * Currently active record
     */
    cursor: string | null
    /**
     * String representation of default bc sorters
     *
     * "_sort.{order}.{direction}={fieldKey}&_sort.{order}.{direction}"
     *
     * @param fieldKey Sort by field
     * @param order Priority of this specific sorter
     * @param direction "asc" or "desc"
     * i.e. "_sort.0.asc=firstName"
     */
    defaultSort?: string
    /**
     * Predefined filters
     */
    filterGroups?: FilterGroup[]
    /**
     * String representation of default bc filters
     *
     * "{fieldKey}.contains={someValue}"
     *
     * @param fieldKey Filtering field
     * @param someValue Filter value
     * i.e. "someField1.contains=someValue&someField2.equalsOneOf=%5B%22someValue1%22%2C%22someValue2%22%5D"
     */
    defaultFilter?: string
}

export type DepthBcType = Record<
    number,
    {
        loading?: boolean
        cursor?: string
    }
>

export interface BcMetaState extends BcMeta {
    /**
     * Data fetch for this business component is in progress
     */
    loading?: boolean
    /**
     * Number of the page to fetch
     */
    page?: number
    /**
     * Page limit to fetch
     */
    limit?: number
    /**
     * There is an addional pages of data.ts to fetch
     */
    hasNext?: boolean
    /**
     * Stores a selected cursor and loading state per depth level.
     *
     * Used by hierarchy widgets builded around single business component:
     * controls which record is expanded and which children should be fetched.
     */
    depthBc?: DepthBcType
    operationsInProgress?: OperationType[]
}
