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

import React from 'react'
import { Row, Col } from 'antd'
import { CustomWidgetDescriptor, WidgetMeta } from '../../../interfaces/widget'
import Widget from '../../Widget/Widget'
import WidgetErrorBoundary from '../../WidgetErrorBoundary/WidgetErrorBoundary'

export interface DashboardLayoutProps {
    widgets: WidgetMeta[]
    customWidgets?: Record<string, CustomWidgetDescriptor>
    skipWidgetTypes?: string[]
    customSpinner?: (props: any) => React.ReactElement<any>
    card?: (props: any) => React.ReactElement<any>
}

/**
 * TODO
 *
 * @param props
 * @category Components
 */
export function DashboardLayout(props: DashboardLayoutProps) {
    const widgetsByRow = React.useMemo(() => {
        return groupByRow(props.widgets, props.skipWidgetTypes || [])
    }, [props.widgets, props.skipWidgetTypes])
    return (
        <React.Fragment>
            {Object.values(widgetsByRow).map((row, rowIndex) => (
                <Row key={rowIndex}>
                    {row.map((widget, colIndex) => (
                        <Col key={colIndex} span={24}>
                            <WidgetErrorBoundary meta={widget}>
                                <Widget
                                    meta={widget}
                                    card={props.card}
                                    customWidgets={props.customWidgets}
                                    customSpinner={props.customSpinner}
                                />
                            </WidgetErrorBoundary>
                        </Col>
                    ))}
                </Row>
            ))}
        </React.Fragment>
    )
}

/**
 * TODO
 *
 * @param widgets
 * @param skipWidgetTypes
 */
function groupByRow(widgets: WidgetMeta[], skipWidgetTypes: string[]) {
    const byRow: Record<string, WidgetMeta[]> = {}
    widgets
        .filter(item => {
            return !skipWidgetTypes.includes(item.type)
        })
        .forEach(item => {
            if (!byRow[item.position]) {
                byRow[item.position] = []
            }
            byRow[item.position].push(item)
        })
    return byRow
}
/**
 * @category Components
 */
export const MemoizedDashboard = React.memo(DashboardLayout)

export default MemoizedDashboard
