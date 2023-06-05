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

import { SessionScreen, PendingRequest, NotificationKeys, LoginResponse } from '../interfaces'
import { DrillDownType, Route } from '../interfaces/router'
import { ViewMetaResponse, ApplicationError, PopupType } from '../interfaces'
import { DataItem, MultivalueSingleValue, PendingDataItem, PickMap } from '../interfaces/data'
import {
    RowMeta,
    AppNotificationType,
    OperationPostInvokeAny,
    OperationTypeCrud,
    AssociatedItem,
    OperationErrorEntity,
    OperationPostInvokeConfirm,
    OperationPreInvoke,
    BcFilter,
    BcSorter,
    Notification
} from '../interfaces'
import { AxiosError } from 'axios'
import { ApiCallContext } from '../utils'
import { createAction, AnyAction } from '@reduxjs/toolkit'

export const changeLocation = createAction<{ location: Route; forceUpdate?: boolean }>('changeLocation')
/**
 * Authentication request
 */
export const login = createAction<{
    /**
     * User-provided login
     */
    login: string
    /**
     * User-provided password
     */
    password: string
    /**
     * Optionally user can choose a role to authentificate with
     */
    role?: string
}>('login')

/**
 * Login was successful
 */
export const loginDone = createAction<LoginResponse>('loginDone')

/**
 * Login was unsuccesful
 */
export const loginFail = createAction<{
    /**
     * Reason could be provided
     */
    errorMsg: string
}>('loginFail')

/**
 * Logout was requested, manually or through stale session
 */
export const logout = createAction<null>('logout')

/**
 * User successfully was logged out
 */
export const logoutDone = createAction<null>('logoutDone')

/**
 * Request to change active screen was initiated
 *
 * TODO: 2.0.0 Should be string (just the screen name) instead;
 *
 * Initially this was due to `screen` reducer did not having access to `session` part of redux store
 */
export const selectScreen = createAction<{
    /**
     * Request initiated with all the meta from login response
     */
    screen: SessionScreen
}>('selectScreen')

/**
 * Request to change active screen was unsuccesful (incorrect path, unknown screen, etc.)
 */
export const selectScreenFail = createAction<{
    /**
     * Which screen was requested originally
     */
    screenName: string
}>('selectScreenFail')

/**
 * Request to change active view was initiated
 *
 * TODO: 2.0.0 Should be string (just the view name) instead;
 * Initially this was due to `screen` and `view` reducers did not having access to `session` part of redux store
 */
export const selectView = createAction<ViewMetaResponse>('selectView')

/**
 * Request to change active view was unsuccesful (incorrect path, unknown screen, etc.)
 *
 * @param selectViewFail Which view was requested originally
 */
export const selectViewFail = createAction<{
    viewName: string
}>('selectViewFail')

/**
 * Fetch data request for business component was initiated
 */
export const bcFetchDataRequest = createAction<{
    /**
     * The business component to fetch data for
     *
     * @deprecated TODO: 2.0.0 Should be removed in favor of widgetName
     */
    bcName?: string
    /**
     * The level of hierarchy to fetch data for
     *
     * @deprecated Do not use; TODO: Will be removed in 2.0.0
     */
    depth?: number
    /**
     * What widget requires data (widget can only request its own data here)
     */
    widgetName: string
    /**
     * Page size should be ignored
     *
     * Used mostly for hierarchy widgets which does not have controls
     * for navigating between pages aside of root level.
     */
    ignorePageLimit?: boolean
    /**
     * Pending changes should not be dropped when performing this request
     * (due to hierarchy expanging through cursor change, for same BC hierarchy this leads to data loss)
     */
    keepDelta?: boolean
}>('bcFetchDataRequest')

/**
 * Fetch data request request for specific pages range
 */
export const bcFetchDataPages = createAction<{
    /**
     * The business component to fetch data for
     *
     * @deprecated TODO: 2.0.0 Should be removed in favor of widgetName
     */
    bcName: string
    /**
     * Fisrt page to fetch (default is 1)
     */
    widgetName: string
    /**
     * What widget requires data (widget can only request its own data here)
     */
    from?: number
    /**
     * Last page to fetch (default is current page)
     */
    to?: number
}>('bcFetchDataPages')

/**
 * Fetch data request for searchable fields
 */
