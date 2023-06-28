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

import { Route, RouteType } from '../interfaces'
import { ActionReducerMapBuilder } from '@reduxjs/toolkit'
import { loginDone, changeLocation } from '../actions'

/**
 * Global instance
 *
 * @category Utils
 */
// export const historyObj = createHashHistory()
//
// /**
//  * TODO
//  *
//  * @param href
//  * @category Utils
//  */
// export function changeLocation(href: string) {
//     historyObj.push(href)
// }

/**
 * TODO
 */

export const initialRouterState: Route = { type: RouteType.default, path: '/', params: null, screenName: null }

/**
 * Router reducer
 *
 * Stores information about currently active route
 */
export const routerReducerBuilder = (builder: ActionReducerMapBuilder<Route>) =>
    builder
        .addCase(loginDone, (state, action) => {
            //TODO: implement parse location of history object
        })
        .addCase(changeLocation, (state, action) => {
            const { rawLocation, location } = action.payload
            if (rawLocation !== null) {
                //TODO: implement
            }
            if (location !== null) {
                state = location
            }
        })

// {
//     switch (action.type) {
//         case types.loginDone:
//             return parseLocation(historyObj?.location)
//         case types.changeLocation:
//             const rawLocation = action.payload.rawLocation
//             if (rawLocation != null) {
//                 const newState = parseLocation(parsePath(rawLocation))
//                 return newState
//             }
//             const parsedLocation = action.payload.location
//             if (parsedLocation != null) {
//                 return parsedLocation
//             }
//             throw new Error('location reducer: action.payload.rawLocation == null & action.payload.location == null')
//         default:
//             return state
//     }
// }
