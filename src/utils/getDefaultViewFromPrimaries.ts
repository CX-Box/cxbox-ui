import { ViewMetaResponse } from '../interfaces'

export const getDefaultViewFromPrimaries = (primaries: string[] | null, views: ViewMetaResponse[]) => {
    if (!primaries) return null

    let primaryView: ViewMetaResponse | null = null

    for (const primaryViewName of primaries) {
        if (primaryView !== null) {
            break
        }

        primaryView = views.find(view => view.name === primaryViewName) ?? null
    }

    return primaryView
}
