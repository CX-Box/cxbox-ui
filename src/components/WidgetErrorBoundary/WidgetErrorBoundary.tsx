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
import { WidgetMeta } from '../../interfaces/widget'
import DebugPanel from '../DebugPanel/DebugPanel'
import RefreshButton from './components/RefreshButton'
import styles from './WidgetErrorBoundary.less'

interface ErrorBoundaryProps {
    meta?: WidgetMeta
    msg?: React.ReactNode
    children?: React.ReactNode
}

export default class WidgetErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean; error?: Error }> {
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: undefined }
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error(error)
    }
    render() {
        if (this.state.hasError) {
            return (
                <>
                    {this.props.meta ? (
                        <>
                            <h1>
                                {this.props.meta.title} <RefreshButton />
                            </h1>
                            <DebugPanel widgetMeta={this.props.meta} />
                        </>
                    ) : null}
                    <div className={styles.stackContainer}>
                        {this.props.msg}
                        <h1 className={styles.errorMessage}>{this.state.error?.message}</h1>
                        <div className={styles.errorStack}>{this.state.error?.stack}</div>
                    </div>
                </>
            )
        }
        return this.props.children
    }
}
