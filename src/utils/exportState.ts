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

import { Store } from 'redux'
import { Store as CoreStore } from '../interfaces/store'
import { ACTIONS_HISTORY } from './actionsHistory'
import html2canvas from 'html2canvas'

function download(state: any, type?: string, name?: string) {
    const blob = new Blob([state], { type: type ? type : 'octet/stream' })
    const href = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.download = name ? name : 'state.json'
    a.href = href
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(href)
    }, 0)
}

export default function exportState(store: Store<CoreStore>) {
    download(JSON.stringify({ payload: JSON.stringify(ACTIONS_HISTORY), preloadedState: JSON.stringify(store.getState()) }))
    html2canvas(document.body).then(r => r.toBlob(b => download(b, 'image/png', 'screen.png')))
}
