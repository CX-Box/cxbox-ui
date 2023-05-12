

import React from 'react'
import NavigationTabs from '../../ui/NavigationTabs/NavigationTabs'
import { NavigationWidgetMeta } from '../../../interfaces/widget'

export interface NavigationTabsWidgetProps {
    meta: NavigationWidgetMeta
}

function NavigationTabsWidget({ meta }: NavigationTabsWidgetProps) {
    return <NavigationTabs navigationLevel={meta.options?.navigationLevel ?? 1} />
}

export default React.memo(NavigationTabsWidget)
