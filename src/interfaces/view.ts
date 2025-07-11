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

import { WidgetMeta } from './widget'
import { RowMeta } from './rowMeta'
import { PendingDataItem, PickMap } from './data'
import { SystemNotification } from './objectMap'
import { OperationTypeCrud, OperationPostInvokeConfirm, OperationPostInvokeAny } from './operation'
import { AxiosError } from 'axios'
import { WaitUntilPopupOptions } from '../actions'
import { DataItem } from '@cxbox-ui/schema'
export { FieldType } from '@cxbox-ui/schema'

export interface ViewSelectedRow {
    widgetName: string
    rowId: string
}

export interface PendingValidationFails {
    [bcName: string]: {
        [cursor: string]: Record<string, string>
    }
}

/**
 * Describes format of `pendingValidationFails`
 * TODO remove in 2.0.0
 */
export enum PendingValidationFailsFormat {
    old = 'old',
    target = 'target'
}

export interface ViewState extends ViewMetaResponse {
    rowMeta: {
        [bcName: string]: {
            [bcUrl: string]: RowMeta
        }
    }
    pendingPostInvoke: {
        [bcName: string]: {
            [type: string]: OperationPostInvokeAny
        }
    }
    pendingDataChanges: {
        [bcName: string]: {
            [cursor: string]: PendingDataItem
        }
    }
    pendingDataChangesNow: {
        [bcName: string]: {
            [cursor: string]: PendingDataItem
        }
    }
    handledForceActive: {
        [bcName: string]: {
            [cursor: string]: PendingDataItem
        }
    }
    metaInProgress: {
        [bcName: string]: boolean
    }
    popupData?: PopupData
    infiniteWidgets?: string[]
    pickMap?: PickMap
    selectedRow: ViewSelectedRow | null
    selectedRows: { [bcName: string]: Array<Omit<DataItem, 'vstamp'>> | undefined }
    systemNotifications?: SystemNotification[]
    error?: ApplicationError
    /**
     * For backward compatibility
     *
     * `old` describes `pendingValidationFails` as `Record<string, string>`
     * `target` describes `pendingValidationFails` as `PendingValidationFails`
     */
    pendingValidationFailsFormat?: PendingValidationFailsFormat.old | PendingValidationFailsFormat.target // TODO remove in 2.0.0
    // TODO 2.0.0: should be `pendingValidationFails?: PendingValidationFails`
    pendingValidationFails?: Record<string, string> | PendingValidationFails
    modalInvoke?: {
        operation: {
            bcName: string
            operationType: OperationTypeCrud | string
            widgetName: string
        }
        confirmOperation: OperationPostInvokeConfirm
    }
}

/**
 * View description returned by Cxbox API
 */
export interface ViewMetaResponse {
    /**
     * @deprecated Deprecated in favor of `name`
     */
    id?: number
    /**
     * Name of the view as specified in *.view.json file
     */
    name: string
    /**
     * Displayed title
     */
    title?: string
    /**
     * Specifies which layout template to use for the view
     *
     *Not used in Cxbox UI Core, but can used by client application
     */
    template?: string
    /**
     * @deprecated Used for dynamic view layouts (configurable from user side), which are no longer implemented
     */
    customizable?: boolean
    /**
     * @deprecated Not used
     */
    editable?: boolean
    /**
     * Url for the view (usually in form of `${screen.name}/${view.name}`)
     */
    url: string
    /**
     * Widgets present on the view
     */
    widgets: WidgetMeta[]
    /**
     * @deprecated Used for dynamic view layouts (configurable from user side), which are no longer implemented
     */
    columns?: number | null
    /**
     * @deprecated Used for dynamic view layouts (configurable from user side), which are no longer implemented
     */
    rowHeight?: number | null
    /**
     * Not used in Cxbox UI Core, but can be used by client application
     */
    readOnly?: boolean
    /**
     * Not used in Cxbox UI Core
     *
     * TODO: Need description
     */
    ignoreHistory?: boolean
}

export type PopupType = 'assoc' | 'file-upload' | 'waitUntil' | null

/**
 * Describes currently open popup
 *
 * TODO: Split interface by popup types
 */
export interface PopupData {
    /**
     * Business component of the widget that initiated popup
     *
     * TODO: Will me removed in favor of widgetName in 2.0.0
     */
    calleeBCName?: string
    /**
     * Name of the widget that initiated popup
     */
    calleeWidgetName?: string
    /**
     * Type of the popup
     *
     * TODO: Will not be optional in 2.0.0
     */
    type?: PopupType | string
    /**
     * Business component for widget in Popup
     *
     * TODO: Move to inherited interfaces (not all popups display widgets)
     */
    bcName?: string
    /**
     * Name of popup widget
     *
     * TODO: Move to inherited interfaces (not all popups display widgets)
     */
    widgetName?: string
    /**
     * TODO: Description + move to AssocPopupDescriptor
     */
    associateFieldKey?: string
    /**
     * TODO: Description + move to AssocPopupDescriptor
     */
    assocValueKey?: string
    /**
     * If true popup confirm button will send selected items to Cxbox API
     *
     * TODO: Move to AssocPopupDescriptor
     */
    active?: boolean
    /**
     * This popup is used as a filter
     *
     * TODO: Used only by assocs so probably move to AssocPopupDescriptor
     */
    isFilter?: boolean

    options?: Partial<WaitUntilPopupOptions>
}

export type ApplicationError = BusinessError | SystemError | ApplicationErrorBase

export enum ApplicationErrorType {
    BusinessError,
    SystemError,
    NetworkError
}

export interface ApplicationErrorBase {
    type: ApplicationErrorType
    code?: number
}

export interface BusinessError extends ApplicationErrorBase {
    type: ApplicationErrorType.BusinessError
    message: string
}

export interface SystemError extends ApplicationErrorBase {
    type: ApplicationErrorType.SystemError
    error?: AxiosError
    details: string
}

export interface NetworkError extends ApplicationErrorBase {
    type: ApplicationErrorType.NetworkError
}
