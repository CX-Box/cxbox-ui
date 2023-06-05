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
import { CustomWidgetDescriptor, isCustomWidget, PopupWidgetTypes, WidgetMeta, WidgetMetaAny } from '../interfaces/widget'

/**
 * Return component instance based on type specified in widget meta
 *
 * @param widgetMeta Meta configuration for widget
 * @param customWidgets Dictionary where key is a widget type and value is a component that should be rendered
 */
export function getWidgetComponent(
    widgetMeta: WidgetMeta | WidgetMetaAny,
    customWidgets: Record<string, CustomWidgetDescriptor>
): JSX.Element {
    const customWidget = customWidgets[widgetMeta.type]

    if (isCustomWidget(customWidget)) {
        const CustomWidgetComponent = customWidget
        return <CustomWidgetComponent meta={widgetMeta} />
    }

    const DescriptorComponent = customWidget.component
    return <DescriptorComponent meta={widgetMeta} />
}

export function skipCardWrap(meta: WidgetMeta, customWidget: CustomWidgetDescriptor) {
    const isEmptyCustomWidgetCard = customWidget && !isCustomWidget(customWidget) && customWidget.card === null
    const isPopupWidget = PopupWidgetTypes.includes(meta.type)

    return isPopupWidget || isEmptyCustomWidgetCard
}

export function getCardWrap(meta: WidgetMeta, customWidget: CustomWidgetDescriptor, defaultCard?: (props: any) => React.ReactElement<any>) {
    return customWidget && !isCustomWidget(customWidget) && customWidget.card ? customWidget.card : defaultCard
}
