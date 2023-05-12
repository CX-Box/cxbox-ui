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
import { createLocation } from 'history'
import { historyObj } from '../../../reducers/router'

export interface LinkProps {
    children: React.ReactNode
    className: string
    href: string
}

/**
 *
 * @param props
 * @category Components
 */
export const Link: FunctionComponent<LinkProps> = props => {
    const { className, href, ...rest } = props
    return (
        <a className={className} href={historyObj.createHref(createLocation(href))} {...rest}>
            {props.children}
        </a>
    )
}

export default Link
