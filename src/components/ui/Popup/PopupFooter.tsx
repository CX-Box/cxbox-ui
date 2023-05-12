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
import { useTranslation } from 'react-i18next'
import styles from './PopupFooter.less'
import { Button } from 'antd'

export interface PopupFooterProps {
    onAccept?: () => void
    onCancel?: () => void
}

/**
 *
 * @param props
 * @category Components
 */
export const PopupFooter: React.FC<PopupFooterProps> = props => {
    const { t } = useTranslation()

    return (
        <div className={styles.actions}>
            <Button onClick={props.onAccept} className={styles.buttonYellow}>
                {t('Save')}
            </Button>
            <Button onClick={props.onCancel} className={styles.buttonCancel}>
                {t('Cancel')}
            </Button>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedPopupFooter = React.memo(PopupFooter)

export default MemoizedPopupFooter
