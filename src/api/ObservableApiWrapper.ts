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

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { CxboxResponse } from '../interfaces'
import { ApiCallContext } from '../utils'
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

export class ObservableApiWrapper {
    instance: AxiosInstance = axios.create({
        responseType: 'json',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })

    constructor(instance?: AxiosInstance) {
        this.instance = instance
    }

    get<ResponsePayload extends CxboxResponse>(path: string, config: AxiosRequestConfig = {}, callContext?: ApiCallContext) {
        return from(this.instance.get<ResponsePayload>(path, config)).pipe(
            takeWhile(redirectOccurred),
            map(response => response.data)
        )
    }
    put<ResponsePayload extends CxboxResponse>(path: string, data: any, callContext?: ApiCallContext) {
        return from(this.instance.put<ResponsePayload>(path, data)).pipe(
            takeWhile(redirectOccurred),
            map(response => response.data)
        )
    }
    post<ResponsePayload extends CxboxResponse>(path: string, data: any, config?: AxiosRequestConfig, callContext?: ApiCallContext) {
        return from(this.instance.post<ResponsePayload>(path, data)).pipe(
            takeWhile(redirectOccurred),
            map(response => response.data)
        )
    }
    delete<ResponsePayload extends CxboxResponse>(path: string, data: any, config?: AxiosRequestConfig, callContext?: ApiCallContext) {
        return from(this.instance.delete<ResponsePayload>(path, data)).pipe(
            takeWhile(redirectOccurred),
            map(response => response.data)
        )
    }
}
