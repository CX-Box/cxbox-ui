import { Store } from '../interfaces'

export const selectBcNameFromPopupData = (state: Store): string | undefined => {
    const { bcName, widgetName } = state.view.popupData ?? {}

    if (bcName) {
        return bcName
    }

    if (widgetName) {
        return state.view.widgets.find(widget => widget.name === widgetName)?.bcName
    }

    return undefined
}
