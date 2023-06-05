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

import { PopupWidgetTypes, WidgetMeta, WidgetMetaAny } from '../../interfaces/widget'
import { useSelector } from 'react-redux'
import { Store } from '../../interfaces/store'
import { useBcProps, useDataProps } from './selectors'
import { checkShowCondition } from '../../utils/bc'

export function useShowCondition(widget: WidgetMeta | WidgetMetaAny) {
    const view = useSelector((state: Store) => state.view)
    const legacyPopupCheck = view.popupData.bcName === widget.bcName
    const newPopupCheck = view.popupData.widgetName ? view.popupData.widgetName === widget.name : legacyPopupCheck
    let showWidget = PopupWidgetTypes.includes(widget.type) ? newPopupCheck : true
    const { cursor: cursorForShowCondition } = useBcProps({ bcName: widget.showCondition?.bcName })
    const { data: dataForShowCondition } = useDataProps({ bcName: widget.showCondition?.bcName })

    if (!checkShowCondition(widget.showCondition, cursorForShowCondition, dataForShowCondition, view.pendingDataChanges)) {
        showWidget = false
    }

    return { showWidget, hideWidget: !showWidget }
}
