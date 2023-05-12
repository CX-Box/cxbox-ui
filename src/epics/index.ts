/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { utilsEpics } from './utils'
import { sessionEpics } from '../epics/session'
import { routerEpics } from '../epics/router'
import { screenEpics } from '../epics/screen'
import { viewEpics } from '../epics/view'
import { dataEpics } from '../epics/data'
import { combineEpics, Epic } from 'redux-observable'

export const coreEpics = {
    utilsEpics,
    routerEpics,
    sessionEpics,
    screenEpics,
    viewEpics,
    dataEpics
}

/**
 * @deprecated TODO: For backward compatibility; remove in 2.0.0
 */
export const legacyCoreEpics: Epic<any, any> = combineEpics(
    ...Object.values(coreEpics).map(epics => {
        return combineEpics(...Object.values(epics))
    })
)

export default coreEpics
