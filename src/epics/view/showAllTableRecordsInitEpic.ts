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
import { concat, filter, mergeMap, Observable, of } from 'rxjs'
import { bcChangeCursors, bcForceUpdate, changeLocation, showAllTableRecordsInit } from '../../actions'
import { AnyAction } from '@reduxjs/toolkit'
import { defaultBuildURL, defaultParseURL } from '../../utils'

export const showAllTableRecordsInitEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(showAllTableRecordsInit.match),
        mergeMap(action => {
            const resultObservables: Array<Observable<AnyAction>> = []

            const { bcName, cursor } = action.payload
            const state = state$.value
            const route = state.router

            resultObservables.push(of(bcChangeCursors({ cursorsMap: { [bcName]: null } })))

            const bcPath = route.bcPath.slice(0, route.bcPath.indexOf(`${bcName}/${cursor}`))
            const url = defaultBuildURL({ ...route, bcPath })

            resultObservables.push(of(bcForceUpdate({ bcName })))
            resultObservables.push(of(changeLocation({ location: defaultParseURL(new URL(url, window.location.origin)) })))

            return concat(...resultObservables)
        })
    )
