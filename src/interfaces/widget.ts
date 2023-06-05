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

import { WidgetShowCondition, WidgetTypes, WidgetOptions, WidgetFormField, WidgetListField, WidgetInfoField } from '@cxbox-ui/schema'
import { ComponentType } from 'react'
export type {
    WidgetShowCondition,
    WidgetTypes,
    WidgetOptions,
    LayoutRow,
    LayoutCol,
    WidgetOperations,
    TableOperations,
    PositionTypes,
    WidgetTableHierarchy,
    WidgetFieldBase,
    WidgetListFieldBase,
    WidgetFormFieldBase,
    AllWidgetTypeFieldBase,
    NumberFieldMeta,
    DateFieldMeta,
    CheckboxFieldMeta,
    DateTimeFieldMeta,
    DateTimeWithSecondsFieldMeta,
    DictionaryFieldMeta,
    TextFieldMeta,
    InputFieldMeta,
    MultiFieldMeta,
    MultivalueFieldMeta,
    PickListFieldMeta,
    InlinePickListFieldMeta,
    FileUploadFieldMeta,
    WidgetFormField,
    WidgetListField,
    HiddenFieldMeta,
    RadioButtonFieldMeta,
    WidgetField,
    WidgetInfoField
} from '@cxbox-ui/schema'

/**
 * Different widget types that are considered `tables` in nature for purposes of applying some shared features.
 * For example, autofocus on missing required field should work for tables but not forms.
 *
 * TODO: Make extension point
 *
 * @category Components
 */
export const TableLikeWidgetTypes = [
    WidgetTypes.List,
    WidgetTypes.DataGrid,
    WidgetTypes.AssocListPopup,
    WidgetTypes.PickListPopup,
    WidgetTypes.FlatTree,
    WidgetTypes.FlatTreePopup
] as const

/**
 * Widgets that are considered `popups` and usually excluded from widgets layout grid
 */
export const PopupWidgetTypes: string[] = [WidgetTypes.PickListPopup, WidgetTypes.AssocListPopup, WidgetTypes.FlatTreePopup]

/**
 * All widget types that display table-like data.ts
 */
type TableLikeWidgetType = (typeof TableLikeWidgetTypes)[number]

export interface WidgetInfoOptions {
    fieldBorderBottom?: boolean
    footer?: string
}

export interface WidgetMeta {
    name: string
    type: WidgetTypes | string // TODO: Как учитывать типы клиентских виджетов кроме string?
    title: string // отображаемое название,
    bcName: string
    /**
     * Business components ancestors hierarchy
     *
     * TODO: Will be mandatory (but nullable) in 2.0.0
     *
     * It is declared in `WidgetDTO` of Cxbox API, can be null for widgets without
     * business component (headers, navigation tabs, etc.)
     */
    url?: string | null
    position: number
    limit?: number
    gridWidth: number // 1-24
    fields: unknown[]
    options?: WidgetOptions
    showCondition?: WidgetShowCondition
    description?: string // description for documentation
}

/**
 * Description of the list of fields of block type.
 *
 * @deprecated Used to create a block grouping of fields
 */
export interface WidgetFieldBlock<T> {
    /**
     * Block ID
     */
    blockId: number
    /**
     * Name of the block
     */
    name: string
    /**
     * Fields contained in the block
     */
    fields: T[]
    /**
     * @deprecated TODO: Remove in 2.0.0, used to denote a new row in old layout system for forms
     */
    newRow?: boolean
    /**
     * @deprecated TODO: Remove in 2.0.0, used to ...
     */
    break?: boolean
}

export type WidgetFieldsOrBlocks<T> = Array<T | WidgetFieldBlock<T>>

/**
 * Configuration for widgets dislaying form data.ts
 */
export interface WidgetFormMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifing widget type
     */
    type: WidgetTypes.Form
    /**
     * Descriptor for fields or block of fields on the form
     */
    fields: WidgetFieldsOrBlocks<WidgetFormField>
}

/**
 * Configuration for widgets displaying table-like data.ts
 */
export interface WidgetTableMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifing widget type
     */
    type: TableLikeWidgetType
    /**
     * Descriptor for table columns
     */
    fields: WidgetListField[]
}

/**
 * Configuration for widgets displaying read-only table data.ts
 */
export interface WidgetInfoMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifying widget type
     */
    type: WidgetTypes.Info
    /**
     * Descriptor for fields or block of fields on the form
     */
    fields: WidgetFieldsOrBlocks<WidgetInfoField>
    /**
     * Options for customizing widget
     */
    options?: WidgetOptions & WidgetInfoOptions
}

/**
 * Configuration for widgets displaying markdown text
 */
export interface WidgetTextMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifying widget type
     */
    type: WidgetTypes.Text
    /**
     * Text to display
     */
    description: string
    /**
     * Title text
     */
    descriptionTitle: string
}

/**
 * Options configuration for widgets displaying NavigationTabs
 */
export interface NavigationOptions extends WidgetOptions {
    /**
     * Level of menu
     */
    navigationLevel?: number
}

/**
 * Configuration for widgets displaying NavigationTabs
 */
export interface NavigationWidgetMeta extends WidgetMeta {
    /**
     * Unambiguous marker for JSON file specifying widget type
     */
    type: WidgetTypes.NavigationTabs | WidgetTypes.ViewNavigation
    /**
     * Options for customizing widget
     */
    options: NavigationOptions
}

/**
 * A widget configuration of any known type
 */
export type WidgetMetaAny = WidgetFormMeta | WidgetTableMeta | WidgetTextMeta | WidgetInfoMeta | NavigationWidgetMeta

/**
 * Component of custom widget
 *
 * @deprecated TODO: Remove in 2.0.0
 */
export type CustomWidget = ComponentType<any>

/**
 * Configuration of custom widget
 */
export interface CustomWidgetConfiguration {
    /**
     * Whether widget is popup
     */
    isPopup?: boolean
    /**
     * Component of custom widget
     */
    component: ComponentType<any>
    /**
     * Card of widget
     */
    card?: ComponentType<any> | null
}

export type CustomWidgetDescriptor = CustomWidget | CustomWidgetConfiguration
/**
 * Check if descriptor is just a widget, or it has additional data.ts
 */
export function isCustomWidget(descriptor: CustomWidgetDescriptor): descriptor is CustomWidget {
    return !!descriptor && !('component' in descriptor)
}

/**
 * Checks whether @param descriptor is an instance of `CustomWidgetConfiguration`
 *
 * @param descriptor custom widget descriptor
 */
export function isCustomWidgetConfiguration(descriptor: CustomWidgetDescriptor): descriptor is CustomWidgetConfiguration {
    return descriptor && 'component' in descriptor
}

/**
 * TODO
 *
 * @param item
 * @category Type Guards
 */
export function isWidgetFieldBlock(item: any): item is WidgetFieldBlock<any> {
    return !!item && 'blockId' in item
}

/**
 * Type of pagination, either page numbers or "Load More" button
 */
export enum PaginationMode {
    page = 'page',
    loadMore = 'loadMore'
}
