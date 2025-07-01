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

import { ObservableApiWrapper } from './ObservableApiWrapper'
import axios, { AxiosInstance, CancelToken } from 'axios'
import { ApiCallContext, applyParams, applyRawParams, buildUrl } from '../utils'
import { AssociatedItem, BcDataResponse, DataItem, DataItemResponse, LoginResponse, PendingDataItem, RowMetaResponse } from '../interfaces'
import { EMPTY, expand, map, reduce } from 'rxjs'

type GetParamsMap = Record<string, string | number>

export class Api {
    api$: ObservableApiWrapper

    constructor(instance: AxiosInstance) {
        this.api$ = new ObservableApiWrapper(instance)
    }

    routerRequest(path: string, params: Record<string, unknown>) {
        return this.api$.get(applyRawParams(path, params))
    }

    fetchBcData(screenName: string, bcUrl: string, params: GetParamsMap = {}, cancelToken?: CancelToken) {
        const noLimit = params._limit === 0
        const queryStringObject = {
            ...params,
            _page: !noLimit ? ('_page' in params ? params._page : 1) : undefined,
            _limit: !noLimit ? ('_limit' in params ? params._limit : 30) : undefined
        }
        const url = applyParams(buildUrl`data/${screenName}/` + bcUrl, queryStringObject)
        return this.api$.get<BcDataResponse>(url, { cancelToken })
    }

    fetchBcDataAll(screenName: string, bcUrl: string, params: GetParamsMap = {}) {
        let currentPage = 1

        return this.fetchBcData(screenName, bcUrl, { ...params, _page: currentPage }).pipe(
            expand(response => {
                return response.hasNext ? this.fetchBcData(screenName, bcUrl, { ...params, _page: ++currentPage }) : EMPTY
            }),
            reduce((items, nextResponse) => {
                return [...items, ...nextResponse.data]
            }, [] as DataItem[])
        )
    }

    fetchRowMeta(screenName: string, bcUrl: string, params?: GetParamsMap, cancelToken?: CancelToken) {
        const url = applyParams(buildUrl`row-meta/${screenName}/` + bcUrl, params)
        return this.api$.get<RowMetaResponse>(url, { cancelToken }).pipe(map(response => response.data.row))
    }

    newBcData(screenName: string, bcUrl: string, context: ApiCallContext, params?: GetParamsMap) {
        const url = applyParams(buildUrl`row-meta-new/${screenName}/` + bcUrl, params)
        return this.api$.get<RowMetaResponse>(url, undefined, context).pipe(map(response => response.data))
    }

    saveBcData(
        screenName: string,
        bcUrl: string,
        data: PendingDataItem & { vstamp: number },
        context: ApiCallContext,
        params?: GetParamsMap
    ) {
        const url = applyParams(buildUrl`data/${screenName}/` + bcUrl, params)
        return this.api$.put<DataItemResponse>(url, { data }, context).pipe(map(response => response.data))
    }

    deleteBcData(screenName: string, bcUrl: string = '', context: ApiCallContext, params?: GetParamsMap) {
        const url = applyParams(buildUrl`data/${screenName}/` + bcUrl, params)
        return this.api$.delete<DataItemResponse>(url, context).pipe(map(response => response.data))
    }

    customAction(screenName: string, bcUrl: string, data?: Record<string, any>, context?: ApiCallContext, params?: GetParamsMap) {
        const url = applyParams(buildUrl`custom-action/${screenName}/` + bcUrl, params)
        return this.api$.post<DataItemResponse>(url, { data: data || {} }, undefined, context).pipe(map(response => response.data))
    }

    customActionWithIds(
        screenName: string,
        bcUrl: string,
        data: { data?: Record<string, any>; ids?: string[] },
        context?: ApiCallContext,
        params?: GetParamsMap
    ) {
        const url = applyParams(buildUrl`custom-action/${screenName}/` + bcUrl, params)
        return this.api$.post<DataItemResponse>(url, { data: data.data || {}, ids: data.ids }, undefined, context)
    }

    associate(screenName: string, bcUrl: string, data: AssociatedItem[] | Record<string, AssociatedItem[]>, params?: GetParamsMap) {
        // TODO: Why Cxbox API sends underscored `_associate` but expects `associated` in return?
        const processedData = Array.isArray(data)
            ? data.map(item => ({
                  id: item.id,
                  vstamp: item.vstamp,
                  associated: item._associate
              }))
            : data
        const url = applyParams(buildUrl`associate/${screenName}/` + bcUrl, params)
        return this.api$.post<any>(url, processedData).pipe(map(response => response.data))
    }

    getRmByForceActive(screenName: string, bcUrl: string | null, data: PendingDataItem & { vstamp: number }, params?: GetParamsMap) {
        const url = applyParams(buildUrl`row-meta/${screenName}/` + (bcUrl ?? ''), params)
        return this.api$.post<RowMetaResponse>(url, { data }).pipe(map(response => response.data.row))
    }
    /**
     * Get Cxbox API file upload endpoint based on baseURL of axios instance
     *
     * Handles empty baseURL and trailing slash
     *
     * @returns File upload endpoint
     */
    get fileUploadEndpoint() {
        const instance = this.api$.instance

        if (!instance.defaults.baseURL) {
            return '/file'
        }

        return instance.defaults.baseURL.endsWith('/') ? `${instance.defaults.baseURL}file` : `${instance.defaults.baseURL}/file`
    }

    refreshMeta() {
        return this.api$.get(buildUrl`bc-registry/refresh-meta`)
    }

    loginByRoleRequest(role: string) {
        return this.api$.get<LoginResponse>(buildUrl`login?role=${role}`)
    }

    createCanceler() {
        let cancel: (() => void) | undefined

        const cancelToken = new axios.CancelToken(c => {
            cancel = c
        })

        return {
            cancel,
            cancelToken
        }
    }
}
