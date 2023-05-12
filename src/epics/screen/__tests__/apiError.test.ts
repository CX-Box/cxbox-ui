

import { $do } from '../../../actions/actions'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { apiError } from '../apiError'
import axios, { AxiosError } from 'axios'
import { ApplicationErrorType } from '../../../interfaces/view'
import { knownHttpErrors } from '../apiError'

const dispatch = jest.fn()
jest.spyOn(axios, 'isCancel').mockImplementation((e: AxiosError) => {
    return e.name === 'cancelled'
})

describe('apiError', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
        store.dispatch = dispatch
    })

    it('dispatches `httpError` when http status available', () => {
        const callContext = { widgetName: 'widget-example' }
        knownHttpErrors.forEach(statusCode => {
            const error = getAxiosError(statusCode)
            const action = $do.apiError({
                error,
                callContext
            })
            const epic = apiError(ActionsObservable.of(action), store)
            testEpic(epic, result => {
                expect(result[0]).toEqual(
                    expect.objectContaining(
                        $do.httpError({
                            statusCode: error.response.status,
                            error,
                            callContext
                        })
                    )
                )
            })
        })
        const unknownStatusError = getAxiosError(999)
        const unkownStatusAction = $do.apiError({
            error: unknownStatusError,
            callContext: { widgetName: 'widget-example' }
        })
        const unknownStatusEpic = apiError(ActionsObservable.of(unkownStatusAction), store)
        testEpic(unknownStatusEpic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.httpError({
                        statusCode: 999,
                        error: unknownStatusError,
                        callContext
                    })
                )
            )
        })
    })

    it('dispatches `showViewError` for network error', () => {
        const error = getAxiosError(null)
        delete error.response
        const action = $do.apiError({
            error,
            callContext: { widgetName: 'widget-example' }
        })
        const epic = apiError(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.showViewError({
                        error: {
                            type: ApplicationErrorType.NetworkError
                        }
                    })
                )
            )
        })
    })

    it('does not show network errors for cancelled requests', () => {
        const error = getAxiosError(null)
        delete error.response
        error.name = 'cancelled'
        const action = $do.apiError({
            error,
            callContext: { widgetName: 'widget-example' }
        })
        const epic = apiError(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result.length).toBe(0)
        })
    })
})

function getAxiosError(status: number): AxiosError {
    return {
        config: null,
        isAxiosError: true,
        name: 'test',
        message: 'test',
        response: {
            data: {},
            status,
            statusText: 'error',
            headers: null,
            config: null
        }
    }
}
