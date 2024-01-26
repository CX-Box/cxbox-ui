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

import { CXBoxEpic } from '../../interfaces'
import { filter, map } from 'rxjs'
import { addNotification, selectScreenFail } from '../../actions'

/**
 * Throws a error popup when attempting to navigate to a screen which is missing for current session
 *
 * @param action$ selectViewFail
 */
export const selectScreenFailEpic: CXBoxEpic = action$ =>
    action$.pipe(
        filter(selectScreenFail.match),
        map(action => {
            return addNotification({
                type: 'error',
                key: 'selectScreenFail',
                message: 'Screen is missing or unavailable for your role',
                options: {
                    messageOptions: { screenName: action.payload.screenName }
                },
                duration: 15
            })
        })
    )
