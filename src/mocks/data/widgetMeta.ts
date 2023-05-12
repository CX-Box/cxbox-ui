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

/**
 * Моки меты виджетов
 */
import { WidgetTypes, WidgetMeta } from '../../interfaces/widget'
import { FieldType } from '../../interfaces/view'

export const baseWidgetMeta: WidgetMeta = {
    name: 'mockWidget',
    bcName: 'selfEsteemList',
    position: 0,
    gridWidth: 0,
    title: null,
    type: WidgetTypes.Form,
    fields: [
        {
            blockId: '1',
            fields: [
                {
                    key: 'subProcessInfo',
                    label: 'Подпроцесс',
                    type: 'multivalue'
                }
            ]
        }
    ]
}

/**
 * Виджет-иерархия, на первом уровне риски, на втором меры, на третьем последствия
 */
export const hierarchyWidgetMeta: any = {
    id: '20000',
    name: '20000',
    bcName: 'selfEsteemRisk',
    position: 0,
    gridWidth: 0,
    title: 'Иерархия',
    type: WidgetTypes.AssocListPopup,
    options: {
        hierarchyGroupSelection: false,
        hierarchyTraverse: true,
        hierarchyRadio: true,
        hierarchy: [
            {
                bcName: 'riskResponse',
                assocValueKey: 'name',
                radio: true,
                fields: [
                    {
                        key: 'name',
                        title: 'Название',
                        type: FieldType.input
                    }
                ]
            },
            {
                bcName: 'riskResponseMainConsequence',
                assocValueKey: 'name',
                fields: [
                    {
                        key: 'name',
                        title: 'Название',
                        type: FieldType.input
                    }
                ]
            }
        ]
    },
    fields: [
        {
            key: 'name',
            title: 'Название',
            type: FieldType.input
        },
        {
            key: 'riskZone',
            title: 'Зоны риска',
            type: FieldType.multifield,
            fields: [
                {
                    key: 'presentRiskZoneCd',
                    title: 'Зона присущего риска',
                    type: FieldType.dictionary,
                    bgColor: '#E6E6E6'
                },
                {
                    key: 'residualRiskZoneCd',
                    title: 'Зона остаточного риска',
                    type: FieldType.dictionary,
                    bgColor: '#E6E6E6'
                }
            ]
        }
    ]
}

export const hierarchyWidgetProps: any = {
    // TableWidgetProps
    cursor: '9',
    loading: false,
    route: {},
    data: [],
    onDrillDown: undefined,
    onExpand: undefined,
    meta: hierarchyWidgetMeta,
    rowMetaFields: []
}
