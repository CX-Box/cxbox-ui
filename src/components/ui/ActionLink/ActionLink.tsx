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
import cn from 'classnames'
import * as styles from './ActionLink.less'

export interface IActionLinkProps {
    className?: string
    children?: React.ReactNode
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

/**
 *
 * @param props
 * @category Components
 */
const ActionLink: React.FC<IActionLinkProps> = ({ className, children, onClick }) => {
    const handleClick = React.useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault()
            e.stopPropagation()
            if (onClick) {
                onClick(e)
            }
        },
        [onClick]
    )
    return (
        <a className={cn(styles.ActionLink, className)} onClick={handleClick}>
            {children}
        </a>
    )
}

/**
 * @category Components
 */
const MemoizedActionLink = React.memo(ActionLink)

export default MemoizedActionLink
