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

export { DrillDownType } from '@cxbox-ui/schema'

export interface Route {
    type: RouteType
    path: string
    search: string
    params: Record<string, unknown>
    screenName?: string
    viewName?: string
    bcPath?: string
}

export enum RouteType {
    screen = 'screen',
    default = 'default',
    router = 'router',
    invalid = 'invalid',
    unknown = 'unknown'
}
