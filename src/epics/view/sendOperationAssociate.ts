

import { matchOperationRole } from '../../utils/operations'
import { OperationTypeCrud } from '../../interfaces/operation'
import { Store } from 'redux'
import { Epic, types, $do, ActionsMap } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'

/**
 * Opens a popup with {@link AssocListPopup | associate component}.
 *
 * @param action$ This epic will fire on {@link ActionPayloadTypes.sendOperation | sendOperation} action where
 * sendOperation role is matching {@link OperationTypeCrud.associate}
 * @param store Redux store instance
 * @returns {@link ActionPayloadTypes.showViewPopup | showViewPopup} for `${bcName}Assoc`
 * @category Epics
 */
export const sendOperationAssociate: Epic = (action$, store) =>
    action$
        .ofType(types.sendOperation)
        .filter(action => matchOperationRole(OperationTypeCrud.associate, action.payload, store.getState()))
        .map(action => {
            return sendOperationAssociateImpl(action, store)
        })

/**
 * Default implementation for `sendOperationAssociate` epic.
 *
 * Opens a popup with {@link AssocListPopup | associate component}.
 *
 * @param action This epic will fire on {@link ActionPayloadTypes.sendOperation | userDrillDown} action
 * @param store Redux store instance
 * @returns {@link ActionPayloadTypes.showViewPopup | showViewPopup} for `${bcName}Assoc`
 * @category Epics
 */
export function sendOperationAssociateImpl(action: ActionsMap['sendOperation'], store: Store<CoreStore>) {
    return $do.showViewPopup({
        // TODO: 2.0.0 bcKey and bcName will be removed in favor `widgetName`
        bcName: action.payload.bcKey ? `${action.payload.bcKey}` : `${action.payload.bcName}Assoc`,
        calleeBCName: action.payload.bcName,
        active: true,
        calleeWidgetName: action.payload.widgetName
    })
}
