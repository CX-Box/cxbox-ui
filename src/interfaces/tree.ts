

import { DataItem } from './data'
import { AssociatedItem } from './operation'

export interface BaseDataNode {
    /**
     * Uniquely identifies record
     */
    id: string
}

/**
 * Types for Tree-like structures (tree traversal, search, etc)
 */

/**
 * Base type for tree-like structures in flat array form
 */
export interface DataNode extends BaseDataNode {
    /**
     * String reference to a parent node
     */
    parentId: string
    /**
     * The depth of the node counting from the root of the tree
     */
    level?: number
}

/**
 * Cxbox-specific data item that classifies as tree node
 */
export type DataItemNode = DataNode & DataItem

/**
 * Base type for tree nodes that keep references to parent nodes
 */
export interface TreeNodeAscending extends DataNode {
    /**
     * Reference to parent node
     */
    parent: TreeNodeAscending
}

/**
 * Base type for tree nodes that keep references to children nodes
 */
export interface TreeNodeDescending extends BaseDataNode {
    /**
     * An array of references to children nodes
     */
    children?: TreeNodeDescending[]
}

/**
 * Base type for tree nodes that keep references both to the parent and children nodes
 */
export interface TreeNodeBidirectional extends DataNode {
    /**
     * Reference to the parent
     */
    parent: TreeNodeBidirectional
    /**
     * An array of children
     */
    children?: TreeNodeBidirectional[]
}

export type TreeAssociatedRecord = DataNode & AssociatedItem

/**
 * Tree node that keeps a status if it is expanded (i.e. children also should be displayed)
 */
export type TreeNodeCollapsable<T extends TreeNodeBidirectional = TreeNodeBidirectional> = T & { _expanded: boolean }
