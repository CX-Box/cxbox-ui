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
import { Button } from 'antd'
import { useDispatch } from 'react-redux'
import { $do } from '../../../actions/actions'
import { useTranslation } from 'react-i18next'

function RefreshButton() {
    const dispatch = useDispatch()
    const handleClick = React.useCallback(() => {
        dispatch($do.refreshMetaAndReloadPage(null))
    }, [dispatch])
    const { t } = useTranslation()
    return (
        <Button type="primary" onClick={handleClick}>
            {t('Refresh page')}
        </Button>
    )
}

export default React.memo(RefreshButton)
