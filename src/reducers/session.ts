

import { AnyAction, types } from '../actions/actions'
import { Session } from '../interfaces/session'

export const initialState: Session = {
    devPanelEnabled: false,
    activeRole: null,
    roles: null,
    firstName: '',
    lastName: '',
    login: '',
    debugMode: false,
    exportStateEnabled: false,
    active: false,
    loginSpin: false,
    errorMsg: null,
    screens: [],
    pendingRequests: []
}

/**
 * Session reducer
 *
 * Stores information about currently active session and data that should be persistent during all period of
 * user interaction with application.
 *
 * @param state Session branch of Redux store
 * @param action Redux action
 * @param store Store instance for read-only access of different branches of Redux store
 */
export function session(state = initialState, action: AnyAction): Session {
    switch (action.type) {
        case types.login: {
            return { ...state, loginSpin: true, errorMsg: null }
        }
        case types.loginDone: {
            const loginResponse = action.payload
            return {
                ...state,
                devPanelEnabled: loginResponse.devPanelEnabled,
                activeRole: loginResponse.activeRole,
                roles: loginResponse.roles,
                firstName: loginResponse.firstName,
                lastName: loginResponse.lastName,
                login: loginResponse.login,
                loginSpin: false,
                active: true,
                screens: loginResponse.screens || []
            }
        }
        case types.loginFail: {
            return { ...state, loginSpin: false, errorMsg: action.payload.errorMsg }
        }
        case types.switchDebugMode: {
            return { ...state, debugMode: action.payload }
        }
        case types.addPendingRequest: {
            return { ...state, pendingRequests: [...state.pendingRequests, action.payload.request] }
        }
        case types.removePendingRequest: {
            return {
                ...state,
                pendingRequests: state.pendingRequests.filter(item => item.requestId !== action.payload.requestId)
            }
        }
        default:
            return state
    }
}

export default session
