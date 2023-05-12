

import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { loginEpic } from '../loginDone'
import { $do } from '../../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'

describe('`loginDone` epic', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('does nothing', () => {
        const action = $do.login({ login: 'bruce', password: 'qwerty' })
        const epic = loginEpic(ActionsObservable.of(action), store)

        testEpic(epic, result => {
            expect(result.length).toBe(0)
        })
    })
})
