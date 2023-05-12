

import React from 'react'
import NavigationTabsWidget, { NavigationTabsWidgetProps } from '../NavigationTabsWidget/NavigationTabsWidget'

export type ViewNavigationWidgetProps = NavigationTabsWidgetProps

function ViewNavigationWidget(props: ViewNavigationWidgetProps) {
    return <NavigationTabsWidget {...props} />
}

export default React.memo(ViewNavigationWidget)
