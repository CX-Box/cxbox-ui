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

import i18n, { Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getTextAssets } from '../assets/i18n'

/**
 * TODO
 *
 * @param lang
 * @param customDictionary
 */
export function initLocale(lang: string, customDictionary: Resource) {
    i18n.use(initReactI18next).init({
        resources: getTextAssets(customDictionary),
        lng: lang,
        keySeparator: false,
        interpolation: {
            escapeValue: false
        }
    })
    return i18n
}
