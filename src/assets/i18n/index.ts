

import { Resource } from 'i18next'
import ru from './ru.json'
import en from './en.json'

/**
 * i18next text assets by language code
 */
type TextAssets = { [languageCode: string]: LanguageTextAssets }

/**
 * i18next text asset
 */
type LanguageTextAssets = { translation: Record<string, string> }

/**
 * Languages with built-in support
 */
const defaultResources: TextAssets = {
    en,
    ru
}

/**
 * Get text assets for all supported languages: built-in and custom resources are merged
 * with custom tokens having priority.
 *
 * Assets are i18next-compatible; all built-in tokens go to `translation` namespace, but client application
 * can also use other namespaces.
 *
 * @param customDictionary Dictionary with new languages or new tokens/overrides for existing ones
 * @returns Record<languageCode, textAssets>
 */
export function getTextAssets(customDictionary: Resource): TextAssets {
    const result = { ...defaultResources }
    if (!customDictionary) {
        return result
    }
    Object.keys(customDictionary).forEach(code => {
        const core = defaultResources[code]?.translation || {}
        const custom = customDictionary[code].translation as Record<string, string>
        result[code] = {
            translation: {
                ...core,
                ...custom
            }
        }
    })
    return result
}
