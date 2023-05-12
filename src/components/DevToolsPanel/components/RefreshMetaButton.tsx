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
import { $do } from '../../../actions/actions'
import { Button, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

interface RefreshMetaButtonProps {
    className?: string
}

const RefreshMetaButton: React.FunctionComponent<RefreshMetaButtonProps> = props => {
    const { className } = props
    const dispatch = useDispatch()
    const handleRefreshMeta = React.useCallback(() => {
        dispatch($do.refreshMeta(null))
    }, [dispatch])
    const { t } = useTranslation()
    return (
        <div className={className}>
            <Tooltip title={t('Refresh meta')}>
                <Button onClick={handleRefreshMeta} icon="sync" />
            </Tooltip>
        </div>
    )
}

/**
 * @category Components
 */
export const MemoizedRefreshMetaButton = React.memo(RefreshMetaButton)

export default MemoizedRefreshMetaButton
