

import { AssociatedItem } from '../../../interfaces/operation'
import { BcFilter } from '../../../interfaces/filters'

/**
 * Function to memoize
 */
type SearchFunction = (...args: any[]) => Set<string>

/**
 * Hierarchy component helper for memoizing search results shared between all instances of component
 * (React hooks are instance-based and not applicable for recursion-based hierarchy)
 */
export class HierarchySearchCache {
    /**
     * Stores memoized Set<string> results based on widget name, data and filters
     */
    private cache: {
        [widgetName: string]: Map<AssociatedItem[], Map<BcFilter[], Set<string>>>
    } = {}

    /**
     * Empty `data` or `filters` arguments don't fire a function at all
     */
    private readonly emptyResult: Set<string> = new Set()

    /**
     * Search for a value through the instance cache based on widgetName, data and filters references.
     * If the value found return it, otherwise run the function and store result in cache.
     *
     * @param func Function to memoize
     * @param widgetName Widget name
     * @param data Data array (should keep persistant reference)
     * @param filters Filters array (should keep persistant reference)
     */
    getValue(func: SearchFunction, widgetName: string, data: AssociatedItem[], filters: BcFilter[]) {
        if (!data || !filters || !data?.length || !filters?.length) {
            return this.emptyResult
        }
        const cacheHit = this.cache[widgetName]?.get(data)?.get(filters)
        if (cacheHit) {
            return cacheHit
        }
        this.cache[widgetName] = this.cache[widgetName] ?? new Map()
        if (!this.cache[widgetName].has(data)) {
            this.cache[widgetName].set(data, new Map())
        }
        this.cache[widgetName].get(data).set(filters, func())
        return this.cache[widgetName].get(data).get(filters)
    }

    /**
     * Clear the cache for the specified widget name
     *
     * @param widgetName Widget name
     */
    clear(widgetName: string) {
        delete this.cache[widgetName]
    }
}
