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

import React from 'react'
import { Layout as AntLayout } from 'antd'
import styles from './DevToolsPanel.less'
import RefreshMetaButton from './components/RefreshMetaButton'
import DebugModeButton from './components/DebugModeButton'
import cn from 'classnames'

interface DevToolsPanelProps {
    className?: string
    children?: React.ReactNode
}

/**
 * Dev tools panel
 */
const DevToolsPanel: React.FunctionComponent<DevToolsPanelProps> = ({ children, className }) => {
    return (
        <div className={cn(styles.container, className)}>
            <AntLayout.Header>
                <div className={styles.controlsWrapper}>
                    <RefreshMetaButton className={styles.wrapper} key="RefreshMetaButton" />
                    <DebugModeButton className={styles.wrapper} key="DebugModeButton" />
                    {children}
                </div>
            </AntLayout.Header>
        </div>
    )
}
/**
 * @category Components
 */
export const MemoizedDevToolsPanel = React.memo(DevToolsPanel)

export default MemoizedDevToolsPanel
