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

import { ScreenState } from '../interfaces'
import { BcMeta, BcMetaState } from '../interfaces'
import { OperationTypeCrud } from '@cxbox-ui/schema'
import { parseFilters, parseSorters } from '../utils'
import { BcFilter, BcSorter } from '../interfaces'
import {
    bcAddFilter,
    bcAddSorter,
    bcChangeCursors,
    bcChangeDepthCursor,
    bcChangePage,
    bcDeleteDataFail,
    bcFetchDataFail,
    bcFetchDataRequest,
    bcFetchDataSuccess,
    bcForceUpdate,
    bcLoadMore,
    bcNewDataSuccess,
    bcRemoveAllFilters,
    bcRemoveFilter,
    bcSaveDataFail,
    bcSaveDataSuccess,
    bcSelectRecord,
    selectScreen,
    selectScreenFail,
    selectView,
    sendOperation,
    sendOperationFail,
    sendOperationSuccess,
    showViewPopup
} from '../actions'
import { ReducerBuilderManager } from './ReducerBuilderManager'
import { DepthBcType } from '../interfaces/bc'

export const initialScreenState: ScreenState = {
    screenName: '',
    bo: { activeBcName: '', bc: {} },
    cachedBc: {},
    views: [],
    primaryView: '',
    filters: {},
    sorters: {}
}

const operationsHandledLocally: readonly string[] = [OperationTypeCrud.associate, OperationTypeCrud.fileUpload]

/**
 * Screen reducer
 *
 * Stores information about currently active screen and various more persistent values which should be stored
 * until we navitage to a different screen.
 */
