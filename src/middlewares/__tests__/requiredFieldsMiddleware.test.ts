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

import {
    createRequiredFieldsMiddleware,
    getRequiredFieldsMissing,
    hasPendingValidationFails,
    operationRequiresAutosave
} from '../requiredFieldsMiddleware'
import { mockStore } from '../../tests/mockStore'
import { PendingValidationFailsFormat } from '../../interfaces/view'
import { $do, types } from '../../actions/actions'
import { Store as CoreStore } from '../../interfaces/store'
import { Store } from 'redux'
import { OperationTypeCrud, Operation } from '../../interfaces/operation'
import { WidgetTypes } from '../../interfaces/widget'
import { RowMeta } from '../../interfaces/rowMeta'
import { DataValue } from '@cxbox-ui/schema'

describe('requiredFieldsMiddleware', () => {
    let store: Store<CoreStore>
    const dispatch = jest.fn()
    /* eslint-disable @typescript-eslint/unbound-method */
    const middleware = createRequiredFieldsMiddleware()({ getState: mockStore().getState, dispatch })

    beforeAll(() => {
        store = mockStore()
        store.getState().screen.bo.bc = bc
        store.getState().view.rowMeta = {
            bcExample: {
                bcExample: rowMeta,
                'bcExample/1': rowMeta
            }
        }
        store.getState().view.widgets = [widget]
    })

    afterEach(() => {
        dispatch.mockClear()
        store.getState().screen.bo.bc.bcExample.cursor = '1'
    })

    it('fires only for `sendOperation` action', () => {
        const action = $do.uploadFile(null)
        expect(middleware(() => action as any)(action)).toBe(action)
        expect(dispatch).toBeCalledTimes(0)
    })

    it('fires only for BC with cursor', () => {
        store.getState().screen.bo.bc.bcExample.cursor = null
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: 'associate',
            widgetName: 'widget-example'
        })
        middleware(() => action as any)(action)
        expect(dispatch).toBeCalledTimes(0)
    })

    it('dispatch `selectTableCellInit` on first missing field for table widgets', () => {
        const action = $do.sendOperation({
            bcName: 'bcExample',
            operationType: 'associate',
            widgetName: 'widget-example'
        })
        middleware(() => action as any)(action)
        expect(dispatch).toBeCalledWith(
            expect.objectContaining({
                type: types.selectTableCellInit
            })
        )
    })
})

describe('hasPendingValidationFails target format test', () => {
    const initState = mockStore().getState()
    const bcName = Object.keys(initState.screen.bo.bc)[0]
    it('1. should return `false`', () => {
        expect(hasPendingValidationFails(initState, bcName)).toBeFalsy()
    })
    it('2. should return `false`', () => {
        const store = {
            ...initState,
            view: {
                ...initState.view,
                pendingValidationFailsFormat: PendingValidationFailsFormat.target,
                pendingValidationFails: {
                    [bcName]: {}
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeFalsy()
    })
    it('3. should return `false`', () => {
        const store = {
            ...initState,
            view: {
                ...initState.view,
                pendingValidationFailsFormat: PendingValidationFailsFormat.target,
                pendingValidationFails: {
                    [bcName]: {
                        '1000': {}
                    }
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeFalsy()
    })
    it('1. should return `true`', () => {
        const store = {
            ...initState,
            view: {
                ...initState.view,
                pendingValidationFailsFormat: PendingValidationFailsFormat.target,
                pendingValidationFails: {
                    [bcName]: {
                        '1000': {
                            aa: 'aaa'
                        }
                    }
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeTruthy()
    })
    it('2. should return `true`', () => {
        const store = {
            ...initState,
            view: {
                ...initState.view,
                pendingValidationFailsFormat: PendingValidationFailsFormat.target,
                pendingValidationFails: {
                    anotherBc: {},
                    [bcName]: {
                        '10001': {},
                        '1000': {
                            aa: 'aaa'
                        }
                    }
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeTruthy()
    })
})

describe('hasPendingValidationFails old format test', () => {
    const initState = mockStore().getState()
    const bcName = Object.keys(initState.screen.bo.bc)[0]
    it('should return `false`', () => {
        expect(hasPendingValidationFails(initState, bcName)).toBeFalsy()
    })
    it('should return `true`', () => {
        const store = {
            ...initState,
            view: {
                ...initState.view,
                pendingValidationFails: {
                    aaa: 'aaa'
                }
            }
        }
        expect(hasPendingValidationFails(store, bcName)).toBeTruthy()
    })
})

describe('operationRequiresAutosave', () => {
    it('should return true on save action', () => {
        expect(
            operationRequiresAutosave(OperationTypeCrud.save, [
                { type: OperationTypeCrud.save, scope: 'bc', autoSaveBefore: true, text: 'save' }
            ])
        ).toBeTruthy()
    })
    it('should ignore save role action', () => {
        expect(
            operationRequiresAutosave(OperationTypeCrud.save, [
                { type: 'type', scope: 'bc', autoSaveBefore: true, text: 'save', actionRole: OperationTypeCrud.save }
            ])
        ).toBeFalsy()
    })
    it('should react on autoSaveBefore flag 1: return true', () => {
        expect(operationRequiresAutosave(OperationTypeCrud.associate, [rowMetaAction])).toBeTruthy()
    })
    it('should react on autoSaveBefore flag 2: return false', () => {
        expect(operationRequiresAutosave(OperationTypeCrud.associate, [{ ...rowMetaAction, autoSaveBefore: false }])).toBeFalsy()
    })
    it('should react if no actions', () => {
        expect(operationRequiresAutosave(OperationTypeCrud.associate, null)).toBeFalsy()
    })
})

describe('getRequiredFieldsMissing', () => {
    const data = { id: '1', vstamp: 1, test: 'test' }
    it('should return null', () => {
        expect(getRequiredFieldsMissing(data, {}, rowMeta.fields)).toBeFalsy()
    })
    it('should react on null', () => {
        const pending = { test: null as DataValue }
        expect(getRequiredFieldsMissing(data, pending, rowMeta.fields)).toStrictEqual(pending)
    })
    it('should react on undefined', () => {
        const pending = { test: undefined as DataValue }
        expect(getRequiredFieldsMissing({ ...data, test: undefined }, pending, rowMeta.fields)).toStrictEqual({ test: null })
    })
    it('should react on []', () => {
        const pending = { test: [] as DataValue }
        expect(getRequiredFieldsMissing(data, pending, rowMeta.fields)).toStrictEqual(pending)
    })
    it('should react on {}', () => {
        const pending = { test: {} as DataValue }
        expect(getRequiredFieldsMissing(data, pending, rowMeta.fields)).toStrictEqual({ test: null })
    })
})

const rowMetaAction: Operation = { type: OperationTypeCrud.associate, text: 'text', scope: 'associate', autoSaveBefore: true }

const rowMeta: RowMeta = {
    actions: [rowMetaAction],
    fields: [
        {
            key: 'test',
            currentValue: null,
            required: true
        }
    ]
}

const widget = {
    name: 'widget-example',
    type: WidgetTypes.List,
    fields: [{ key: 'test', type: 'input', label: 'labe' }],
    position: 0,
    title: '',
    bcName: 'bcExample',
    gridWidth: 0
}

const bc = {
    bcExample: {
        cursor: '1',
        name: 'bcExample',
        parentName: '',
        url: 'bcExample'
    }
}
