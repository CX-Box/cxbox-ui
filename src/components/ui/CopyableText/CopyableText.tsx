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

import React, { CSSProperties } from 'react'
import { Icon, Input } from 'antd'

interface CopyableTextProps {
    text: string
    className?: string
}

const CopyableText: React.FunctionComponent<CopyableTextProps> = props => {
    const { text, className } = props
    const textRef = React.useRef(null)
    const handleCopyDetails = React.useCallback(() => {
        textRef.current.select()
        document.execCommand('copy')
    }, [textRef])
    const inputStyle: CSSProperties = { width: 300 }
    return (
        <Input
            className={className}
            size="small"
            ref={textRef}
            value={text}
            style={inputStyle}
            addonAfter={<Icon type="copy" onClick={handleCopyDetails} />}
        />
    )
}

export default React.memo(CopyableText)
