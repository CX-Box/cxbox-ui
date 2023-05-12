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

import { AnyAction, types } from '../actions/actions'
import { DepthDataState } from '../interfaces/data'

const initialState: DepthDataState = {}

/**
 * TODO
 */
export function depthData(state = initialState, action: AnyAction) {
    switch (action.type) {
        case types.bcFetchDataSuccess: {
            return !action.payload.depth || action.payload.depth < 2
                ? state
                : {
                      ...state,
                      [action.payload.depth]: {
                          ...state[action.payload.depth],
                          [action.payload.bcName]: action.payload.data
                      }
                  }
        }
        case types.selectView: {
            return initialState
        }
        default:
            return state
    }
}

export default depthData
