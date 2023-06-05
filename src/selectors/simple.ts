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

import { Store } from '../interfaces/store'
import { PendingValidationFails } from '../interfaces/view'
import { SimpleSelectProps } from '../interfaces/selectors'

export const selectSession = <S extends Store>(state: S) => state.session
export const selectRouter = <S extends Store>(state: S) => state.router
export const selectScreen = <S extends Store>(state: S) => state.screen

export const selectBcDictionary = <S extends Store>(state: S) => state.screen.bo.bc
export const selectBc = <S extends Store>(state: S, { bcName }: SimpleSelectProps) => state.screen.bo.bc[bcName]

export const selectCachedBcDictionary = <S extends Store>(state: S) => state.screen.cachedBc
export const selectCachedBc = <S extends Store>(state: S, { bcName }: SimpleSelectProps) => state.screen.cachedBc[bcName]

export const selectView = <S extends Store>(state: S) => state.view
export const selectViewWidgets = <S extends Store>(state: S) => state.view.widgets
export const selectViewInfiniteWidgets = <S extends Store>(state: S) => state.view.infiniteWidgets

export const selectAllData = <S extends Store>(state: S) => state.data
export const selectBcData = <S extends Store>(state: S, { bcName }: SimpleSelectProps) => state.data[bcName]

export const selectAllDepthData = <S extends Store>(state: S) => state.depthData

export const selectRowMetaDictionary = <S extends Store>(state: S) => state.view.rowMeta
export const selectBcRowMeta = <S extends Store>(state: S, { bcName }: SimpleSelectProps) => state.view.rowMeta[bcName]

export const selectMetaInProgressDictionary = <S extends Store>(state: S) => state.view.metaInProgress
export const selectBcMetaInProgress = <S extends Store>(state: S, { bcName }: SimpleSelectProps) => state.view.metaInProgress[bcName]

export const selectPendingDataChangesDictionary = <S extends Store>(state: S) => state.view.pendingDataChanges
export const selectBcPendingDataChanges = <S extends Store>(state: S, { bcName }: SimpleSelectProps) =>
    state.view.pendingDataChanges[bcName]

export const selectPendingValidationFailsFormat = <S extends Store>(state: S) => state.view.pendingValidationFailsFormat

export const selectOldPendingValidationFails = <S extends Store>(state: S, { bcName }: SimpleSelectProps) =>
    state.view.pendingValidationFails
export const selectBcPendingValidationFails = <S extends Store>(state: S, { bcName }: SimpleSelectProps) =>
    (state.view.pendingValidationFails as PendingValidationFails)?.[bcName]

export const selectHandledForceActiveDictionary = <S extends Store>(state: S) => state.handledForceActive
export const selectBcHandledForceActive = <S extends Store>(state: S, { bcName }: SimpleSelectProps) => state.handledForceActive?.[bcName]

export const selectFiltersDictionary = <S extends Store>(state: S) => state.screen.filters
export const selectBcFilters = <S extends Store>(state: S, { bcName }: SimpleSelectProps) => state.screen.filters[bcName]

export const selectSortersDictionary = <S extends Store>(state: S) => state.screen.sorters
export const selectBcSorters = <S extends Store>(state: S, { bcName }: SimpleSelectProps) => state.screen.sorters[bcName]
