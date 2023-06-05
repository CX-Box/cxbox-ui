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

import { AxiosInstance } from 'axios'
export interface ApiCallContext {
    widgetName: string
}

type QueryParamsMap = Record<string, string | number>

/**
 * Removes empty values from query parameters dictionary
 *
 * @param qso Query parameters dictionary
 */
function dropEmptyOrWrongParams(qso: QueryParamsMap) {
    const result: QueryParamsMap = { ...qso }

    return Object.keys(result).reduce((prev, paramKey) => {
        if (!prev[paramKey] && typeof prev[paramKey] !== 'number') {
            delete prev[paramKey]
        }
        return prev
    }, result)
}

/**
 * Extends url with query parameters control symbol (`?` or `&`)
 *
 * @param url Url with or without `?` symbol
 */
export function addTailControlSequences(url: string) {
    return !url.includes('?') ? url + '?' : url + '&'
}

/**
 * Extends url with query parameters
 *
 * @param url Url to extend
 * @param qso Query parameters dictionary
 */
export function applyParams(url: string, qso: QueryParamsMap) {
    if (!qso) {
        return url
    }
    return applyRawParams(url, dropEmptyOrWrongParams(qso))
}

/**
 * TODO
 *
 * @param url
 * @param qso
 */
export function applyRawParams(url: string, qso: Record<string, any>) {
    if (!qso) {
        return url
    }
    const result = new URLSearchParams(qso).toString()
    return `${addTailControlSequences(url)}${result && `${result}`}`
}

/**
 * Get Cxbox API file upload endpoint based on baseURL of axios instance
 *
 * Handles empty baseURL and trailing slash
 *
 * @returns File upload endpoint
 */
export function getFileUploadEndpoint(instance: AxiosInstance) {
    if (!instance.defaults.baseURL) {
        return '/file'
    }
    return instance.defaults.baseURL.endsWith('/') ? `${instance.defaults.baseURL}file` : `${instance.defaults.baseURL}/file`
}
