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
import { getEagerBcChildren, getWidgetsForLazyLoad } from '../../utils'

export const bcSelectRecordEpic: CXBoxEpic = (action$, state$, { utils }) =>
    action$.pipe(
        filter(bcSelectRecord.match),
        mergeMap(action => {
            const { bcName, cursor } = action.payload
            const widgets = state$.value.view.widgets
            const bcMap = state$.value.screen.bo.bc
            const lazyWidgetNames = getWidgetsForLazyLoad(state$.value.view.widgets, utils?.getInternalWidgets)
            const fetchChildrenBcData = Object.entries(getEagerBcChildren(bcName, widgets, bcMap, lazyWidgetNames, false)).map(entry => {
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
