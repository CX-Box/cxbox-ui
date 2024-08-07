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
import { concat, filter, mergeMap, of } from 'rxjs'
import { bcChangeCursors, bcFetchDataRequest, bcFetchRowMeta, bcSelectRecord } from '../../actions'
import { getBcChildren } from '../../utils'

export const bcSelectRecordEpic: CXBoxEpic = (action$, store$) =>
    action$.pipe(
        filter(bcSelectRecord.match),
        mergeMap(action => {
            const { bcName, cursor } = action.payload
            const widgets = store$.value.view.widgets
            const bcMap = store$.value.screen.bo.bc
            const fetchChildrenBcData = Object.entries(getBcChildren(bcName, widgets, bcMap)).map(entry => {
                const [childBcName, widgetNames] = entry
                return bcFetchDataRequest({
                    bcName: childBcName,
                    widgetName: widgetNames[0],
                    ignorePageLimit: action.payload.ignoreChildrenPageLimit,
                    keepDelta: action.payload.keepDelta
                })
            })
            return concat(
                of(bcChangeCursors({ cursorsMap: { [bcName]: cursor }, keepDelta: action.payload.keepDelta })),
                of(bcFetchRowMeta({ widgetName: '', bcName })),
                fetchChildrenBcData
            )
        })
    )
