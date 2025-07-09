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
import axios, { AxiosInstance, AxiosRequestConfig, CancelToken, Method } from 'axios'
import { ApiCallContext, applyParams, buildUrl, parseFilters } from '../utils'
import {
    AssociatedItem,
    BcDataResponse,
    CxboxResponse,
    DataItem,
    DataItemResponse,
    LoginResponse,
    PendingDataItem,
    RowMetaResponse
} from '../interfaces'
import { EMPTY, expand, map, reduce } from 'rxjs'

type GetParamsMap = Record<string, string | number>

export class Api {
    api$: ObservableApiWrapper

    maxUrlLength: number = Infinity

    filterTypes: string[] = []

    constructor(instance: AxiosInstance, maxUrlLength?: number, filterTypes?: string[]) {
        this.api$ = new ObservableApiWrapper(instance)
        this.maxUrlLength = maxUrlLength ?? this.maxUrlLength
        this.filterTypes = filterTypes ?? this.filterTypes
    }

    request<ResponsePayload extends CxboxResponse>(method: Method, path: string, config?: AxiosRequestConfig) {
        let params = config?.params
        let data = config?.data

        const processedConfig = { ...config }

        delete processedConfig['params']
        delete processedConfig['data']

        let url = applyParams(path, params)

        const isLongUrl = url.length > this.maxUrlLength
        let resultMethod = method

        if (isLongUrl && this.filterTypes.length) {
            const paramsHasFilter =
                typeof params === 'object' &&
                params !== null &&
                Object.keys(params).some(key => this.filterTypes.includes(key.split('.')[1]))
            const dataCanBeEdited = (typeof data === 'object' && data !== null) || data === undefined

            if (paramsHasFilter && dataCanBeEdited) {
                resultMethod = method.toLowerCase() === 'get' ? 'post' : method

                params = { ...params }

                const filter: Record<string, unknown> = {}

                Object.entries(params).forEach(([key, value]) => {
                    if (this.filterTypes.includes(key.split('.')[1])) {
                        filter[key] = value
                        delete params[key]
                    }
                })

                const processedFilter = Object.keys(filter).length
                    ? parseFilters(applyParams('', filter as Record<string, string | number>))
                    : undefined

                data = {
                    ...data,
                    filter: processedFilter
                }

                url = applyParams(path, params)
            }
        }

        return this.api$.request<ResponsePayload>({
            method: resultMethod,
            data,
            url,
            ...processedConfig
        })
    }

    get<ResponsePayload extends CxboxResponse>(path: string, config?: AxiosRequestConfig) {
        return this.request<ResponsePayload>('get', path, config)
    }

    put<ResponsePayload extends CxboxResponse>(path: string, config?: AxiosRequestConfig) {
        return this.request<ResponsePayload>('put', path, config)
    }

    post<ResponsePayload extends CxboxResponse>(path: string, config?: AxiosRequestConfig) {
        return this.request<ResponsePayload>('post', path, config)
    }

    delete<ResponsePayload extends CxboxResponse>(path: string, config?: AxiosRequestConfig) {
        return this.request<ResponsePayload>('delete', path, config)
    }

    routerRequest(path: string, params: Record<string, unknown>) {
        return this.get(path, { params }).pipe(map(response => response.data))
    }

    fetchBcData(screenName: string, bcUrl: string, params: GetParamsMap = {}, cancelToken?: CancelToken) {
        const noLimit = params._limit === 0
        const queryStringObject = {
            ...params,
            _page: !noLimit ? ('_page' in params ? params._page : 1) : undefined,
            _limit: !noLimit ? ('_limit' in params ? params._limit : 30) : undefined
        }

        return this.get<BcDataResponse>(buildUrl`data/${screenName}/` + bcUrl, { params: queryStringObject, cancelToken }).pipe(
            map(response => response.data)
        )
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
        return this.get<RowMetaResponse>(buildUrl`row-meta/${screenName}/` + bcUrl, { params, cancelToken }).pipe(
            map(response => response.data.data.row)
        )
    }

    newBcData(screenName: string, bcUrl: string, context: ApiCallContext, params?: GetParamsMap) {
        return this.get<RowMetaResponse>(buildUrl`row-meta-new/${screenName}/` + bcUrl, { params }).pipe(
            map(response => response.data.data)
        )
    }

    saveBcData(
        screenName: string,
        bcUrl: string,
        data: PendingDataItem & { vstamp: number },
        context: ApiCallContext,
        params?: GetParamsMap
    ) {
        return this.put<DataItemResponse>(buildUrl`data/${screenName}/` + bcUrl, { data: { data }, params }).pipe(
            map(response => response.data.data)
        )
    }

    deleteBcData(screenName: string, bcUrl: string = '', context: ApiCallContext, params?: GetParamsMap) {
        return this.delete<DataItemResponse>(buildUrl`data/${screenName}/` + bcUrl, { params }).pipe(map(response => response.data.data))
    }

    customAction(screenName: string, bcUrl: string, data?: Record<string, any>, context?: ApiCallContext, params?: GetParamsMap) {
        return this.post<DataItemResponse>(buildUrl`custom-action/${screenName}/` + bcUrl, { data: data || {}, params }).pipe(
            map(response => response.data.data)
        )
    }

    customActionWithIds(
        screenName: string,
        bcUrl: string,
        data: { data?: Record<string, any>; ids?: string[] },
        context?: ApiCallContext,
        params?: GetParamsMap
    ) {
        return this.post<DataItemResponse>(buildUrl`custom-action/${screenName}/` + bcUrl, {
            data: { data: data.data || {}, ids: data.ids },
            params
        }).pipe(map(response => response.data))
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

        return this.post<any>(buildUrl`associate/${screenName}/` + bcUrl, { data: processedData, params }).pipe(
            map(response => response.data.data)
        )
    }

    getRmByForceActive(screenName: string, bcUrl: string | null, data: PendingDataItem & { vstamp: number }, params?: GetParamsMap) {
        return this.post<RowMetaResponse>(buildUrl`row-meta/${screenName}/` + (bcUrl ?? ''), { data: { data }, params }).pipe(
            map(response => response.data.data.row)
        )
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
        return this.get(buildUrl`bc-registry/refresh-meta`).pipe(map(response => response.data))
    }

    loginByRoleRequest(role: string) {
        return this.get<LoginResponse>(buildUrl`login?role=${role}`).pipe(map(response => response.data))
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
