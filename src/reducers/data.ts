import { DataState, DataItem } from '../interfaces'
import {
    bcClearData,
    bcFetchDataSuccess,
    bcFetchRowMetaSuccess,
    bcNewDataSuccess,
    bcSaveDataSuccess,
    changeAssociations,
    inlinePickListFetchDataSuccess,
    selectView
} from '../actions'
import { ReducerBuilderManager } from './ReducerBuilderManager'

const emptyData: DataItem[] = []

export const dataInitialState: DataState = {}

export const createDataReducerBuilderManager = (initialState: DataState) =>
    new ReducerBuilderManager<typeof initialState>()
        .addCase(bcFetchDataSuccess, (state, action) => {
            state[action.payload.bcName] = action.payload.data
        })
        .addCase(inlinePickListFetchDataSuccess, (state, action) => {
            state[action.payload.bcName] = action.payload.data
        })
        .addCase(bcNewDataSuccess, (state, action) => {
            state[action.payload.bcName] = [...(state[action.payload.bcName] || emptyData), action.payload.dataItem]
        })
        .addCase(bcSaveDataSuccess, (state, action) => {
            const nextDataItem = action.payload.dataItem
            const index = (state[action.payload.bcName] || emptyData).findIndex(item => item.id === nextDataItem.id)
            if (index >= 0) {
                state[action.payload.bcName][index] = nextDataItem
            }
        })
        .addCase(bcFetchRowMetaSuccess, (state, action) => {
            const cursor = action.payload.cursor
            if (!cursor) {
                return
            }
            const prevDataItem = (state[action.payload.bcName] || emptyData).find(item => item.id === cursor)
            const nextDataItem: DataItem = {
                ...prevDataItem,
                id: cursor,
                vstamp: -1,
                _associate: prevDataItem && prevDataItem._associate
            }
            // BC is unable to update value from row meta if id is null
            const valueUpdateUnsupported = action.payload.rowMeta.fields.find(item => item.key === 'id' && !item.currentValue)
            if (valueUpdateUnsupported) {
                return
            }
            action.payload.rowMeta.fields
                .filter(field => {
                    // TODO: check if previous condition covered that case
                    return field.key !== '_associate'
                })
                .forEach(field => (nextDataItem[field.key] = field.currentValue))

            if (!prevDataItem) {
                state[action.payload.bcName] = [...(state[action.payload.bcName] || emptyData), nextDataItem]
                return
            }
            state[action.payload.bcName] = state[action.payload.bcName].map(item => (item === prevDataItem ? nextDataItem : item))
        })
        .addCase(changeAssociations, (state, action) => {
            state[`${action.payload.bcName}Delta`] = action.payload.records || []
        })
        .addCase(selectView, (state, action) => {
            if (action.payload.isTab) {
                return state
            }

            return initialState
        })
        .addCase(bcClearData, (state, action) => {
            action.payload.bcNames?.forEach(bcName => {
                delete state[bcName]
            })
        })