export const inlinePickListFetchDataRequest = createAction<{
    /**
     * The business component to fetch data for
     */
    bcName: string
    /**
     * Search expression // TODO: Check format
     */
    searchSpec: string
    /**
     * Value to search for
     */
    searchString: string
}>('inlinePickListFetchDataRequest')

/**
 * Fetch data request was succesful
 */
export const bcFetchDataSuccess = createAction<{
    /**
     * Business component that requested data
     *
     * @deprecated TODO: 2.0.0 Remove in favor of widgetName
     */
    bcName: string
    /**
     * Data records from response for this business component
     */
    data: DataItem[]
    /**
     * For same BC hierarchies, the level which was requested
     *
     * @deprecated TODO: 2.0.0 Should be all moved to separate hierarchy-specific action
     */
    depth?: number
    /**
     * BC url with respect of parents cursors
     */
    bcUrl: string
    /**
     * If there are more data to fetch (other pages etc.)
     */
    hasNext?: boolean
}>('bcFetchDataSuccess')

/**
 * Fetch data request wac unsuccesful
 */
export const bcFetchDataFail = createAction<{
    /**
     * Business component that initiated data fetch
     */
    bcName: string
    /**
     * BC url with respect of parents cursors
     */
    bcUrl: string
    /**
     * For same BC hierarchies, the level which was requested
     *
     * @deprecated TODO: 2.0.0 Should be all moved to separate hierarchy-specific action
     */
    depth?: number
}>('bcFetchDataFail')

/**
 * Fetch next chunk of data for table widgets with infinite scroll
 */
export const bcLoadMore = createAction<{
    /**
     * Business component that initiated data fetch
     */
    bcName: string
    /**
     * Widget that initiated row meta fetch
     */
    widgetName?: string
}>('bcLoadMore')

/**
 * Fetch meta information for active record of business component
 */
export const bcFetchRowMeta = createAction<{
    /**
     *
     * Business component that initiated row meta fetch
     *
     * @deprecated TODO: 2.0.0 Remove in favor of widgetName
     */
    bcName: string
    /**
     * Widget that initiated row meta fetch
     */
    widgetName: string
}>('bcFetchRowMeta')

/**
 * Puts row meta received from Cxbox API to the store.
 *
 * Updates values in `data` store slice with new values from row meta when possible.
 */
export const bcFetchRowMetaSuccess = createAction<{
    /**
     * Business component that initiated row meta fetch
     */
    bcName: string
    /**
     * Path to BC with respect to ancestors BC and their cursors
     */
    bcUrl: string
    /**
     * Row meta returned by Cxbox API
     */
    rowMeta: RowMeta
    /**
     * Cursor for a record that initiated row meta fetch.
     *
     * Can be empty (e.g. BC has no records) or will be set to new id for `create` operation.
     */
    cursor?: string
}>('bcFetchRowMetaSuccess')

/**
 * Fetch request for row meta was unsuccesful
 */
export const bcFetchRowMetaFail = createAction<{
    /**
     * Business component initiated row meta fetch
     */
    bcName: string
}>('bcFetchRowMetaFail')

/**
 * @deprecated Not used; `sendOperationEpic` with `create` role is used instead
 *
 * TODO: Remove in 2.0.0
 */
export const bcNewData = createAction<{
    /**
     * Business component for which to create a new record
     */
    bcName: string
}>('bcNewData')

/**
 * Put new record draft to `data` store slice
 */
export const bcNewDataSuccess = createAction<{
    /**
     * Business component for which new record was created
     */
    bcName: string
    /**
     * New record with `id` returned by Cxbox API and vstamp = -1 (denoting a record draft)
     */
    dataItem: DataItem
    /**
     * Path to BC with respect to ancestors BC and their cursors
     */
    bcUrl: string
}>('bcNewDataSuccess')

/**
 * Dispatched when record creation failed
 */
export const bcNewDataFail = createAction<{
    /**
     * Business component for which record creation failed
     */
    bcName: string
}>('bcNewDataFail')

/**
 * Delete record request was
 */
export const bcDeleteDataFail = createAction<{
    /**
     * Business component initiated delete record
     */
    bcName: string
}>('bcDeleteDataFail')

/**
 * Request to change Force active field was unsuccesful
 */
