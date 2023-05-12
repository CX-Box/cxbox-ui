

import { testEpic } from '../../../tests/testEpic'
import { $do } from '../../../actions/actions'
import { ActionsObservable } from 'redux-observable'
import { mockStore } from '../../../tests/mockStore'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { notification } from 'antd'
import { selectScreenFail } from '../selectScreenFail'
import i18n from 'i18next'

const notificationMock = jest.fn()
const i18nMock = jest.fn().mockImplementation((token, variable) => {
    return `Screen ${variable.screenName} is missing or unavailable for your role`
})

jest.spyOn(notification, 'error').mockImplementation(notificationMock)
jest.spyOn(i18n, 't').mockImplementation(i18nMock)

describe('selectScreenFail', () => {
    let store: Store<CoreStore> = null

    beforeAll(() => {
        store = mockStore()
    })

    it('shows notification with error message and screen name', () => {
        const action = $do.selectScreenFail({ screenName: 'screen-example' })
        const epic = selectScreenFail(ActionsObservable.of(action), store)
        testEpic(epic, res => {
            expect(res.length).toBe(0)
            expect(notificationMock).toBeCalledWith({
                duration: 15,
                message: 'Screen screen-example is missing or unavailable for your role'
            })
        })
    })
})
