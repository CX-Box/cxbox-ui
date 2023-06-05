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
import { WidgetListField } from '../../interfaces/widget'
import { FieldType } from '../../interfaces/view'

// TODO MY Реализация взята из компонента, нужно узнать зачем multivalueHover нужен и можно ли его убрать
function normalizeFieldTypes<T extends WidgetListField>(fields: T[]): T[] {
    return fields.map(item => {
        return item.type === FieldType.multivalue ? { ...item, type: FieldType.multivalueHover } : item
    })
}

export function useFieldNormalization<T extends WidgetListField>(fields: T[]): T[] {
    return useMemo(() => normalizeFieldTypes(fields).filter(item => item.type !== FieldType.hidden && !item.hidden), [fields])
}
