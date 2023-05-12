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
import { splitIntoTokens } from '../../../utils/strings'

interface SearchHighlightProps {
    source: string
    search: string | RegExp
    match?: (substring: string) => React.ReactNode
    notMatch?: (substring: string) => React.ReactNode
}

/**
 *
 * @param props
 * @category Components
 */
const SearchHighlight: React.FC<SearchHighlightProps> = props => {
    const tokens = splitIntoTokens(props.source, props.search)
    return (
        <>
            {tokens
                .filter(item => !!item)
                .map((item, index) => {
                    const isMatch = props.search instanceof RegExp ? props.search.test(item) : item === props.search
                    if (isMatch) {
                        return <React.Fragment key={index}>{props.match?.(item) || defaultHighlighter(item)}</React.Fragment>
                    }
                    return <React.Fragment key={index}>{props.notMatch?.(item) || item}</React.Fragment>
                })}
        </>
    )
}

/**
 * Default renderer for highlighting search results.
 *
 * Wraps an argument into `<b>` tag.
 *
 * @param value
 */
export const defaultHighlighter = (value: string) => <b>{value}</b>

/**
 * @category Components
 */
const MemoizedSearchHighlight = React.memo(SearchHighlight)

export default MemoizedSearchHighlight
