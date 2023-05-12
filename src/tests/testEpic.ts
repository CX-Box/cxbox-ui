

/**
 * Utility for simple unit-testing of epics
 *
 * TODO: Probably will not be needed after migration to redux-observable 1.* and RxJS 6.* with TestScheduler.run available
 */

import { TestScheduler, Notification, Observable } from 'rxjs'
import { AnyAction } from '../actions/actions'

/**
 * Result frame of test scheduler
 */
type TestSchedulerFrame = {
    /**
     * Probably an order
     */
    frame: number
    /**
     * Scheduler notifaction;
     * important fields are:
     * - `kind` - (`N` - next, succes; `C` - complete, chain terminator? and `E` - error)
     * - `value` - result obsevable value (i.e. action)
     */
    notification: Notification<AnyAction>
}

/**
 * Fires an epic and a callback with array of observables, returned from epic
 *
 * @param epic Epic chain to test
 * @param callback Epic result callback
 */
export function testEpic(epic: Observable<AnyAction>, callback: (result: AnyAction[]) => void) {
    const testScheduler = new TestScheduler((actual: TestSchedulerFrame[]) => {
        const nextActionNotifications = actual.filter(item => item.notification.kind === 'N').map(item => item.notification.value)
        actual
            .filter(item => item.notification.kind === 'E')
            .forEach(item => {
                console.error(item.notification.error)
            })
        callback(nextActionNotifications)
    })
    testScheduler.expectObservable(epic).toBe('a') // some `marble` testing stuff which we do not use
    testScheduler.flush()
}
