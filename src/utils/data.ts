import { DataValue } from '@cxbox-ui/schema'
import { RowMeta } from '../interfaces'

export const removeDisabledFieldsMutate = <Changes extends { [p: string]: DataValue }>(changes: Changes, rowMeta: RowMeta | undefined) => {
    // there is no row meta when parent bc custom operation's postaction triggers autosave, because custom operation call bcForceUpdate
    if (rowMeta) {
        Object.keys(changes).forEach(key => {
            const rowMetaOfDisabledField = rowMeta.fields.find(field => field.key === key && field.disabled)

            if (rowMetaOfDisabledField) {
                delete changes[key]

                if (rowMetaOfDisabledField.currentValue !== undefined) {
                    console.error('Changes to disabled fields are not taken into account when sending')
                }
            }
        })
    }

    return changes
}

export const removeDisabledFields = <Changes extends { [p: string]: DataValue }>(
    changes: Changes | undefined,
    rowMeta: RowMeta | undefined
) => {
    return removeDisabledFieldsMutate({ ...changes }, rowMeta)
}