export const forceActiveChangeFail = createAction<{
    /**
     * Business component initiated force active change
     */
    bcName: string
    /**
     * Cursors hierarchy at the time of force active change to
     */
    bcUrl: string
    /**
     * Error to show in modal
     */
    viewError: string
    /**
     * Validation errors on fields
     */
    entityError: OperationErrorEntity
}>('forceActiveChangeFail')

/**
 * Perform CustomAction
 */
export const sendOperation = createAction<{
    /**
     * The business component to fetch data for
     */
    bcName: string
    /**
     * Type of operation to be performed
     */
    operationType: OperationTypeCrud | string
    /**
     * What widget requires data
     */
    widgetName: string
    /**
     * Any other action
     */
    onSuccessAction?: AnyAction
    /**
     * params for confirm modal
     */
    confirm?: string
    /**
     * key called bk
     *
     * @deprecated TODO: Remove in 2.0.0
     */
    bcKey?: string
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of sendOperationWithConfirm
     */
    confirmOperation?: OperationPreInvoke
}>('sendOperation')

/**
 * Send operation request was unsuccessful
 */
export const sendOperationFail = createAction<{
    /**
     * Business component initiated send operation request
     */
    bcName: string
    /**
     * Cursors hierarchy at the time when request was fired
     */
    bcUrl: string
    /**
     * Error to show in modal
     */
    viewError: string
    /**
     * Validation errors on fields
     */
    entityError: OperationErrorEntity
}>('sendOperationFail')

/**
 * Send operation request was successful
 */
export const sendOperationSuccess = createAction<{
    /**
     * Business component initiated the request
     */
    bcName: string
    /**
     * Cursor which initiated the request
     */
    cursor: string
    /**
     * New record with `id` returned by Cxbox API and vstamp = -1 (denoting a record draft)
     */
    dataItem?: DataItem
}>('sendOperationSuccess')

/**
 * TODO
 */
export const processPostInvoke = createAction<{
    /**
     * @deprecated TODO: Prefer widgetName instead (2.0.0)
     */
    bcName: string
    postInvoke: OperationPostInvokeAny
    cursor?: string
    /**
     * What widget initiated original operation, TODO: mandatory in 2.0.0
     */
    widgetName?: string
}>('processPostInvoke')

/**
 * Operation to perform preInvoke actions
 */
export const processPreInvoke = createAction<{
    /**
     * The business component to fetch data for
     */
    bcName: string
    /**
     * Type of operation to be performed
     */
    operationType: string
    /**
     * What widget requires data
     */
    widgetName: string
    /**
     * Action that will be performed before the main operation
     */
    preInvoke: OperationPreInvoke
}>('processPreInvoke')

/**
 * Operation to perform postInvokeConfirm actions
 */
export const processPostInvokeConfirm = createAction<{
    /**
     * The business component to fetch data for
     */
    bcName: string
    /**
     * Type of operation to be performed
     */
    operationType: string
    /**
     * What widget requires data
     */
    widgetName: string
    /**
     * Action that will be performed after the main operation and confirmation
     */
    postInvokeConfirm: OperationPostInvokeConfirm
}>('processPostInvokeConfirm')

/**
 * TODO
 */
export const userDrillDown = createAction<{
    widgetName: string
    bcName: string
    cursor: string
    fieldKey: string
}>('userDrillDown')

/**
 * TODO
 */
export const userDrillDownSuccess = createAction<{
    bcUrl: string
    bcName: string
    cursor: string
}>('userDrillDownSuccess')

/**
 * TODO
 */
export const drillDown = createAction<{
    url: string
    drillDownType?: DrillDownType
    urlName?: string
    route: Route
    widgetName?: string
}>('drillDown')

/**
 * TODO
 */
export const bcChangeCursors = createAction<{
    cursorsMap: Record<string, string>
    keepDelta?: boolean
}>('bcChangeCursors')

/**
 * Sets a cursor for the specified depth level of hierarchy widget
 * builded around a single business component.
 */
export const bcChangeDepthCursor = createAction<{
    /**
     * Business component for the hierarchy widget
     */
    bcName: string
    /**
     * Depth level for which cursor is set
     */
    depth: number
    /**
     * Cursor set for specific depth level of the hierarchy widget.
     *
     * Controls the collapsed state of the record and which data are fetched for the next level of hierarchy
     */
    cursor: string
}>('bcChangeDepthCursor')

/**
 * TODO
 */
