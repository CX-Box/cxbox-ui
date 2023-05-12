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
import { Upload, Icon } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Store } from '../../interfaces/store'
import { Popup } from '../../components/ui/Popup/Popup'
import { $do } from '../../actions/actions'
import * as styles from './FileUploadPopup.less'
import { getFileUploadEndpoint } from '../../utils/api'

/**
 * @category Components
 */
export const FileUploadPopup: React.FC = () => {
    const { t } = useTranslation()
    const popupData = useSelector((state: Store) => state.view.popupData)
    const dispatch = useDispatch()
    const uploadUrl = getFileUploadEndpoint()
    const [ids, setIds] = React.useState<Record<string, string>>({})
    return (
        <div>
            <Popup
                bcName={popupData.bcName}
                showed
                size="medium"
                onOkHandler={() => {
                    dispatch($do.bulkUploadFiles({ fileIds: Object.values(ids) }))
                }}
                onCancelHandler={() => dispatch($do.closeViewPopup({ bcName: popupData.bcName }))}
            >
                <Upload.Dragger
                    className={styles.dragContainer}
                    multiple
                    action={uploadUrl}
                    onChange={info => {
                        if (info.file.status === 'done') {
                            setIds({ ...ids, [info.file.uid]: info.file.response.data.id })
                        }
                    }}
                    onRemove={file => {
                        const newIds = { ...ids }
                        delete newIds[file.uid]
                        setIds(newIds)
                        // TODO: Probably should send delete request
                    }}
                >
                    <div className={styles.icon}>
                        <Icon type="inbox" />
                    </div>
                    <div className={styles.text}>{t('Select files')}</div>
                </Upload.Dragger>
            </Popup>
        </div>
    )
}

/**
 * @category Components
 */
export default React.memo(FileUploadPopup)
