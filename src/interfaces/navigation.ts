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

import { ViewNavigationGroup, MenuItem, ViewNavigationCategory, ViewNavigationItem } from '@cxbox-ui/schema'
export type { ViewNavigationGroup, MenuItem, ViewNavigationCategory, ViewNavigationItem } from '@cxbox-ui/schema'
/**
 * Returns MenuItem if it is ViewNavigationItem
 *
 * @param item to be identified as view
 * @category Type Guards
 */
export function isViewNavigationItem(item: MenuItem): item is ViewNavigationItem {
    return !!item && 'viewName' in item
}

/**
 * @param item
 * @deprecated ViewNavigationCategory will be deleted in 2.0.0
 * @category Type Guards
 */
export function isViewNavigationCategory(item: any): item is ViewNavigationCategory {
    return !!item && 'categoryName' in item
}

/**
 * Returns MenuItem if it is ViewNavigationGroup
 *
 * @param item to be identified as group
 * @category Type Guards
 */
export function isViewNavigationGroup(item: MenuItem): item is ViewNavigationGroup {
    // TODO: remove 'categoryName' check in 2.0.0
    return !!item && 'child' in item && !('categoryName' in item)
}

/**
 * 1 - for static, top level navigation
 * 2 - `SecondLevelMenu` tab widgets
 * 2 - `ThirdLevelMenu` tab widgets
 * 2 - `FourthLevelMenu` tab widgets
 */
export type NavigationLevel = 1 | 2 | 3 | 4

/**
 * Model for displayed tab item
 */
export interface NavigationTab {
    /**
     * View name where navigation tab will redirect the user
     */
    viewName: string
    /**
     * Displayed title: either view name or a group name
     */
    title?: string
    /**
     * When true, menu item will not be visible
     *
     * It's still will be accessible through direct link though
     */
    hidden?: boolean
}
