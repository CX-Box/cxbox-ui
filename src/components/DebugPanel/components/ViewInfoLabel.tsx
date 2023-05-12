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
import InfoLabel from './InfoLabel'
import { useSelector } from 'react-redux'
import { Store } from '../../../interfaces/store'
import styles from './ViewInfoLabel.less'

const ViewInfoLabel: React.FunctionComponent = () => {
    const screenName = useSelector((store: Store) => store.screen.screenName) ?? ''
    const viewName = useSelector((store: Store) => store.view.name) ?? ''
    const screenInfo = [`"name": "${screenName}"`]
    const viewInfo = [`"name": "${viewName}"`]
    return (
        <div className={styles.container}>
            <InfoLabel label="Screen" info={screenInfo} />
            <InfoLabel label="View" info={viewInfo} />
        </div>
    )
}

const MemoizedViewInfoLabel = React.memo(ViewInfoLabel)
export default MemoizedViewInfoLabel
