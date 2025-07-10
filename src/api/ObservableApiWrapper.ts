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

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import { CxboxResponse } from '../interfaces'
import { ApiCallContext, applyParams, parseFilters } from '../utils'
import { from, map, takeWhile } from 'rxjs'

function redirectOccurred<R extends CxboxResponse>(value: AxiosResponse<R>) {
    if (value.data?.redirectUrl) {
        let redirectUrl = value.data.redirectUrl
        if (!redirectUrl.startsWith('/') && !redirectUrl.match('^http(.?)://')) {
            redirectUrl = `${window.location.pathname}#/${redirectUrl}`
        }
        if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
            redirectUrl = `${window.location.origin}${redirectUrl}`
        }
        window.location.replace(redirectUrl)
        return false
    }
    return true
}

const mergeConfigWithData = (data: any, config?: AxiosRequestConfig) => {
    return { ...config, data: config?.data !== undefined ? config.data : data }
}

export class ObservableApiWrapper {
    instance: AxiosInstance = axios.create({
        responseType: 'json',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })

    maxUrlLength: number = Infinity

    filterTypes: string[] = []

    constructor(instance: AxiosInstance, maxUrlLength?: number, filterTypes?: string[]) {
        this.instance = instance
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

        return from(
            this.instance.request<ResponsePayload>({
                method: resultMethod,
                data,
                url,
                ...processedConfig
            })
        ).pipe(takeWhile(redirectOccurred))
    }

    get<ResponsePayload extends CxboxResponse>(path: string, config?: AxiosRequestConfig, callContext?: ApiCallContext) {
        return this.request<ResponsePayload>('get', path, config).pipe(map(response => response.data))
    }
    put<ResponsePayload extends CxboxResponse>(path: string, data: any, callContext?: ApiCallContext, config?: AxiosRequestConfig) {
        return this.request<ResponsePayload>('put', path, mergeConfigWithData(data, config)).pipe(map(response => response.data))
    }
    post<ResponsePayload extends CxboxResponse>(path: string, data: any, config?: AxiosRequestConfig, callContext?: ApiCallContext) {
        return this.request<ResponsePayload>('post', path, mergeConfigWithData(data, config)).pipe(map(response => response.data))
    }
    delete<ResponsePayload extends CxboxResponse>(path: string, data: any, config?: AxiosRequestConfig, callContext?: ApiCallContext) {
        return this.request<ResponsePayload>('delete', path, mergeConfigWithData(data, config)).pipe(map(response => response.data))
    }
}
