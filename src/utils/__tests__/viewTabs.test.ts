
import { getViewTabs, getReferencedView } from '../viewTabs'
import { ViewNavigationGroup } from '../../interfaces/navigation'
import * as navigationSample from './__mocks__/navigation.json'
import * as navigationFlatSample from './__mocks__/navigationFlat.json'

const sample = navigationSample.menu
const sampleFlat = navigationFlatSample.menu

describe('useNavigation helper', () => {
    it('should form 1 level menu', () => {
        expect(getViewTabs(sample, 1)).toMatchObject([
            { viewName: 'viewA' },
            { viewName: 'viewB2', title: 'categoryB' },
            { viewName: 'viewC_1_2', title: 'categoryC' },
            { viewName: 'viewD1', title: 'categoryD' }
        ])
    })
    it('should form 2 level menu', () => {
        expect(getViewTabs(sample, 2, 'viewB1')).toMatchObject([{ viewName: 'viewB1' }, { viewName: 'viewB2' }])
        expect(getViewTabs(sample, 2, 'viewB2')).toMatchObject([{ viewName: 'viewB1' }, { viewName: 'viewB2' }])
        expect(getViewTabs(sample, 2, 'viewC_1_2')).toMatchObject([{ viewName: 'viewC_2_2' }, { viewName: 'viewC_1_2' }])
    })
    it('should form 3 level menu', () => {
        expect(getViewTabs(sample, 3, 'viewC_2_1')).toMatchObject([{ viewName: 'viewC_2_1' }, { viewName: 'viewC_2_2' }])
    })
    it('should form 4 level menu', () => {
        expect(getViewTabs(sample, 4, 'viewD1')).toMatchObject([{ viewName: 'viewD1' }, { viewName: 'viewD2' }])
    })
    it('should work with flat navigation', () => {
        expect(getViewTabs(sampleFlat, 1, 'banklist')).toMatchObject([{ viewName: 'banklist' }, { viewName: 'bankcard' }])
    })
    it('should not break when requesting non existing tab level', () => {
        expect(getViewTabs(sampleFlat, 2, 'twilightSparkle')).toMatchObject([])
    })

    it('does not crash for missing arguments', () => {
        expect(getViewTabs(null, 1).length).toBe(0)
        expect(() => getViewTabs(sample, 2, null)).toThrowError('activeView is required for navigation level greater than 1')
    })
})

describe('getReferencedView', () => {
    it('should return default category view when specified', () => {
        expect(getReferencedView(sample[1])).toMatch((sample[1] as ViewNavigationGroup).defaultView)
        expect(getReferencedView((sample[2] as ViewNavigationGroup).child[0])).toMatch(
            ((sample[2] as ViewNavigationGroup).child[0] as ViewNavigationGroup).defaultView
        )
    })
    it('should return first available view when not specified', () => {
        expect(getReferencedView(sample[0])).toMatch('viewA')
        expect(getReferencedView(sample[2])).toMatch('viewC_1_2')
    })
})