export const changeDataItem = createAction<{
    bcName: string
    bcUrl: string
    cursor: string
    dataItem: PendingDataItem
    disableRetry?: boolean
}>('changeDataItem')

/**
 * TODO
 */
export const changeDataItems = createAction<{
    bcName: string
    cursors: string[]
    dataItems: PendingDataItem[]
}>('changeDataItems')

/**
 * TODO
 */
export const forceActiveRmUpdate = createAction<{
    /**
     * current data for record that initiated rowMeta fetch
     */
    currentRecordData: DataItem
    rowMeta: RowMeta
    bcName: string
    bcUrl: string
    cursor: string
}>('forceActiveRmUpdate')

/**
 * TODO
 */
export const showViewPopup = createAction<{
    /**
     * BC name of popup widget
     *
     * @deprecated TODO: Remove in 2.0.0 in favor of widget name
     */
    bcName: string
    /**
     * Name of popup widget
     */
    widgetName?: string
    /**
     * It's BC name of `caller` widget actually
     *
     * @deprecated TODO: Remove in 2.0.0 in favor of widget name
     */
    calleeBCName?: string
    /**
     * Name of `caller` widget actually
     *
     * TODO: 2.0.0 : Rename to `callerWidgetName`
     */
    calleeWidgetName?: string
    /**
     * Popup widget field key associated to `assocValueKey` of caller widget
     */
    associateFieldKey?: string
    /**
     * Caller widget field key associated to `associateFieldKey` of popup widget
     */
    assocValueKey?: string
    /**
     * If `true` then backend's method of association is used
     */
    active?: boolean
    /**
     * Whether popup is used as filter
     */
    isFilter?: boolean
    /**
     * Type of popup
     */
    type?: PopupType
}>('showViewPopup')

/**
 * TODO
 */
export const showFileUploadPopup = createAction<{
    /**
     * Name of the widget that initiated popup opening
     */
    widgetName: string
}>('showFileUploadPopup')

/**
 * Closes currently active popup on view
 */
export const closeViewPopup = createAction<{
    /**
     * Not used
     *
     * @deprecated TODO: Will be removed in 2.0.0
     */
    bcName?: string
}>('closeViewPopup')

/**
 * TODO
 */
export const viewPutPickMap = createAction<{
    map: PickMap
    bcName: string
}>('viewPutPickMap')

/**
 * TODO
 */
export const viewClearPickMap = createAction<null>('viewClearPickMap')

/**
 * TODO
 */
export const saveAssociations = createAction<{
    bcNames: string[]
    /**
     * For usage outside Popup (without opening multivalue)
     */
    calleeBcName?: string
    associateFieldKey?: string
}>('saveAssociations')

/**
 * Sets intermediate state for association widget by storing associated records in pseudo-business component.
 *
 * Name for this pseudo-BC is formed as `${bcName}Delta`.
 */
export const changeAssociations = createAction<{
    /**
     * Assoc widget's business component
     */
    bcName: string
    /**
     * Records that marked as `associated` for this widget
     *
     * TODO: Will be mandatory in 2.0.0
     */
    records?: DataItem[]
}>('cnangeAssociations')

/**
 * TODO
 */
export const removeMultivalueTag = createAction<{
    bcName: string
    popupBcName: string
    cursor: string
    associateFieldKey: string
    dataItem: MultivalueSingleValue[]
    removedItem: MultivalueSingleValue
}>('removeMultivalueTag')

/**
 * TODO
 */
export const bcSaveDataSuccess = createAction<{
    bcName: string
    cursor: string
    dataItem: DataItem
}>('bcSaveDataSuccess')

/**
 * TODO
 */
export const bcSaveDataFail = createAction<{
    bcName: string
    bcUrl: string
    entityError?: OperationErrorEntity
    viewError?: string
}>('bcSaveDataFail')

/**
 * Save info about current operation for confirm modal
 */
export const operationConfirmation = createAction<{
    /**
     * Current operation
     */
    operation: {
        bcName: string
        operationType: OperationTypeCrud | string
        widgetName: string
    }
    /**
     * Text for confirm modal
     */
    confirmOperation: OperationPostInvokeConfirm
}>('operationConfirmation')

/**
 * Manually update business component by fetching its data and and row meta
 */
export const bcForceUpdate = createAction<{
    /**
     * @deprecated Will be removed in 2.0.0 in favor of `widgetName`
     */
    bcName: string
    /**
     * What widget requires data (widget can only request its own data here)
     *
     * TODO: Will be mandatory in 2.0.0
     */
    widgetName?: string
}>('bcForceUpdate')

