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

import { FieldType, MultivalueFieldMeta, PickListFieldMeta } from '@cxbox-ui/schema'

export function isMultivalueField(fieldType: FieldType) {
    const isPickList = fieldType === FieldType.pickList

    return [FieldType.multivalue, FieldType.multivalueHover].includes(fieldType) || isPickList
}

export function getPopupAssocKeys(fieldMeta: MultivalueFieldMeta | PickListFieldMeta) {
    const isPickList = fieldMeta.type === FieldType.pickList

    let currentFieldMeta
    let assocValueKey: string
    let associateFieldKey: string

    if (isPickList) {
        currentFieldMeta = fieldMeta as PickListFieldMeta

        assocValueKey = currentFieldMeta.pickMap[fieldMeta.key]
        associateFieldKey = currentFieldMeta.key
    }

    if (!isPickList) {
        currentFieldMeta = fieldMeta as MultivalueFieldMeta

        assocValueKey = currentFieldMeta.assocValueKey
        associateFieldKey = currentFieldMeta.associateFieldKey
    }

    return {
        assocValueKey,
        associateFieldKey
    }
}
