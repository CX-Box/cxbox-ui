import { isWidgetFieldBlock, WidgetFieldsOrBlocks } from '../interfaces'

export function flattenWidgetFields<T>(fields: WidgetFieldsOrBlocks<T>) {
    const flatFields: T[] = []

    fields.forEach(item => {
        if (isWidgetFieldBlock(item)) {
            item.fields.forEach(field => flatFields.push(field))
        } else {
            flatFields.push(item)
        }
    })

    return flatFields
}
