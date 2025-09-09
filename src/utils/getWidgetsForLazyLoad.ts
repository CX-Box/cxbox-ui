import { EpicDependencyInjection, PopupWidgetTypes, WidgetMeta } from '../interfaces'

export const getWidgetsForLazyLoad = (
    widgets: WidgetMeta[],
    getInternalWidgets: EpicDependencyInjection['utils']['getInternalWidgets']
) => {
    const popupWidgets: WidgetMeta[] = []
    const mainWidgets: WidgetMeta[] = []

    for (const widget of widgets) {
        if (PopupWidgetTypes.includes(widget.type)) {
            popupWidgets.push(widget)
        } else {
            mainWidgets.push(widget)
        }
    }

    const internalPopupWidgetsNames = getInternalWidgets?.(popupWidgets) || []
    const internalMainWidgetsNames = getInternalWidgets?.(mainWidgets) || []
    const internalNames = new Set([...internalPopupWidgetsNames, ...internalMainWidgetsNames])

    const externalPopupWidgets = popupWidgets.filter(widget => !internalNames.has(widget.name))
    const externalMainWidgets = mainWidgets.filter(widget => !internalNames.has(widget.name))

    const exclusionSet = new Set([...externalMainWidgets.map(widget => widget.name), ...internalMainWidgetsNames])

    const uniqueInternalPopupWidgetsNames = internalPopupWidgetsNames.filter(
        internalPopupWidgetName => !exclusionSet.has(internalPopupWidgetName)
    )

    return [...new Set([...externalPopupWidgets.map(widget => widget.name), ...uniqueInternalPopupWidgetsNames])]
}
