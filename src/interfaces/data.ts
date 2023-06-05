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

import { OperationPostInvokeAny, OperationPreInvoke } from './operation'
import { DataValue, DataItem } from '@cxbox-ui/schema'
export type { DataValue, DataItem, MultivalueSingleValue, MultivalueSingleValueOptions, RecordSnapshotState } from '@cxbox-ui/schema'

/**
 * API's response on Business Component's data.ts request
 */
export interface BcDataResponse {
    data: DataItem[]
    hasNext: boolean
}

/**
 * Edited changes
 */
export interface PendingDataItem {
    [fieldName: string]: DataValue
}

/**
 * State of `data.ts` in global store
 */
export interface DataState {
    [bcName: string]: DataItem[]
}

export interface DepthDataState {
    [depth: number]: {
        [bcName: string]: DataItem[]
    }
}

/**
 * Result of saving record, which back-end returns
 */
export interface DataItemResponse {
    data: {
        /**
         * Saved record
         */
        record: DataItem
        /**
         * Actions which have to do after saving
         */
        postActions?: OperationPostInvokeAny[]
        /*
         * @deprecated TODO: Remove in 2.0.0 in favor of postInvokeConfirm (is this todo needed?)
         */
        preInvoke?: OperationPreInvoke
    }
}

/**
 * `x` is name of field, for which the value will be set up.
 * A value of `x` is name of field, from which the value will be gotten.
 */
export type PickMap = Record<string, string>
