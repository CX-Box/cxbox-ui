import { ViewMetaResponse } from '../interfaces'

export const getDefaultViewForPrimary = (primary: string, views: ViewMetaResponse[]) => {
    if (!primary) return null

    return views.find(item => item.name === primary) ?? null
}
