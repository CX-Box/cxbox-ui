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

import { ApplicationErrorType, BusinessError, SystemError } from '../../../interfaces/view'
import { shallow } from 'enzyme'
import * as React from 'react'
import { ErrorPopup } from './ErrorPopup'

describe('ErrorPopup test', () => {
    const defProps = {
        exportState: jest.fn(),
        exportStateEnabled: false
    }
    const systemErrorWithError: SystemError = {
        type: ApplicationErrorType.SystemError,
        details: 'System error',
        error: {
            name: 'error name',
            message: 'error message',
            response: {
                data: null,
                status: 500,
                statusText: 'Internal server error',
                headers: {},
                config: {
                    url: '//qwe/qeqwe/qweqw'
                }
            },
            config: {},
            isAxiosError: false
        }
    }

    const systemErrorWithoutError: SystemError = {
        type: ApplicationErrorType.SystemError,
        details: 'System error'
    }
    const businessError: BusinessError = {
        type: ApplicationErrorType.BusinessError,
        message: 'Business error'
    }
    it('should display business error', () => {
        const wrapper = shallow(<ErrorPopup error={businessError} {...defProps} />)
        expect(wrapper.find('FormItem').findWhere(i => i.text() === businessError.message).length).toEqual(1)
    })
    it('should display system error with axios error', () => {
        const wrapper = shallow(<ErrorPopup error={systemErrorWithError} {...defProps} />)
        expect(wrapper.find('textarea').length).toEqual(1)
        expect(wrapper.find('Button').length).toEqual(1)
    })
    it('should display system error without axios error', () => {
        const wrapper = shallow(<ErrorPopup error={systemErrorWithoutError} {...defProps} />)
        expect(wrapper.find('textarea').length).toEqual(0)
        expect(wrapper.find('Button').length).toEqual(0)
    })
    it('should display "export info for developers" button', () => {
        const wrapper = shallow(<ErrorPopup error={systemErrorWithoutError} {...defProps} exportStateEnabled={true} />)
        expect(wrapper.find('textarea').length).toEqual(0)
        const btn = wrapper.find('Button')
        expect(btn.length).toEqual(1)
        btn.simulate('click')
        expect(defProps.exportState).toHaveBeenCalled()
    })
})
