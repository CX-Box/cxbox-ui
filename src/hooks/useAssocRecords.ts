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
import { AssociatedItem } from '../interfaces/operation'
import { PendingDataItem } from '../interfaces/data'

const emptyData: any[] = []

/**
 * TODO
 *
 * @param data
 * @param pendingChanges
 * @param isRadio
 * @category Hooks
 */
export function useAssocRecords<T extends AssociatedItem>(
    data: T[],
    pendingChanges: Record<string, PendingDataItem>,
    isRadio?: boolean
): T[] {
    return React.useMemo(() => {
        let records = emptyData
        if (data) {
            records = data.filter(item => {
                if (pendingChanges?.[item.id]) {
                    return pendingChanges[item.id]._associate
                }

                if (isRadio && pendingChanges && Object.keys(pendingChanges).length) {
                    return false
                }

                return item?._associate
            })
        }
        return records
    }, [data, pendingChanges, isRadio])
}
