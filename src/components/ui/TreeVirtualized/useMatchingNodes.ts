

import React from 'react'
import { TreeNodeAscending } from '../../../interfaces/tree'

const initialExpanded: Record<string, boolean> = { '0': true }

/**
 * Filters `nodes` array with `searchPredicate` and calls `setExpandedNodes` with all ancestors of matching nodes
 *
 * @param nodes An array to filter
 * @param searchPredicate Filter condition
 * @param setExpandedNodes Callback to set ancestors
 * @returns A memoized array of matching nodes
 * @category Hooks
 */
export function useMatchingNodes<T extends TreeNodeAscending>(
    nodes: T[],
    searchPredicate: (item: T) => boolean,
    setExpandedNodes: React.Dispatch<React.SetStateAction<string[]>>
) {
    const { matchingNodes, ancestors } = React.useMemo(() => {
        return getMatchingNodes(nodes, searchPredicate)
    }, [nodes, searchPredicate])
    React.useEffect(() => {
        setExpandedNodes(ancestors)
    }, [ancestors, setExpandedNodes])
    return matchingNodes
}

/**
 * Filters `nodes` array with `searchPredicate` and forms an additional array with ancestors for each found node.
 *
 * @param nodes An array to filter
 * @param searchPredicate Filter condition
 * @category Utils
 */
export function getMatchingNodes<T extends TreeNodeAscending>(nodes: T[], searchPredicate: (item: T) => boolean) {
    if (!searchPredicate || !nodes) {
        return { matchingNodes: null, ancestors: Object.keys(initialExpanded) }
    }
    const found = nodes.filter(searchPredicate)
    const newExpandedNodes = { ...initialExpanded }
    found.forEach(item => {
        let parent = item.parent
        while (parent) {
            newExpandedNodes[parent.id] = true
            parent = parent.parent
        }
    })
    return { matchingNodes: found.map(item => item.id), ancestors: Object.keys(newExpandedNodes) }
}
