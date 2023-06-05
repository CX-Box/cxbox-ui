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

import { EMPTY, filter, switchMap } from 'rxjs'
import { CXBoxEpic } from '../../interfaces'
import { drillDown } from '../../actions'

export const drillDownEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(drillDown.match),
        switchMap(action => {
            // TODO: drilldown trash epic
            // const state = state$.value
            // const url = action.payload.url
            // switch (action.payload.drillDownType) {
            //     case DrillDownType.external:
            //         window.location.href = url
            //         break
            //     case DrillDownType.externalNew:
            //         if (/^[a-z0-9]+:\/\//i.test(url)) {
            //             window.open(url)
            //         }
            //         break
            //     case DrillDownType.relative:
            //         window.location.href = `${window.location.origin}/${url}`
            //         break
            //     case DrillDownType.relativeNew:
            //         window.open(`${window.location.origin}/${url}`, '_blank')
            //         break
            //     case DrillDownType.inner:
            //     default:
            //         const [urlBase, urlParams] = url.split('?')
            //         const urlFilters = qs.parse(urlParams).filters
            //         const urlSorters = qs.parse(urlParams).sorters
            //         let newFilters: Record<string, string> = null
            //         let newSorters: Record<string, string> = null
            //         try {
            //             newFilters = JSON.parse(urlFilters)
            //         } catch {
            //             urlFilters && console.warn('Failed to parse filters on drilldown')
            //             newFilters = {}
            //         }
            //         try {
            //             newSorters = JSON.parse(urlSorters)
            //         } catch {
            //             urlSorters && console.warn('Failed to parse sorters on drilldown')
            //             newSorters = {}
            //         }
            //         const bcToUpdate: Record<string, boolean> = {}
            //         // If filter drilldown specifies new filters or explicitly says they are empty, drop previous filters
            //         Object.keys(state.screen.filters).forEach(bcName => {
            //             if (newFilters[bcName] === '' || newFilters[bcName]) {
            //                 bcToUpdate[bcName] = true
            //                 store.dispatch($do.bcRemoveAllFilters({ bcName }))
            //             }
            //         })
            //         const nextState = defaultParseLocation(parsePath(url))
            //         const viewName = nextState.viewName
            //         // Apply each new filter
            //         Object.entries(newFilters).forEach(([bcName, filterExpression]) => {
            //             const parsedFilters = parseFilters(filterExpression)?.map(item => ({ ...item, viewName }))
            //             parsedFilters?.forEach(filter => {
            //                 bcToUpdate[bcName] = true
            //                 store.dispatch($do.bcAddFilter({ bcName, filter }))
            //             })
            //         })
            //         // Apply each new sorter
            //         Object.entries(newSorters).forEach(([bcName, sortExpression]) => {
            //             const sorter = parseSorters(sortExpression)
            //             store.dispatch($do.bcAddSorter({ bcName, sorter }))
            //             bcToUpdate[bcName] = true
            //         })
            //         const prevState = state.router
            //         const willUpdateAnyway = shallowCompare(prevState, nextState, ['params']).length > 0
            //         // If screen or view is different all BC will update anyway so there is no need
            //         // to manually set them for update
            //         if (!willUpdateAnyway) {
            //             Object.keys(bcToUpdate).forEach(bcName => {
            //                 store.dispatch($do.bcForceUpdate({ bcName }))
            //             })
            //         }
            //         historyObj.push(makeRelativeUrl(urlBase))
            //         break
            // }
            return EMPTY
        })
    )
