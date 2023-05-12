

import { $do } from '../../../actions/actions'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'
import { httpError401 } from '../httpError401'

const pushMock = jest.fn().mockImplementation()
const dispatchMock = jest.fn()
jest.mock('history', () => ({
    createHashHistory: () => ({
        push: (arg: any) => {
            pushMock(arg)
        }
    })
}))

describe('httpError401', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('dispatch `logoutDone` and redirects to `/`', () => {
        const action = $do.httpError({
            statusCode: 401,
            error: {
                config: null,
                isAxiosError: true,
                name: 'test',
                message: 'test'
            },
            callContext: { widgetName: 'widget-example' }
        })
        const epic = httpError401(ActionsObservable.of(action), { ...store, dispatch: dispatchMock })
        testEpic(epic, () => {
            expect(dispatchMock).toBeCalledWith(expect.objectContaining($do.logoutDone(null)))
            expect(pushMock).toBeCalledWith('/')
        })
    })
})
