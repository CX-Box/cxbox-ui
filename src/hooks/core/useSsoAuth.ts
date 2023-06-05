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

import { useDispatch, useSelector } from 'react-redux'
import { Store } from '../../interfaces/store'
import { useEffect } from 'react'

export const SSO_AUTH = 'SSO_AUTH'

export function useSsoAuth<S extends Store>(defaultAuthType = SSO_AUTH) {
    const sessionActive = useSelector((state: S) => state.session.active)
    const logoutRequested = useSelector((state: S) => state.session.logout)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!sessionActive && !logoutRequested) {
            dispatch({ type: defaultAuthType })
        }
    }, [sessionActive, logoutRequested, dispatch, defaultAuthType])

    return { sessionActive }
}
