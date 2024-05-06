import { configureStore } from '@reduxjs/toolkit'
import transactionsReducer from './transactionsSlice.tsx'

const store = configureStore({
    reducer: {
        transactions: transactionsReducer,
    },
})

export type IRootState = ReturnType<typeof store.getState>

export default store
