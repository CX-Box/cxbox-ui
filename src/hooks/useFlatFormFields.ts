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
import { isWidgetFieldBlock, WidgetFieldsOrBlocks } from '../interfaces/widget'

/**
 * Receive flat list of fields from array containing fields or field blocks.
 *
 * @template T Field type
 * @param fields Array of fields or field blocks
 * @category Hooks
 */
export function useFlatFormFields<T>(fields: WidgetFieldsOrBlocks<T>) {
    return React.useMemo(() => {
        const flatFields: T[] = []

        fields.forEach(item => {
            if (isWidgetFieldBlock(item)) {
                item.fields.forEach(field => flatFields.push(field))
            } else {
                flatFields.push(item)
            }
        })

        return flatFields
    }, [fields])
}
