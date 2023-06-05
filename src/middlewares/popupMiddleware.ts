import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'
import { Store } from '../interfaces'
import { showViewPopup } from '../actions'

export const popupMiddleware: Middleware =
    ({ getState }: MiddlewareAPI<Dispatch, Store>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        if (showViewPopup.match(action)) {
            const state = getState()
            const bcName = action.payload.bcName
            const widgetValueKey = state.view.widgets.find(item => item.bcName === bcName)?.options?.displayedValueKey
            const assocValueKey = action.payload.assocValueKey ?? widgetValueKey
            return widgetValueKey ? next(showViewPopup({ ...action.payload, assocValueKey })) : next(action)
        }
        return next(action)
    }
