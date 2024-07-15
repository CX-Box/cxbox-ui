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
import { filter, mergeMap, of } from 'rxjs'
import { changeChildrenAssociationsSameBc, changeDataItems } from '../../actions'

export const changeChildrenAssociationsSameBcEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(changeChildrenAssociationsSameBc.match),
        mergeMap(action => {
            const state = state$.value
            const data = state.depthData[action.payload.depth]?.[action.payload.bcName] || []
            return of(
                changeDataItems({
                    bcName: action.payload.bcName,
                    cursors: data.map(item => item.id),
                    dataItems: data.map(item => ({
                        ...item,
                        _value: item[action.payload.assocValueKey],
                        _associate: action.payload.selected
                    }))
                })
            )
        })
    )