/**
 * TODO
 */
export const uploadFile = createAction<null>('uploadFile')

/**
 * TODO
 */
export const uploadFileDone = createAction<null>('uploadFileDone')

/**
 * TODO
 */
export const uploadFileFailed = createAction<null>('uploadFileFailed')

/**
 * TODO
 */
export const bcCancelPendingChanges = createAction<{
    bcNames: string[]
}>('bcCancelPendingChanges')

/**
 * TODO
 */
export const bcSelectRecord = createAction<{
    bcName: string
    cursor: string
    ignoreChildrenPageLimit?: boolean
    keepDelta?: boolean
}>('bcSelectRecord')

/**
 * Wrapper action to sets a cursor for the specified depth level of hierarchy widget
 * builded around a single business component and fetch children for that record.
 *
 * @deprecated Do not use. TODO: Will be removed in 2.0.0
 */
export const bcSelectDepthRecord = createAction<{
    /**
     * Business component for the hierarchy widget
     */
    bcName: string
    /**
     * Depth level for which cursor is set
     */
    depth: number
    /**
     * Cursor set for specific depth level of the hierarchy widget.
     *
     * Controls the collapsed state of the record and which data are fetched for the next level of hierarchy
     */
    cursor: string
}>('bcSelectDepthRecord')

/**
 * TODO
 */
export const changeAssociation = createAction<{
    bcName: string
    widgetName: string
    dataItem: AssociatedItem
    assocValueKey: string
}>('changeAssociations')

/**
 * TODO
 */
export const changeAssociationSameBc = createAction<{
    bcName: string
    depth: number
    widgetName: string
    dataItem: AssociatedItem
    assocValueKey: string
}>('changeAssociationsSameBc')

/**
 * TODO
 */
export const changeAssociationFull = createAction<{
    bcName: string
    depth: number
    widgetName: string
    dataItem: AssociatedItem
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of store.view.popupData.assocValueKey instead
     */
    assocValueKey?: string
}>('changeAssociationFull')

/**
 * TODO
 */
export const changeChildrenAssociations = createAction<{
    bcName: string
    assocValueKey: string
    selected: boolean
}>('changeChildrenAssociations')

/**
 * TODO
 */
export const changeChildrenAssociationsSameBc = createAction<{
    bcName: string
    depth: number
    assocValueKey: string
    selected: boolean
}>('changeChildrenAssociationsSameBc')

/**
 * TODO
 */
export const changeDescendantsAssociationsFull = createAction<{
    bcName: string
    parentId: string
    depth: number
    assocValueKey: string
    selected: boolean
}>('changeDescendantsAssociationsFull')

/**
 * TODO
 */
export const dropAllAssociations = createAction<{
    bcNames: string[]
}>('dropAllAssociations')

/**
 * TODO
 */
export const dropAllAssociationsSameBc = createAction<{
    bcName: string
    depthFrom: number
}>('dropAllAssociationsSameBc')

/**
 * TODO
 */
export const dropAllAssociationsFull = createAction<{
    bcName: string
    depth: number
    dropDescendants?: boolean
}>('dropAllAssociationsFull')

/**
 * For server side routing where {@link RouteType.router | routes are handled by Cxbox API endpoint}, this action is dispatched
 * to process requested route.
 */
export const handleRouter = createAction<{
    /**
     * An URL that will be passed to Cxbox API router endpoint
     */
    path: string
    /**
     * AJAX request parameters for the requests
     */
    params: Record<string, unknown>
}>('handleRouter')

/**
 * TODO
 */
export const selectTableCellInit = createAction<{
    widgetName: string
    rowId: string
    fieldKey: string
}>('selectTableCellInit')

/**
 * TODO
 */
export const selectTableCell = createAction<{
    widgetName: string
    rowId: string
    fieldKey: string
}>('selectTableCell')

/**
 * TODO
 */
export const showAllTableRecordsInit = createAction<{
    bcName: string
    cursor: string
    /**
     * @deprecated Remove in 2.0 (accessible from the store)
     */
    route?: Route
}>('showAllTableRecordsInit')

/**
 * TODO
 */
export const showNotification = createAction<{
    type: AppNotificationType
    message: string
}>('showNotification')

