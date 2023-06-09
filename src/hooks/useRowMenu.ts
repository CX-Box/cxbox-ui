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

import React, { MutableRefObject } from 'react'
import { RowOperationsButtonInstance } from '../components/RowOperations/RowOperationsButton'
import { DataItem } from '@cxbox-ui/schema'

/**
 * Handles interactions between `<RowOperationsButton />` and antd `<Table />`
 *
 * Initializes references to both components and prepares a hover configuration for table.
 *
 * @category Hooks
 * @returns A tuple of three values:
 * - operationsRef - assign this reference to `<RowOperationsButton />`
 * - parentRef - assign this reference to common parent of `<RowOperationsButton />` and `<Table />`
 * - handleRowHover - `onMouseEnter`/`onMouseLeave` pair for antd `<Table onRow />` property
 */
export function useRowMenu() {
    const operationsRef = React.useRef<RowOperationsButtonInstance>()
    const parentRef = React.useRef()
    const handleRowHover = (record: DataItem) => ({
        onMouseEnter: (e: React.MouseEvent<HTMLTableRowElement>) => {
            operationsRef.current?.setRow?.(record, e)
        },
        onMouseLeave: (e: React.MouseEvent<HTMLTableRowElement>) => {
            operationsRef.current?.setRow?.(null, e)
        }
    })
    return [operationsRef, parentRef, handleRowHover] as const
}

/**
 * Top padding to position button inside the row
 */
const paddingTop = 17

/**
 * Extends `ref` instance with `setRow` method which can be used to hover row
 *
 * When hovered, `parent` element is placed in the middle of hovered row.
 *
 * @param ref - Reference to `<RowOperationsButton />` instance
 * @param parent - Common parent for `<RowOperationsButton />` and `<Table />`
 * @param containerRef - Root element of `<RowOperationsButton />`
 * @param skip - Condition to skip hover
 * @param onRowHover - Callback for hovered record id
 * @param onRowLeave - Callback when leaving hovered row
 */
export function useRowMenuInstance(
    ref: React.ForwardedRef<RowOperationsButtonInstance>,
    parent: MutableRefObject<HTMLElement>,
    containerRef: MutableRefObject<HTMLElement>,
    skip: boolean,
    onRowHover: (id: string) => void,
    onRowLeave: () => void
) {
    return React.useImperativeHandle(
        ref,
        () => ({
            containerRef,
            setRow: (record, e) => {
                const initialized = !!(parent.current && containerRef.current)
                if (skip || !initialized) {
                    return
                }
                const row = record ? e.currentTarget : null
                if (!row && isOutsideMove(e, parent.current)) {
                    onRowLeave()
                } else if (row && containerRef.current && parent.current) {
                    containerRef.current.style.display = 'block'
                    const { top: rowTop } = row.getBoundingClientRect()
                    const { top: tableTop } = parent.current.getBoundingClientRect()
                    /**
                     * To position in the middle:
                     *
                     * rowTop - tableTop + height / 2 - buttonSize / 2
                     */
                    containerRef.current.style.top = `${rowTop - tableTop + paddingTop}px`
                    onRowHover(record.id)
                }
            }
        }),
        [parent, containerRef, skip, onRowHover, onRowLeave]
    )
}

/**
 * Checks if mouse event is leaving the `container`
 *
 * Iterates through e.relatedTarget ancestors and returns true if no `container` element found.
 * If there was another `<tr>` ancestor then we moved to another hierarchy level and true will
 * be returned regardless of `container` presence.
 *
 * @param e Mouse event
 * @param container Bounding container
 */
export function isOutsideMove(e: React.MouseEvent<HTMLElement>, container: HTMLElement) {
    let parent = e.relatedTarget as HTMLElement
    let fadeAway = true
    let isHierarchy = false
    while (parent) {
        if (parent.nodeName === 'TR') {
            isHierarchy = true
        }
        if (parent === container && !isHierarchy) {
            fadeAway = false
        }
        parent = parent.parentElement
    }
    return fadeAway
}
