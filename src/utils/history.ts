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
 * Utilities for urls and browser history
 */
import { Route, RouteType } from '../interfaces'
import { getTemplate } from './strings'

/**
 * Appends '/' in front of `absoluteUrl` argument.
 * If `absoluteUrl` alredy starts with `/` then argument returned without changes.
 *
 * @param absoluteUrl Url
 */
export function makeRelativeUrl(absoluteUrl: string) {
    return absoluteUrl.startsWith('/') ? absoluteUrl : `/${absoluteUrl}`
}

/**
 * Parses a business component hierarchy url into a dictionary of business components
 * and their cursors.
 *
 * @param bcPath Business component hierarchy url, e.g. `bcName1/cursor1/bcName2/cursor2`
 * @category Utils
 */
export function parseBcCursors(bcPath: string) {
    if (!bcPath) {
        return null
    }
    const cursors: Record<string, string> = {}
    const tokens = bcPath.split('/')
    for (let i = 0; i < tokens.length; i = i + 2) {
        if (tokens[i + 1]) {
            cursors[tokens[i]] = tokens[i + 1]
        }
    }
    return cursors
}

/**
 * TODO
 *
 * @param literals
 * @param placeholders
 * @category Utils
 */
export function buildUrl(literals: TemplateStringsArray, ...placeholders: Array<string | number>) {
    let result = ''

    for (let i = 0; i < placeholders.length; i++) {
        result += literals[i]
        const placeholder = placeholders[i]

        if (typeof placeholder === 'number') {
            result += placeholder.toString(10)
        } else if (typeof placeholder === 'string') {
            result += encodeURIComponent(placeholder)
        } else {
            const template = getTemplate(literals, placeholders)
            throw new Error(`Неверный тип подстановочного знака в ${template}, index: ${i}, value: ${JSON.stringify(placeholder)}`)
        }
    }

    result += literals[literals.length - 1]
    return result
}

/**
 * Default implementation for utility to parse `history`-compatible location to {@link Route | Cxbox UI route}.
 *
 * Supports three types of URLs:
 * - {@link RouteType.screen | RouteType.screen}, i.e. an url referencing some UI entity that can be parsed to Route directly. Example: `/screen/name/view/name/`;
 * - {@link RouteType.router | RouteType.router}, i.e. an url without information about entity that should be handled on server side. Example: `/router/server-entity`
 * - {@link RouteType.default | RouteType.default}, i.e. an url that leads to default entity of the application. Example: `/`
 *
 * Reverse function is {@link defaultBuildURL}.
 *
 * @category Utils
 */
export function defaultParseURL(url: URL): Route {
    let path: string = url.pathname

    if (path.startsWith('/')) {
        path = path.substring(1)
    }
    if (path.endsWith('/')) {
        path = path.substring(0, path.length - 1)
    }
    if (path?.includes('&') && !path?.includes('?')) {
        path = path.substring(0, path.indexOf('&'))
    }
    const params: Record<string, unknown> = {}
    url.searchParams.forEach((value, key) => (params[key] = value))
    const tokens = path.split('/').map(decodeURIComponent)

    let type = RouteType.unknown
    let screenName = null
    let viewName = null
    let bcPath = null

    if (tokens.length > 0 && tokens[0] === 'router') {
        type = RouteType.router
    } else if (tokens.length === 1) {
        type = RouteType.default
    } else if (tokens.length >= 2 && tokens[0] === 'screen') {
        let bcIndex = 2
        type = RouteType.screen
        screenName = tokens[1]
        if (tokens.length >= 4 && tokens[2] === 'view') {
            bcIndex += 2
            viewName = tokens[3]
        }
        bcPath = tokens.slice(bcIndex).map(encodeURIComponent).join('/')
    }

    return {
        type: type,
        path: path.length !== 0 && !path.startsWith('/') ? `/${path}` : path,
        search: url.search,
        params,
        screenName,
        viewName,
        bcPath
    }
}

/**
 * Transform {@link Route | Cxbox UI route} to string url.
 *
 * Reverse function is {@link defaultParseURL}.
 *
 * @param route Cxbox UI route
 * @category Utils
 */
export function defaultBuildURL(route: Route) {
    return `/screen/${route.screenName}/view/${route.viewName}/${route.bcPath}`
}

export const getRouteFromString = (ulrString: string) => {
    const url = new URL(ulrString, window.location.origin)

    return defaultParseURL(url)
}
