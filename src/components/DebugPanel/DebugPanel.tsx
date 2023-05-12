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
import { Collapse } from 'antd'
import { useSelector } from 'react-redux'
import { Store } from '../../interfaces/store'
import { WidgetMeta } from '../../interfaces/widget'
import FormattedJSON from './components/FormattedJSON'
import WidgetInfoLabel from './components/WidgetInfoLabel'

interface DebugPanelProps {
    widgetMeta: WidgetMeta
}

const DebugPanel: React.FunctionComponent<DebugPanelProps> = props => {
    const { widgetMeta } = props
    const { Panel } = Collapse
    const widget = useSelector((store: Store) => store.view.widgets.find(i => i.name === widgetMeta.name))
    const bc = useSelector((store: Store) => store.screen.bo.bc[widgetMeta.bcName])
    const data = useSelector((store: Store) => store.data[widgetMeta.bcName])
    const widgetText = `"name": "${widget.name ?? ''}"`
    const titleText = `"title": "${widget.title ?? ''}"`
    const bcText = `"bc": "${widget.bcName ?? ''}"`
    const infoList = [widgetText, titleText, bcText]
    return (
        <>
            <WidgetInfoLabel infoList={infoList} />
            <Collapse>
                <Panel header="Widget" key="widgetDebug">
                    <FormattedJSON json={(widget as unknown) as Record<string, unknown>} />
                </Panel>
                <Panel header="BC" key="bcDebug">
                    <FormattedJSON json={(bc as unknown) as Record<string, unknown>} />
                </Panel>
                <Panel header="Data" key="dataDebug">
                    <FormattedJSON json={(data as unknown) as Record<string, unknown>} />
                </Panel>
            </Collapse>
        </>
    )
}

const MemoizedDebugPanel = React.memo(DebugPanel)
export default MemoizedDebugPanel
