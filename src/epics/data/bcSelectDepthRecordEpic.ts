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

import { concat, filter, mergeMap, of } from 'rxjs'
import { CXBoxEpic } from '../../interfaces'
import { bcChangeDepthCursor, bcFetchDataRequest, bcSelectDepthRecord } from '../../actions'

export const bcSelectDepthRecordEpic: CXBoxEpic = action$ =>
    action$.pipe(
        filter(bcSelectDepthRecord.match),
        mergeMap(action => {
            /**
             * Set a cursor when expanding a record in hierarchy widgets builded around single business components
             * and fetch the dataEpics.ts for children of expanded record.
             *
             * {@link ActionPayloadTypes.bcChangeDepthCursor | bcChangeDepthCursor} action is dispatched to set the cursor
             * for expanded record; only one expanded record is allowed per hierarchy depth level.
             *
             * {@link ActionPayloadTypes.bcFetchDataRequest | bcFetchDataRequest} action is dispatched to fetch children dataEpics.ts
             * for expanded record. `ignorePageLimit`` is set as there are no controls for navigating between dataEpics.ts pages
             * in nested levels of hierarchy so instead all records are fetched.
             *
             * TODO: There is no apparent reason why `widgetName` is empty; probably will be mandatory and replace `bcName` in 2.0.0.
             *
             * @deprecated Do not use; TODO: Will be removed in 2.0.0
             */
            const { bcName, cursor, depth } = action.payload
            return concat(
                of(bcChangeDepthCursor({ bcName, depth, cursor })),
                of(
                    bcFetchDataRequest({
                        bcName,
                        depth: depth + 1,
                        widgetName: '',
                        ignorePageLimit: true
                    })
                )
            )
        })
    )
