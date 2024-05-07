import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import _ from 'lodash'

interface ICategory {
    key: string
    filter: string
    desc: string
}

interface ITransactions {
    table: string
    headers: string[]
    rows: string[][]
    categories: ICategory[]
    filterCategory: string
    keyLock: boolean
    clickTransaction: { [id: string] : string; }
}

const transactionsSlice = createSlice({
    name: 'transactions',
    initialState: {
        table: '',
        headers: [],
        rows: [],
        categories: [],
        filterCategory: '',
        keyLock: false,
        clickTransaction: {}
    } as ITransactions,
    reducers: {
        set: (
            state: ITransactions,
            action: PayloadAction<Partial<ITransactions>>
        ) => {
            if (action.payload.table) {
                state.table = action.payload.table
            }
            if (action.payload.categories) {
                state.categories = action.payload.categories
            }
            if (action.payload.headers) {
                state.headers = action.payload.headers
            }
            if (action.payload.rows) {
                state.rows = action.payload.rows
            }
            if (action.payload.keyLock) {
                state.keyLock = action.payload.keyLock
            }
            if (action.payload.clickTransaction) {
                state.clickTransaction = action.payload.clickTransaction
            }
            if (action.payload.filterCategory) {
                state.filterCategory = action.payload.filterCategory
            }
        },
        updateCategory: (
            state: ITransactions,
            action: PayloadAction<{ id: string; category: string }>
        ) => {
            const row = _.find(state.rows, r => r[0] === action.payload.id)
            if (row) {
                const iCol = state.headers.indexOf('category')
                row[iCol] = action.payload.category
            }
        },
        updateFilterOfCategory: (
            state: ITransactions,
            action: PayloadAction<{ categoryKey: string; filter: string }>
        ) => {
            const category = _.find(
                state.categories,
                (c) => c.key === action.payload.categoryKey
            )
            if (category) {
                category.filter = action.payload.filter
            }
        },
    },
})

// Action creators are generated for each case reducer function
export const {
    set,
    updateFilterOfCategory,
    updateCategory,
} = transactionsSlice.actions

export type { ICategory, ITransactions }

export default transactionsSlice.reducer
