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

import { loginEpic } from './session/loginDone'
import { refreshMetaEpic } from './session/refreshMeta'
import { loginByAnotherRoleEpic } from './session/loginByAnotherRole'
import { switchRoleEpic } from './session/switchRole'
import { refreshMetaAndReloadPage } from './session/refreshMetaAndReloadPage'

export const sessionEpics = {
    loginByAnotherRoleEpic,
    refreshMetaEpic,
    refreshMetaAndReloadPage,
    switchRoleEpic,
    loginEpic
}
