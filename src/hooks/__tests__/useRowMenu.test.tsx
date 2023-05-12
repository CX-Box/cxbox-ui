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
import { useRowMenu, isOutsideMove } from '../useRowMenu'
import { mount } from 'enzyme'

describe('useRowMenu', () => {
    it('returns two refs and hover callbacks', () => {
        const Component = () => {
            const setRowMock = jest.fn()
            const e: any = {}
            const record = { id: '1', vstamp: 0 }
            const [operationsRef, parentRef, onHover] = useRowMenu()
            operationsRef.current = {
                setRow: setRowMock,
                containerRef: null
            }
            const { onMouseEnter, onMouseLeave } = onHover(record)
            expect(setRowMock).toBeCalledTimes(0)
            onMouseEnter(e)
            expect(setRowMock).toBeCalledTimes(1)
            expect(setRowMock).toBeCalledWith(record, e)
            onMouseLeave(e)
            expect(setRowMock).toBeCalledTimes(2)
            expect(setRowMock).toBeCalledWith(null, e)
            return <div ref={parentRef} />
        }
        mount(<Component />)
    })
})

describe.skip('useRowMenuInstance', () => {
    /**
     * TODO
     */
})

describe('isOutsideMove', () => {
    it('returns true if no `container` or `<tr>` are found in ancestors chain', () => {
        const container: any = {
            nodeName: 'DIV'
        }
        const e: any = {
            relatedTarget: {
                parentElement: {
                    nodeName: 'DIV',
                    parentElement: {
                        nodeName: 'DIV'
                    }
                }
            }
        }
        expect(isOutsideMove(e, container)).toBe(true)
    })
    it('returns false if there `container` in ancestors chain', () => {
        const container: any = {
            nodeName: 'DIV'
        }
        const e: any = {
            relatedTarget: {
                parentElement: {
                    nodeName: 'DIV',
                    parentElement: container
                }
            }
        }
        expect(isOutsideMove(e, container)).toBe(false)
    })
    it('returns false if there `<tr>` in ancestors chain', () => {
        const container: any = {
            nodeName: 'DIV'
        }
        const e: any = {
            relatedTarget: {
                parentElement: {
                    nodeName: 'TR',
                    parentElement: container
                }
            }
        }
        expect(isOutsideMove(e, container)).toBe(true)
    })
})