/**
 * TODO
 */
export const closeNotification = createAction<{
    id: number
}>('closeNotification')

/**
 * TODO
 */
export const bcAddFilter = createAction<{
    /**
     * TODO: Will be mandatory in 2.0.0
     */
    widgetName?: string
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of widgetName
     */
    bcName: string
    filter: BcFilter
}>('bcAddFilter')

/**
 * TODO
 */
export const bcRemoveFilter = createAction<{
    bcName: string
    filter: BcFilter
}>('bcRemoveFilter')

/**
 * Remove all filters at once
 */
export const bcRemoveAllFilters = createAction<{
    bcName: string
}>('bcRemoveAllFilters')

/**
 * TODO
 */
export const bcAddSorter = createAction<{
    bcName: string
    sorter: BcSorter | BcSorter[]
}>('bcAddSorter')

/**
 * TODO
 */
export const bcRemoveSorter = createAction<{
    bcName: string
    sorter: BcSorter
}>('bcRemoveSorter')

/**
 * Fetches data for the new page of business component, replacing existing data
 */
export const bcChangePage = createAction<{
    /**
     * Business component changing the page
     *
     * @deprecated TODO: Will be removed in 2.0.0 in favor of `widgetNam`
     */
    bcName: string
    /**
     * Requested page number
     */
    page: number
    /**
     * Widget changing the page
     */
    widgetName?: string
}>('bcChangePage')

/**
 * TODO
 */
export const showViewError = createAction<{
    error: ApplicationError
}>('showViewError')

/**
 * TODO
 */
export const closeViewError = createAction<null>('closeViewError')

/**
 * Close confirm modal window
 */
export const closeConfirmModal = createAction<null>('closeConfirmModal')

/**
 * TODO
 */
export const clearValidationFails = createAction<null>('clearValidationFails')

/**
 * TODO
 */
export const downloadFile = createAction<{
    fileId: string
}>('downloadFile')

/**
 * TODO
 */
export const downloadFileByUrl = createAction<{
    url: string
}>('downloadFileByUrl')

/**
 * Save uploaded files to the widget
 */
export const bulkUploadFiles = createAction<{
    /**
     * default true
     */
    isPopup?: boolean
    /**
     * If not specified, then taken from state.view.popupData.bcName
     */
    bcName?: string
    /**
     * Ids of uploaded files
     */
    fileIds: string[]
}>('bulkUploadFiles')

/**
 * An error occured during API request
 */
export const apiError = createAction<{
    /**
     * Axios error object
     * https://redux.js.org/style-guide/#do-not-put-non-serializable-values-in-state-or-actions
     */
    error: AxiosError
    /**
     * Request context
     */
    callContext: ApiCallContext
}>('apiError')

/**
 * Fires for specific HTTP status code
 */
export const httpError = createAction<{
    /**
     * Status code for failed request caught by `onErrorHook`
     */
    statusCode: number
    /**
     * Axios error object
     */
    error: AxiosError
    /**
     * Request context
     */
    callContext: ApiCallContext
}>('httpError')

/**
 * Enable/disable debug mode
 */
export const switchDebugMode = createAction<boolean>('switchDebugMode')

/**
 * Download state to device
 */
export const exportState = createAction<null>('exportState')

/**
 * TODO
 */
export const emptyAction = createAction<null>('emptyAction')

/**
 * refresh screens, views and widgets meta
 */
export const refreshMeta = createAction('refreshMeta')
/**
 * refresh refreshMeta was successful
 */
export const refreshMetaDone = createAction('refreshMetaDone')
/**
 * refresh refreshMeta was unsuccessful
 */
export const refreshMetaFail = createAction('refreshMetaFail')

/**
 * Refresh meta data (see action above) and reload page
 */
export const refreshMetaAndReloadPage = createAction<null>('refreshMetaAndReloadPage')

/**
 * Switch to another user role
 */
export const switchRole = createAction<{
    role: string
}>('switchRole')

/**
 * Add pending request for tracking and blocking race conditions
 */
export const addPendingRequest = createAction<{
    request: PendingRequest
}>('addPendingRequest')

/**
 * Remove pending request
 */
export const removePendingRequest = createAction<{
    requestId: string
}>('removePendingRequest')

export const addNotification = createAction<Notification>('addNotification')

export const removeNotifications = createAction<NotificationKeys>('removeNotifications')
