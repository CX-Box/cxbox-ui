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

import { Epic, types } from '../actions/actions'
import { Observable } from 'rxjs'
import exportState from '../utils/exportState'

const exportStateEpic: Epic = (action$, store) =>
    action$.ofType(types.exportState).switchMap(action => {
        exportState(store)
        return Observable.empty()
    })

export const utilsEpics = {
    exportStateEpic
}
