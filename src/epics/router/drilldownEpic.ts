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

import { concat, EMPTY, filter, switchMap } from 'rxjs'
import { CXBoxEpic, DrillDownType } from '../../interfaces'
import { bcAddFilter, bcAddSorter, bcForceUpdate, bcRemoveAllFilters, changeLocation, drillDown } from '../../actions'
import { defaultParseURL, makeRelativeUrl, parseFilters, parseSorters } from '../../utils'

export const drillDownEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(drillDown.match),
        switchMap(action => {
            // TODO: drilldown trash epic
            const state = state$.value
            const url = action.payload.url
            const result = []
            switch (action.payload.drillDownType) {
                case DrillDownType.external:
                    window.location.href = url
                    break
                case DrillDownType.externalNew:
                    if (/^[a-z0-9]+:\/\//i.test(url)) {
                        window.open(url)
                    }
                    break
                case DrillDownType.relative:
                    window.location.href = `${window.location.origin}/${url}`
                    break
                case DrillDownType.relativeNew:
                    window.open(`${window.location.origin}/${url}`, '_blank')
                    break
                case DrillDownType.inner:
                default:
                    const [urlBase] = url.split('?')
                    const urlObject = new URL(url, window.location.origin)
                    const urlFilters = urlObject.searchParams.get('filters')
                    const urlSorters = urlObject.searchParams.get('sorters')

                    let newFilters: Record<string, string> = {}
                    let newSorters: Record<string, string> = {}

                    try {
                        newFilters = JSON.parse(urlFilters) ?? newFilters
                    } catch {
                        urlFilters && console.warn('Failed to parse filters on drilldown')
                        newFilters = {}
                    }
                    try {
                        newSorters = JSON.parse(urlSorters) ?? newSorters
                    } catch {
                        urlSorters && console.warn('Failed to parse sorters on drilldown')
                        newSorters = {}
                    }
                    const bcToUpdate: Record<string, boolean> = {}
                    // If filter drilldown specifies new filters or explicitly says they are empty, drop previous filters
                    Object.keys(state.screen.filters).forEach(bcName => {
                        if (newFilters[bcName] === '' || newFilters[bcName]) {
                            bcToUpdate[bcName] = true
                            result.push(bcRemoveAllFilters({ bcName }))
                        }
                    })
                    const nextState = defaultParseURL(urlObject)
                    const viewName = nextState.viewName
                    // Apply each new filter
                    Object.entries(newFilters).forEach(([bcName, filterExpression]) => {
                        const parsedFilters = parseFilters(filterExpression)?.map(item => ({ ...item, viewName }))
                        parsedFilters?.forEach(parsedFilter => {
                            bcToUpdate[bcName] = true
                            result.push(bcAddFilter({ bcName, filter: parsedFilter }))
                        })
                    })
                    // Apply each new sorter
                    Object.entries(newSorters).forEach(([bcName, sortExpression]) => {
                        const sorter = parseSorters(sortExpression)
                        result.push(bcAddSorter({ bcName, sorter }))
                        bcToUpdate[bcName] = true
                    })
                    const prevState = state.router
                    const willUpdateAnyway = shallowCompare(prevState, nextState, ['params']).length > 0
                    // If screen or view is different all BC will update anyway so there is no need
                    // to manually set them for update
                    if (!willUpdateAnyway) {
                        Object.keys(bcToUpdate).forEach(bcName => {
                            result.push(bcForceUpdate({ bcName }))
                        })
                    }
                    result.push(
                        changeLocation({
                            location: defaultParseURL(new URL(makeRelativeUrl(urlBase), window.location.origin)),
                            forceUpdate: true
                        })
                    )
                    break
            }

            return result.length ? concat(result) : EMPTY
        })
    )

/**
 * Shallow compare of two dictionaries by strict comparison.
 * `ignore` argument can be used to forcefully exclude some properties from result set even if their
 * are different.
 *
 * TODO: Check if possible to replace with `shallowEqual` from `react-redux`
 *
 * @param prevProps
 * @param nextProps
 * @param ignore
 */
function shallowCompare(prevProps: Record<string, any>, nextProps: Record<string, any>, ignore: string[] = []) {
    const diffProps: string[] = []
    if (!prevProps && !nextProps) {
        return null
    }
    if (!prevProps) {
        return Object.keys(nextProps)
    }
    if (!nextProps) {
        return Object.keys(prevProps)
    }
    const newKeys = Object.keys(nextProps)
    newKeys.forEach(key => {
        if (prevProps[key] !== nextProps[key] && !ignore.includes(key)) {
            diffProps.push(key)
        }
    })
    Object.keys(prevProps).forEach(key => {
        if (!newKeys.includes(key)) {
            diffProps.push(key)
        }
    })
    return diffProps
}
