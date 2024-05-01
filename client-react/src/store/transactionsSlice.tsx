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
    } as ITransactions,
    reducers: {
        setTransactions: (
            state: ITransactions,
            action: PayloadAction<ITransactions>
        ) => {
            state.table = action.payload.table
            state.categories = action.payload.categories
            state.headers = action.payload.headers
            state.rows = action.payload.rows
        },
        setCategory: (
            state: ITransactions,
            action: PayloadAction<{ id: string; category: string }>
        ) => {
            const payload = action.payload
            const iCol = state.headers.indexOf('category')
            for (const row of state.rows) {
                if (row[0] !== payload.id) {
                    continue
                }
                if (payload.category !== undefined) {
                    row[iCol] = payload.category
                }
            }
        },
        setFilterCategory: (
            state: ITransactions,
            action: PayloadAction<string>
        ) => {
            state.filterCategory = action.payload
        },
        setFilterOfCategory: (
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
        setKeyLock: (state: ITransactions, action: PayloadAction<boolean>) => {
            state.keyLock = action.payload
        },
    },
})

// Action creators are generated for each case reducer function
export const {
    setTransactions,
    setFilterOfCategory,
    setCategory,
    setFilterCategory,
    setKeyLock,
} = transactionsSlice.actions

export type { ICategory, ITransactions }

export default transactionsSlice.reducer
