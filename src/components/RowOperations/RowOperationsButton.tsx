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
import { Button, Dropdown } from 'antd'
import { WidgetTableMeta } from '../../interfaces/widget'
import styles from './RowOperationsButton.less'
import { useDispatch } from 'react-redux'
import { $do } from '../../actions/actions'
import { DataItem } from '@cxbox-ui/schema'
import RowOperationsMenu from './RowOperationsMenu'
import { useRowMenuInstance } from '../../hooks/useRowMenu'

/**
 * {@link RowOperationsMenu | RowOperationsMenu} properties
 */
interface RowOperationsButtonProps {
    /**
     * Widget meta description
     */
    meta: WidgetTableMeta
    /**
     * Use when business component differs from widget's (e.g. hierarchies nested level)
     */
    bcName?: string
    /**
     * Common parent for {@link Table | Table} and {@link RowOperationsButton | RowOperationsButton}
     */
    parent: MutableRefObject<HTMLElement>
}

/**
 * {@link RowOperationsButton | RowOperationsButton} instance
 */
export interface RowOperationsButtonInstance {
    setRow: (record: DataItem, e: React.MouseEvent<HTMLElement>) => void
    containerRef: MutableRefObject<HTMLElement>
}

/**
 * Button that shows available operations for the row
 *
 * On click fetches row meta for clicked row by dispatching
 * {@link ActionPayloadTypes.bcSelectRecord | bcSelectRecord} and shows {@link RowOperationsMenu | RowOperationsMenu}
 *
 * {@link RowOperationsButtonInstance.setRow | setRow} can be used to dynamically place the button
 * next to hovered row.
 *
 * @param props - Component properties
 * @param ref - Assigned reference will receive component instance
 */
export const RowOperationsButton: React.ForwardRefRenderFunction<RowOperationsButtonInstance, RowOperationsButtonProps> = (
    { meta, parent, ...props }: RowOperationsButtonProps,
    ref
) => {
    const dispatch = useDispatch()
    /**
     * Nested hierarchies might pass bcName directly
     */
    const bcName = props.bcName || meta.bcName
    const containerRef = React.useRef<HTMLDivElement>()
    const containerCurrent = containerRef.current
    const [selectedRow, setSelectedRow] = React.useState('')
    const [showMenu, setShowMenu] = React.useState(false)

    /**
     * Fetches row meta to get
     */
    const handleFetchMeta = React.useCallback(() => {
        dispatch($do.bcSelectRecord({ bcName, cursor: selectedRow }))
    }, [bcName, selectedRow, dispatch])

    /**
     * Hides the button
     *
     * @param force - Hides the button even if menu is open
     */
    const handleMouseLeave = React.useCallback(
        (force?: boolean) => {
            if (containerRef.current && (!showMenu || force)) {
                containerRef.current.style.display = 'none'
            }
        },
        [showMenu]
    )

    /**
     * Links menu visibility to the state and hides the button on closing menu (???)
     *
     * @param visibility
     */
    const handleVisibleChange = React.useCallback(
        (visibility: boolean) => {
            setShowMenu(visibility)
            if (!visibility) {
                handleMouseLeave(true)
            }
        },
        [handleMouseLeave]
    )

    /**
     * Close menu after operation was selected
     */
    const handleMenuClosed = React.useCallback(() => {
        handleVisibleChange(false)
    }, [handleVisibleChange])

    /**
     * Anchor button popup to container element
     */
    const handlePopupContainer = React.useCallback(() => {
        return containerCurrent
    }, [containerCurrent])

    /**
     * Exposes `setRow` for component instance
     */
    useRowMenuInstance(ref, parent, containerRef, showMenu, setSelectedRow, handleMouseLeave)

    return (
        <div ref={containerRef} className={styles.floatMenu}>
            <Dropdown
                placement="bottomRight"
                trigger={['click']}
                overlay={<RowOperationsMenu meta={meta} bcName={bcName} onSelect={handleMenuClosed} />}
                onVisibleChange={handleVisibleChange}
                getPopupContainer={handlePopupContainer}
            >
                {/*<Icon type="ellipsis" className={styles.dots} onClick={handleFetchMeta} />*/}
                <Button className={styles.dots} data-test-widget-list-row-action={true} icon="ellipsis" onClick={handleFetchMeta} />
            </Dropdown>
        </div>
    )
}

export default React.forwardRef(RowOperationsButton)
