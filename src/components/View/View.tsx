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

import React, { FunctionComponent } from 'react'
import { connect, useSelector } from 'react-redux'
import { Store } from '../../interfaces/store'
import { CustomWidget, CustomWidgetDescriptor, PopupWidgetTypes, WidgetMeta } from '../../interfaces/widget'
import DashboardLayout from '../ui/DashboardLayout/DashboardLayout'
import { FileUploadPopup } from '../../components/FileUploadPopup/FileUploadPopup'
import ViewInfoLabel from '../DebugPanel/components/ViewInfoLabel'
import DebugPanel from '../DebugPanel/DebugPanel'

export interface ViewProps {
    debugMode?: boolean
    widgets: WidgetMeta[]
    skipWidgetTypes?: string[]
    card?: (props: any) => React.ReactElement<any>
    customSpinner?: (props: any) => React.ReactElement<any>
    customWidgets?: Record<string, CustomWidgetDescriptor>
    customLayout?: (props: any) => React.ReactElement<any>
    customFields?: Record<string, CustomWidget>
}

export const CustomizationContext: React.Context<{
    customFields: Record<string, CustomWidget>
}> = React.createContext({
    customFields: {}
})

/**
 *
 * @param props
 * @category Components
 */
export const View: FunctionComponent<ViewProps> = props => {
    const { debugMode, widgets, skipWidgetTypes, card, customSpinner, customWidgets, customLayout, customFields } = props
    let layout: React.ReactNode = null
    const fileUploadPopup = useSelector((state: Store) => state.view.popupData?.type === 'file-upload')
    if (customLayout) {
        layout = (
            <props.customLayout
                customSpinner={customSpinner}
                widgets={widgets}
                customWidgets={customWidgets}
                card={card}
                skipWidgetTypes={skipWidgetTypes}
            />
        )
    } else {
        layout = (
            <DashboardLayout
                customSpinner={customSpinner}
                widgets={widgets}
                customWidgets={customWidgets}
                card={card}
                skipWidgetTypes={skipWidgetTypes}
            />
        )
    }

    return (
        <CustomizationContext.Provider value={{ customFields: customFields }}>
            {debugMode && <ViewInfoLabel />}
            {fileUploadPopup && <FileUploadPopup />}
            {layout}
            {debugMode && widgets.filter(i => PopupWidgetTypes.includes(i.type)).map(i => <DebugPanel key={i.name} widgetMeta={i} />)}
        </CustomizationContext.Provider>
    )
}

function mapStateToProps(store: Store) {
    return {
        debugMode: store.session.debugMode,
        widgets: store.view.widgets
    }
}

/**
 * @category Components
 */
const ConnectedView = connect(mapStateToProps)(View)

export default ConnectedView
