

import React from 'react'
import { Tabs } from 'antd'
import styles from './NavigationTabs.less'
import { useViewTabs } from '../../../hooks'
import { historyObj } from '../../../reducers/router'

interface NavigationTabsProps {
    navigationLevel: number
}

function NavigationTabs({ navigationLevel }: NavigationTabsProps) {
    const tabs = useViewTabs(navigationLevel)
    const handleChange = (key: string) => {
        historyObj.push(key)
    }

    return (
        <nav className={styles.container}>
            <Tabs activeKey={tabs?.find(item => item.selected)?.url} tabBarGutter={24} size="large" onChange={handleChange}>
                {tabs?.map(item => (
                    <Tabs.TabPane key={item.url} tab={<span className={styles.item}>{item.title}</span>} />
                ))}
            </Tabs>
        </nav>
    )
}

export default React.memo(NavigationTabs)
