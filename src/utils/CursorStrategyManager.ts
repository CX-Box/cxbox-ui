import { Store } from '../interfaces'
import { DataItem } from '@cxbox-ui/schema'

export type CursorSelectionStrategy<State = any> = (
    data: DataItem[],
    prevCursor: string | undefined,
    bcName: string,
    state: State
) => string | null | undefined

export class CursorStrategyManager<State extends Record<string, any> = Store> {
    private strategies: Record<string, CursorSelectionStrategy<State>> = {
        default: (data, prevCursor) => {
            const found = data.some(i => i.id === prevCursor)
            return found ? prevCursor : data[0]?.id
        }
    }

    register(name: string, strategy: CursorSelectionStrategy<State>) {
        this.strategies[name] = strategy
    }

    get(name: string | undefined): CursorSelectionStrategy<State> {
        return this.strategies[name || 'default'] || this.strategies['default']
    }
}

export const cursorStrategyManager = new CursorStrategyManager()
