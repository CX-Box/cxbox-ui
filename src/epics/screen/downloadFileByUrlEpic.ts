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

import { downloadFileByUrl } from '../../actions'
import { CXBoxEpic } from '../../interfaces'
import { EMPTY, filter, mergeMap, tap } from 'rxjs'

export const downloadFileByUrlEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(downloadFileByUrl.match),
        tap(action => {
            const { url } = action.payload
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.style.display = 'none'
            document.body.appendChild(anchor)
            setTimeout(() => {
                anchor.click()
                document.body.removeChild(anchor)
            }, 100)
        }),
        mergeMap(() => EMPTY)
    )
