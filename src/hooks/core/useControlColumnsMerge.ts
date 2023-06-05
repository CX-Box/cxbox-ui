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

import { useMemo } from 'react'

export type ControlColumnsMergeProps<ColumnProps extends Record<string, any>> = {
    columns: ColumnProps[]
    controlColumns?: Array<{ column: ColumnProps; position: 'left' | 'right' }>
}

export function useControlColumnsMerge<ColumnProps>({ columns, controlColumns }: ControlColumnsMergeProps<ColumnProps>) {
    return useMemo(() => {
        const controlColumnsLeft: ColumnProps[] = []
        const controlColumnsRight: ColumnProps[] = []
        controlColumns?.map(item => {
            item.position === 'left' ? controlColumnsLeft.push(item.column) : controlColumnsRight.push(item.column)
        })
        return [...controlColumnsLeft, ...columns, ...controlColumnsRight]
    }, [columns, controlColumns])
}
