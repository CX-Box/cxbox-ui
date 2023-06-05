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

import { useDispatch, useSelector } from 'react-redux'
import { Store } from '../../interfaces/store'
import { useCallback } from 'react'
import { $do } from '../../actions/actions'
import { useBcProps, useWidgetProps } from './index'

export function useViewCell({ widgetName, isAllowEdit = false }: { widgetName: string; isAllowEdit?: boolean }) {
    const { bcName } = useWidgetProps(widgetName)
    const { cursor } = useBcProps({ bcName })
    const selectedCell = useSelector((store: Store) => store.view.selectedCell)

    const dispatch = useDispatch()

    const selectCell = useCallback(
        (rowId: string, fieldKey: string) => {
            dispatch($do.selectTableCellInit({ widgetName, rowId, fieldKey }))
        },
        [dispatch, widgetName]
    )

    const isEditModeForCell = useCallback(
        (fieldKey: string, dataItemId: string) => {
            return (
                isAllowEdit &&
                selectedCell &&
                fieldKey === selectedCell.fieldKey &&
                widgetName === selectedCell.widgetName &&
                dataItemId === selectedCell.rowId &&
                cursor === selectedCell.rowId
            )
        },
        [cursor, isAllowEdit, selectedCell, widgetName]
    )

    return {
        selectedCell,
        selectCell,
        isEditModeForCell
    }
}
