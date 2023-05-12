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
import { Store } from 'interfaces/store'
import { Button, Tooltip } from 'antd'
import { $do } from '../../../actions/actions'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

interface DebugModeButtonProps {
    className?: string
}

const DebugModeButton: React.FunctionComponent<DebugModeButtonProps> = props => {
    const { className } = props
    const dispatch = useDispatch()
    const mode = useSelector((store: Store) => store.session.debugMode)
    const handleDebugMode = React.useCallback(() => dispatch($do.switchDebugMode(!mode)), [dispatch, mode])
    const { t } = useTranslation()
    const tooltipTitle = t('Show meta')

    return (
        <div className={className}>
            <Tooltip title={tooltipTitle}>
                <Button icon="bug" onClick={handleDebugMode} />
            </Tooltip>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedDebugModeButton = React.memo(DebugModeButton)

export default MemoizedDebugModeButton
