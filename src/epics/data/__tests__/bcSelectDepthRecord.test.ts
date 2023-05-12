

import { bcSelectDepthRecord } from '../bcSelectDepthRecord'
import { $do } from '../../../actions/actions'
import { Store } from 'redux'
import { Store as CoreStore } from '../../../interfaces/store'
import { mockStore } from '../../../tests/mockStore'
import { ActionsObservable } from 'redux-observable'
import { testEpic } from '../../../tests/testEpic'

describe('bcSelectDepthRecord', () => {
    let store: Store<CoreStore> = null
    beforeAll(() => {
        store = mockStore()
    })
    it('fires `bcChangeDepthCursor` and `bcFetchDataRequest` actions', () => {
        const action = $do.bcSelectDepthRecord({
            bcName: 'bcExample',
            cursor: '17',
            depth: 2
        })
        const epic = bcSelectDepthRecord(ActionsObservable.of(action), store)
        testEpic(epic, result => {
            expect(result.length).toBe(2)
            expect(result[0]).toEqual(
                expect.objectContaining(
                    $do.bcChangeDepthCursor({
                        bcName: 'bcExample',
                        cursor: '17',
                        depth: 2
                    })
                )
            )
            expect(result[1]).toEqual(
                expect.objectContaining(
                    $do.bcFetchDataRequest({
                        bcName: 'bcExample',
                        depth: 3,
                        widgetName: '',
                        ignorePageLimit: true
                    })
                )
            )
        })
    })
})
