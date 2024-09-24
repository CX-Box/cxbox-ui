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

import { ViewMetaResponse } from '../interfaces/view'
import { BcMeta, BcMetaState } from '../interfaces/bc'
import { BcFilter, BcSorter } from '../interfaces/filters'
import { ViewNavigationGroup, ViewNavigationItem } from '../interfaces/navigation'

export interface ScreenMetaResponse {
    bo: {
        bc: BcMeta[]
    }
    views: ViewMetaResponse[]
    primary?: string
    primaries: string[] | null
    // TODO: Will not be optional in 2.0.0
    navigation?: {
        menu: Array<ViewNavigationGroup | ViewNavigationItem>
    }
}

export interface ScreenState {
    screenName: string
    bo: {
        activeBcName: string
        bc: Record<string, BcMetaState>
    }
    cachedBc: {
        [bcName: string]: string // url
    }
    views: ViewMetaResponse[]
    primaryView: string
    primaryViews: string[] | null
    filters: Record<string, BcFilter[]>
    sorters: Record<string, BcSorter[]>
}
