

import { HierarchySearchCache } from './hierarchySearchCache'
import { FilterType } from '../../../interfaces/filters'

describe('hierarchySearchTest', () => {
    it('memoizes results', () => {
        const cache = new HierarchySearchCache()
        const memoizedFunction = jest.fn(() => expectedResult)
        const value = cache.getValue(memoizedFunction, 'test', data, filters)
        expect(value).toBe(expectedResult)
        expect(memoizedFunction).toBeCalledTimes(1)
        cache.getValue(memoizedFunction, 'test', data, filters)
        cache.getValue(memoizedFunction, 'test', data, filters)
        cache.getValue(memoizedFunction, 'test', data, filters)
        expect(memoizedFunction).toBeCalledTimes(1)
    })
    it('early returns for empty data or filters', () => {
        const cache = new HierarchySearchCache()
        const memoizedFunction = jest.fn(() => expectedResult)
        cache.getValue(memoizedFunction, 'test', null, null)
        cache.getValue(memoizedFunction, 'test', null, [])
        cache.getValue(memoizedFunction, 'test', [], null)
        cache.getValue(memoizedFunction, 'test', [], [])
        expect(memoizedFunction).toBeCalledTimes(0)
    })
    it('clears cache', () => {
        const cache = new HierarchySearchCache()
        const memoizedFunction = jest.fn(() => expectedResult)
        cache.getValue(memoizedFunction, 'test', data, filters)
        cache.clear('test')
        cache.getValue(memoizedFunction, 'test', data, filters)
        expect(memoizedFunction).toBeCalledTimes(2)
    })
})

const data = [{ id: '1', vstamp: 1, _associate: false }]
const filters = [{ type: FilterType.equals, fieldName: 'id', value: '1' }]
const expectedResult = new Set<string>()
