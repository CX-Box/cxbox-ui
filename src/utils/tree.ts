

/**
 * This module contains utilities for tree-like structures
 */

import { DataNode, TreeNodeBidirectional, TreeNodeDescending } from '../interfaces/tree'

/**
 * Assigns for each element:
 *
 * - `parent` property, which is a reference to parent mode found through `parentId` match.
 * - `children` property, which is an array of references to child nodes.
 *
 * `parentId`: '0' considered a root pseudo-node
 *
 * Orphaned records will be excluded from result and throw a console warning.
 *
 * @param flat Flat array representation of tree structure
 * @returns New array
 */
export function assignTreeLinks<T extends DataNode>(flat: T[]) {
    const result = flat.map(item => ({ ...item })) as Array<T & TreeNodeBidirectional>
    const map: Record<string, number> = {}
    const orphans: string[] = []
    result.forEach(item => {
        if (!item.parentId || item.parentId === '0') {
            return
        }
        let parentIndex = map[item.parentId]
        if (typeof parentIndex !== 'number') {
            parentIndex = flat.findIndex(el => el.id === item.parentId)
            map[item.parentId] = parentIndex
        }
        if (parentIndex === -1) {
            orphans.push(item.parentId)
            console.warn(
                `Record with [id] = ${item.id} has [parentId] = ${item.parentId}, but no matching` +
                    ' parent record exist. Check the service for this BC.'
            )
            return
        }
        item.parent = result[parentIndex]
        if (!result[parentIndex].children) {
            result[parentIndex].children = [item]
        } else {
            result[parentIndex].children.push(item)
        }
    })
    if (orphans.length) {
        return result.filter(item => !orphans.includes(item.parentId))
    }
    return result
}

/**
 * Recursively traverse through each node and their descendant to aggregate ids of all
 * descendant nodes into `result` array.
 *
 * @param nodes Nodes to start search from; their ids also will be part of the result
 * @param result An array of ids for found descendant nodes
 */
export function getDescendants(nodes: TreeNodeDescending[], result: string[]) {
    nodes.forEach(child => {
        result.push(child.id)
        if (child.children) {
            getDescendants(child.children, result)
        }
    })
}

/**
 * Returns array of matching nodes, their direct children and every ancestor node
 *
 * @param nodes An array to search
 * @param matchingNodes Ids of the nodes to match
 */
export function buildSearchResultTree<T extends TreeNodeBidirectional = TreeNodeBidirectional>(nodes: T[], matchingNodes: string[]) {
    const result: Record<string, boolean> = {}
    nodes.forEach(item => {
        if (!matchingNodes.includes(item.id)) {
            return
        }
        let parent = item.parent
        while (parent) {
            result[parent.id] = true
            parent = parent.parent
        }
        result[item.id] = true
        item.children?.forEach(child => {
            result[child.id] = true
        })
    })
    // todo: iterate through result directly
    return nodes.filter(item => result[item.id] === true)
}

/**
 * Presort items based on their `level` property: each parent is followed by its descendant.
 * Items with level `1` considered to be root-level items.
 *
 * Notice: not very performant and almost always wasted as Cxbox API mostly returns already
 * sorted data.
 *
 * @param data Unsorted data
 */
export function presort(data: TreeNodeBidirectional[]) {
    const result: string[] = []
    data.filter(item => item.level === 1).forEach(item => {
        result.push(item.id)
        if (item.children) {
            getDescendants(item.children, result)
        }
    })
    return result.map(id => data.find(match => match.id === id))
}