export const createScreenReducerBuilderManager = <S extends ScreenState>(initialState: S) =>
    new ReducerBuilderManager<S>()
        .addCase(selectScreen, (state, action) => {
            const bcDictionary: Record<string, BcMeta> = {}
            const bcSorters: Record<string, BcSorter[]> = {}
            const bcFilters: Record<string, BcFilter[]> = {}
            action.payload.screen.meta?.bo.bc.forEach(item => {
                bcDictionary[item.name] = item
                const sorter = parseSorters(item.defaultSort)
                const filter = parseFilters(item.defaultFilter)
                if (sorter) {
                    bcSorters[item.name] = sorter
                }
                if (filter) {
                    bcFilters[item.name] = filter
                }
            })
            state.screenName = action.payload.screen.name
            state.primaryView = action.payload.screen.meta?.primary ?? state.primaryView
            state.views = action.payload.screen.meta?.views ?? state.views
            state.bo = { activeBcName: null, bc: bcDictionary }
            state.sorters = { ...state.sorters, ...bcSorters }
            state.filters = { ...state.filters, ...bcFilters }
        })
        .addCase(selectScreenFail, (state, action) => {
            state.screenName = action.payload.screenName
            state.views = []
        })
        .addCase(bcFetchDataRequest, (state, action) => {
            state.bo.bc[action.payload.bcName as string].loading = true
        })
        .addCase(bcLoadMore, (state, action) => {
            const currentBc = state.bo.bc[action.payload.bcName]
            currentBc.page = (currentBc.page ?? 1) + 1
            currentBc.loading = true
        })
        .addCase(selectView, (state, action) => {
            const newBcs: Record<string, BcMetaState> = {}
            Array.from(
                new Set(action.payload.widgets?.map(widget => widget.bcName)) // БК которые есть на вьюхе
            )
                .filter(bcName => state.bo.bc[bcName])
                .forEach(bcName => {
                    newBcs[bcName] = { ...state.bo.bc[bcName], page: 1 }
                })
            state.bo.bc = { ...state.bo.bc, ...newBcs }
        })
        .addCase(bcFetchDataSuccess, (state, action) => {
            const currentBc = state.bo.bc[action.payload.bcName]
            currentBc.hasNext = action.payload.hasNext
            currentBc.loading = false
            state.cachedBc[action.payload.bcName] = action.payload.bcUrl
        })
        .addCase(bcFetchDataFail, (state, action) => {
            const bcName = action.payload.bcName as string

            if (Object.values(state.bo.bc).some(bc => bc.name === bcName)) {
                state.bo.bc[bcName].loading = false
                state.cachedBc[bcName] = action.payload.bcUrl
            }
        })
        .addCase(sendOperation, (state, action) => {
            if (!operationsHandledLocally.includes(action.payload.operationType)) {
                state.bo.bc[action.payload.bcName].loading = true
            }
        })
        .addCase(bcNewDataSuccess, (state, action) => {
            state.bo.bc[action.payload.bcName].loading = false
            state.bo.bc[action.payload.bcName].cursor = action.payload.dataItem.id
            state.cachedBc[action.payload.bcName] = action.payload.bcUrl
        })
        .addCase(bcChangeCursors, (state, action) => {
            const newCursors: Record<string, BcMetaState> = {}
            const newCache: Record<string, string> = {}
            Object.entries(action.payload.cursorsMap).forEach(entry => {
                const [bcName, cursor] = entry
                newCursors[bcName] = { ...state.bo.bc[bcName], cursor }
                newCache[bcName] = cursor
            })
            // Also reset cursors of all children of requested BCs
            const changedParents = Object.values(newCursors).map(bc => `${bc.url}/:id`)
            Object.values(state.bo.bc).forEach(bc => {
                if (changedParents.some(item => bc.url.includes(item))) {
                    newCursors[bc.name] = { ...state.bo.bc[bc.name], cursor: null }
                    newCache[bc.name] = null
                }
            })
            Object.assign(state.bo.bc, newCursors)
            Object.assign(state.cachedBc, newCache)
        })
        .addCase(bcChangeDepthCursor, (state, action) => {
            if (action.payload.depth === 1) {
                state.bo.bc[action.payload.bcName].cursor = action.payload.cursor
            } else {
                state.bo.bc[action.payload.bcName].depthBc = state.bo.bc[action.payload.bcName].depthBc ?? {}
                ;(state.bo.bc[action.payload.bcName].depthBc as DepthBcType)[action.payload.depth].cursor = action.payload.cursor
            }
        })
        .addCase(bcSelectRecord, (state, action) => {
            state.bo.bc[action.payload.bcName].cursor = action.payload.cursor
        })
        .addCase(bcForceUpdate, (state, action) => {
            state.bo.bc[action.payload.bcName].loading = true
            state.cachedBc[action.payload.bcName] = null
        })
        .addCase(bcAddFilter, (state, action) => {
            const { bcName, filter } = action.payload
            const newFilter = filter
            const prevFilters = state.filters[bcName] || []
            const prevFilter = prevFilters.find(item => item.fieldName === filter.fieldName && item.type === filter.type)
            const newFilters = prevFilter
                ? prevFilters.map(item => (item === prevFilter ? { ...prevFilter, value: newFilter.value } : item))
                : [...prevFilters, newFilter]
            state.bo.bc[bcName].page = 1
            state.filters[bcName] = newFilters
        })
        .addCase(bcRemoveFilter, (state, action) => {
            const { bcName, filter } = action.payload
            const prevBcFilters = state.filters[bcName] || []
            const newBcFilters = prevBcFilters.filter(item => item.fieldName !== filter?.fieldName || item.type !== filter.type)
            const newFilters = { ...state.filters, [bcName]: newBcFilters }
            if (!newBcFilters.length) {
                delete newFilters[bcName]
            }
            state.bo.bc[action.payload.bcName].page = 1
            state.filters = newFilters
        })
        .addCase(bcRemoveAllFilters, (state, action) => {
            delete state.filters[action.payload.bcName]
            state.bo.bc[action.payload.bcName].page = 1
        })
        .addCase(bcAddSorter, (state, action) => {
            state.sorters[action.payload.bcName] = Array.isArray(action.payload.sorter) ? action.payload.sorter : [action.payload.sorter]
        })
        .addCase(bcChangePage, (state, action) => {
            state.bo.bc[action.payload.bcName].page = action.payload.page
            state.bo.bc[action.payload.bcName].loading = true
        })
        .addCase(showViewPopup, (state, action) => {
            const currentPage = state.bo.bc[action.payload.bcName]?.page ?? 1

            state.bo.bc[action.payload.bcName].page = action.payload.bcName === action.payload.calleeBCName ? currentPage : 1
            state.bo.bc[action.payload.bcName].loading = action.payload.bcName !== action.payload.calleeBCName
        })
        //don't use matcher in prior to add more cases
        .addCase(sendOperationSuccess, (state, action) => {
            state.bo.bc[action.payload.bcName].loading = false
        })
        .addCase(bcDeleteDataFail, (state, action) => {
            state.bo.bc[action.payload.bcName].loading = false
        })
        .addCase(sendOperationFail, (state, action) => {
            state.bo.bc[action.payload.bcName].loading = false
        })
        .addCase(bcSaveDataSuccess, (state, action) => {
            state.bo.bc[action.payload.bcName].loading = false
        })
        .addCase(bcSaveDataFail, (state, action) => {
            state.bo.bc[action.payload.bcName].loading = false
        })
