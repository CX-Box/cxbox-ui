

import { drillDown } from './router/drilldown'
import { selectScreenFail } from './router/selectScreenFail'
import { selectViewFail } from './router/selectViewFail'
import { changeLocation } from './router/changeLocation'
import { changeScreen } from './router/selectScreen'
import { changeView } from './router/selectView'
import { loginDone } from './router/loginDone'
import { handleRouter } from './router/handleRouter'
import { userDrillDown } from './router/userDrillDown'

export const routerEpics = {
    changeLocation,
    loginDone,
    changeScreen,
    changeView,
    drillDown,
    userDrillDown,
    handleRouter,
    selectScreenFail,
    selectViewFail
}
