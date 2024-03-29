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
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Store } from '../../interfaces/store'
import { Modal, Input } from 'antd'
import { $do } from '../../actions/actions'
import { useTranslation } from 'react-i18next'
import { OperationPostInvokeConfirmType, OperationModalInvokeConfirm, OperationPreInvokeType } from '../../interfaces/operation'
import cn from 'classnames'
import styles from './ModalInvoke.less'

interface ModalInvokeOwnProps {
    className?: string
}

interface ModalInvokeProps extends ModalInvokeOwnProps {
    bcName: string
    operationType: string
    widgetName: string
    confirmOperation: OperationModalInvokeConfirm
    onOk: (bcName: string, operationType: string, widgetName: string, confirm: string) => void
    onCancel: () => void
}

/**
 *
 * @param props
 * @category Components
 */
const ModalInvoke: React.FunctionComponent<ModalInvokeProps> = props => {
    const { t } = useTranslation()
    const [value, setValue] = React.useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value || null)
    }

    const getContent = () => {
        switch (props.confirmOperation.type) {
            case OperationPostInvokeConfirmType.confirm: {
                return (
                    <div>
                        <p className={styles.multiline}>{props.confirmOperation?.message || t('Perform an additional action?')}</p>
                    </div>
                )
            }
            case OperationPostInvokeConfirmType.confirmText: {
                return (
                    <div>
                        {props.confirmOperation?.message && <p className={styles.multiline}>{props.confirmOperation?.message}</p>}
                        {<Input value={value} onChange={handleChange} />}
                    </div>
                )
            }
            case OperationPreInvokeType.info: {
                return (
                    <div>
                        <p className={styles.multiline}>{props.confirmOperation?.message || t('Action has warning')}</p>
                    </div>
                )
            }
            case OperationPreInvokeType.error: {
                return (
                    <div>
                        <p className={styles.multiline}>{props.confirmOperation?.message || t('Action cannot be performed')}</p>
                    </div>
                )
            }
            default:
                return null
        }
    }

    const okLabel = props.confirmOperation?.okText || t('Ok')
    const cancelLabel = props.confirmOperation?.cancelText || t('Cancel')

    switch (props.confirmOperation.type) {
        case OperationPreInvokeType.info: {
            const modal = Modal.info({
                className: styles.modal,
                title: props.confirmOperation?.messageContent,
                okText: okLabel,
                cancelText: cancelLabel,
                onOk: () => {
                    props.onOk(props.bcName, props.operationType, props.widgetName, value || 'ok')
                    modal.destroy()
                },
                content: getContent()
            })
            return null
        }
        case OperationPreInvokeType.error: {
            const modal = Modal.error({
                className: styles.modal,
                title: props.confirmOperation?.messageContent,
                okText: okLabel,
                cancelText: cancelLabel,
                onOk: () => {
                    props.onCancel()
                    modal.destroy()
                },
                content: getContent()
            })
            return null
        }
        default: {
            return (
                <Modal
                    className={cn(styles.modal, props.className)}
                    visible={true}
                    title={props.confirmOperation?.messageContent || t('Are you sure?')}
                    okText={okLabel}
                    cancelText={cancelLabel}
                    wrapProps={{
                        'data-test-confirm-popup': true
                    }}
                    okButtonProps={
                        {
                            'data-test-confirm-popup-button-ok': true
                        } as any
                    }
                    cancelButtonProps={
                        {
                            'data-test-confirm-popup-button-cancel': true
                        } as any
                    }
                    onOk={() => {
                        props.onOk(props.bcName, props.operationType, props.widgetName, value || 'ok')
                    }}
                    onCancel={() => {
                        props.onCancel()
                    }}
                >
                    {getContent()}
                </Modal>
            )
        }
    }
}

function mapStateToProps(store: Store) {
    const modalInvoke = store.view.modalInvoke
    const operation = modalInvoke?.operation
    const confirmOperation = modalInvoke?.confirmOperation
    return {
        bcName: operation?.bcName,
        operationType: operation?.operationType,
        widgetName: operation?.widgetName,
        confirmOperation
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onOk: (bcName: string, operationType: string, widgetName: string, confirm?: string) => {
            dispatch($do.sendOperation({ bcName, operationType, widgetName, confirm }))
            dispatch($do.closeConfirmModal(null))
        },
        onCancel: () => {
            dispatch($do.closeConfirmModal(null))
        }
    }
}

/**
 * @category Components
 */
const ConnectedModalInvoke = connect(mapStateToProps, mapDispatchToProps)(ModalInvoke)

export default ConnectedModalInvoke
