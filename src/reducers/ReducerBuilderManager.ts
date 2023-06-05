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

import { ActionReducerMapBuilder, CaseReducer } from '@reduxjs/toolkit'
import { Action, AnyAction } from 'redux'

interface TypedActionCreator<Type extends string> {
    (...args: any[]): Action<Type>
    type: Type
}

type TypeGuard<T> = (value: any) => value is T

export class ReducerBuilderManager<State> {
    reducers: Array<[TypedActionCreator<string>, CaseReducer<State, AnyAction>]> = []
    matchers: Array<[TypeGuard<any> | ((action: AnyAction) => boolean), CaseReducer<State, AnyAction>]> = []
    defaultCaseReducer: CaseReducer<State, AnyAction> | undefined = undefined

    addCase<ActionCreator extends TypedActionCreator<string>>(
        action: ActionCreator,
        reducer: CaseReducer<State, ReturnType<ActionCreator>>
    ) {
        this.reducers.push([action, reducer])
        return this
    }

    removeCase<ActionCreator extends TypedActionCreator<string>>(action: ActionCreator) {
        this.reducers = this.reducers.filter(reducer => reducer[0].type !== action.type)
        return this
    }

    replaceCase<ActionCreator extends TypedActionCreator<string>>(
        action: ActionCreator,
        reducer: CaseReducer<State, ReturnType<ActionCreator>>
    ) {
        this.removeCase(action).addCase(action, reducer)
        return this
    }
    addMatcher<A>(
        matcher: TypeGuard<A> | ((action: any) => boolean),
        reducer: CaseReducer<State, A extends AnyAction ? A : A & AnyAction>
    ): Omit<ActionReducerMapBuilder<State>, 'addCase'> {
        this.matchers.push([matcher, reducer])
        return this
    }

    addDefaultCase(reducer: CaseReducer<State, AnyAction>) {
        this.defaultCaseReducer = reducer
        return {}
    }

    get builder() {
        return (builder: ActionReducerMapBuilder<State>) => {
            const builderWithCases = this.reducers.reduce((acc, args) => acc.addCase(...args), builder)
            const builderWithMatchers = this.matchers.reduce((acc, args) => acc.addMatcher(...args), builderWithCases)
            return this.defaultCaseReducer !== undefined ? builderWithMatchers.addDefaultCase(this.defaultCaseReducer) : builderWithMatchers
        }
    }
}
