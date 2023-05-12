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

import { CustomWidgetDescriptor, PopupWidgetTypes } from '../../interfaces/widget'
import extendPopupWidgetTypes from '../extendPopupWidgetTypes'

describe('extendPopupWidgetTypes', () => {
    it('should work', () => {
        const spy = jest.spyOn(Object.getPrototypeOf(PopupWidgetTypes), 'push')

        const presentType = PopupWidgetTypes[0]
        const customWidgets: Record<string, CustomWidgetDescriptor> = {
            type1: {
                component: (): any => null,
                isPopup: true
            },
            type2: {
                component: (): any => null
            },
            [presentType]: {
                component: (): any => null,
                isPopup: true
            }
        }
        extendPopupWidgetTypes(customWidgets)
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockRestore()
    })

    it('should not work', () => {
        const spy = jest.spyOn(Object, 'entries')
        extendPopupWidgetTypes(null)
        expect(spy).not.toHaveBeenCalled()
    })
})
