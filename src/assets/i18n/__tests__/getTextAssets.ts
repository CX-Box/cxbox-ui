

import { getTextAssets } from '../index'

describe('getResources', () => {
    it('returns dictionary with built-in languages', () => {
        const dictionary = getTextAssets(null)
        expect(dictionary.en.translation['Apply']).toBe('Apply')
        expect(dictionary.ru.translation['Apply']).toBe('Применить')
    })

    it('allows new languages', () => {
        const dictionary = getTextAssets({
            dk: {
                translation: {
                    Apply: 'Ansøge'
                }
            }
        })
        expect(dictionary.en.translation['Apply']).toBe('Apply')
        expect(dictionary.dk.translation['Apply']).toBe('Ansøge')
    })

    it('allows new tokens for existing languages', () => {
        const dictionary = getTextAssets({
            en: {
                translation: {
                    'Some new button': 'Some New Button'
                }
            }
        })
        expect(dictionary.en.translation['Some new button']).toBe('Some New Button')
    })

    it('overrides existing tokens with custom ones', () => {
        const dictionary = getTextAssets({
            en: {
                translation: {
                    Apply: 'Send for apply'
                }
            }
        })
        expect(dictionary.en.translation['Apply']).toBe('Send for apply')
    })
})
