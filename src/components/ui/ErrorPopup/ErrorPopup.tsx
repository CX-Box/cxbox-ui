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

import React, { FunctionComponent } from 'react'
import { Modal, Form, Collapse, Icon, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { ApplicationError, SystemError, BusinessError, ApplicationErrorType } from '../../../interfaces/view'
import cn from 'classnames'
import styles from './ErrorPopup.less'
import { Dispatch } from 'redux'
import { $do } from '../../../actions/actions'
import { connect } from 'react-redux'
import { Store } from '../../../interfaces/store'

export interface ErrorPopupOwnProps {
    className?: string
    title?: string
    error: ApplicationError
    onClose?: () => void
}

interface ErrorPopupProps extends ErrorPopupOwnProps {
    exportState: () => void
    exportStateEnabled: boolean
}

export const ErrorPopup: FunctionComponent<ErrorPopupProps> = props => {
    const errorRef = React.useRef(null)
    const systemError = props.error as SystemError
    const businessError = props.error as BusinessError

    const handleCopyDetails = React.useCallback(() => {
        errorRef.current.select()
        document.execCommand('copy')
    }, [errorRef])
    const { t } = useTranslation()
    const title = (
        <header className={styles.header}>
            <Icon className={styles.icon} type="exclamation-circle-o" />
            <span className={styles.title}>{props.title || t('Error')}</span>
        </header>
    )

    const isExportInfoShown =
        props.exportStateEnabled &&
        (props.error.type === ApplicationErrorType.SystemError || props.error.type === ApplicationErrorType.NetworkError)

    return (
        <Modal
            className={cn(styles.container, props.className)}
            title={title}
            visible
            centered
            destroyOnClose
            onCancel={props.onClose}
            footer={null}
            closeIcon={<Icon className="ant-modal-close-icon" data-test-error-popup-button-close={true} type="close" />}
            wrapProps={{
                'data-test-error-popup': true
            }}
        >
            <Form layout="vertical">
                <Form.Item data-test-error-popup-text={props.error.type !== ApplicationErrorType.SystemError ? true : undefined}>
                    {props.error.type === ApplicationErrorType.BusinessError && businessError.message}
                    {props.error.type === ApplicationErrorType.SystemError && t('System error has been occurred')}
                    {props.error.type === ApplicationErrorType.NetworkError && t('There is no connection to the server')}
                </Form.Item>
                {props.error.type === ApplicationErrorType.SystemError && (
                    <Form.Item label={t('Error code')}>
                        {systemError.code}
                        <Collapse bordered={false}>
                            <Collapse.Panel header={t('Details')} key="1">
                                <div>{systemError.details}</div>
                                {systemError?.error && (
                                    <>
                                        <Button className={styles.copyDetailsBtn} onClick={handleCopyDetails}>
                                            {t('Copy details to clipboard')}
                                        </Button>
                                        <textarea
                                            className={cn(styles.detailsArea)}
                                            data-test-error-popup-text={true}
                                            readOnly={true}
                                            ref={errorRef}
                                            value={JSON.stringify(systemError.error.response, undefined, 2)}
                                        />
                                    </>
                                )}
                            </Collapse.Panel>
                        </Collapse>
                    </Form.Item>
                )}
                {isExportInfoShown && (
                    <Form.Item>
                        <Button onClick={() => props.exportState()} type="link">
                            {t('Save info for developers')}
                        </Button>
                    </Form.Item>
                )}
            </Form>
            {props.children}
        </Modal>
    )
}

function mapStateToProps(state: Store) {
    return {
        exportStateEnabled: state.session.exportStateEnabled
    }
}
function mapDispatchToProps(dispatch: Dispatch) {
    return {
        exportState: () => dispatch($do.exportState(null))
    }
}

/**
 * @category Components
 */
const MemoizedErrorPopup = connect(mapStateToProps, mapDispatchToProps)(ErrorPopup)

export default MemoizedErrorPopup
