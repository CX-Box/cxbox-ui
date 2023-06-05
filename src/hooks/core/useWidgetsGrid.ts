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

import { WidgetMeta } from '../../interfaces/widget'
import { useMemo } from 'react'

function createWidgetsGrid(widgets: WidgetMeta[], skipWidgetTypes: string[]) {
    const grid: Record<string, WidgetMeta[]> = {}

    widgets
        .filter(widget => {
            return !skipWidgetTypes.includes(widget.type)
        })
        .forEach(widget => {
            if (!grid[widget.position]) {
                grid[widget.position] = []
            }

            grid[widget.position].push(widget)
        })

    return Object.values(grid)
}

export function useWidgetsGrid(widgets: WidgetMeta[], skipWidgetTypes: string[]) {
    return useMemo(() => createWidgetsGrid(widgets, skipWidgetTypes), [widgets, skipWidgetTypes])
}
