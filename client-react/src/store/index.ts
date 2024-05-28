import { configureStore } from '@reduxjs/toolkit'
import transactionsReducer, {
    ITransactions,
    set,
    setCategoryOfRow,
} from './transactionsSlice.tsx'
import { remote, saveTextFile } from '../../../rpc/rpc.ts'

const store = configureStore({
    reducer: {
        transactions: transactionsReducer,
    },
})

export type IRootState = ReturnType<typeof store.getState>

export default store

export async function loadReport(table: string) {
    const transactions = { table } as Partial<ITransactions>

    const reportResponse = await remote.get_report_dict(table)
    if ('result' in reportResponse) {
        transactions.categories = JSON.parse(
            reportResponse.result.json_categories
        )
        transactions.offset = JSON.parse(reportResponse.result.offset_days)
    }

    const transactionsResponse = await remote.get_transactions(table)
    if ('result' in transactionsResponse) {
        transactions.headers = transactionsResponse.result.columns
        transactions.rows = transactionsResponse.result.data
    }

    store.dispatch(set(transactions))
}

export async function autofill() {
    const state = store.getState()
    await remote.update_categories(
        state.transactions.categories,
        state.transactions.table
    )
    await remote.autofill(state.transactions.table)
    await loadReport(state.transactions.table)
}

export async function fetchReports() {
    const response = await remote.get_report_names()
    if ('result' in response) {
        return response.result
    }
}

export async function updateOffset(newOffset: number) {
    const state = store.getState()
    store.dispatch(set({ offset: newOffset }))
    await remote.update_report(state.transactions.table, { offset_days: newOffset })
}

export async function updateCategory(rowId: string, category: string) {
    const state = store.getState()
    await remote.update_transaction(state.transactions.table, rowId, {
        category,
    })
    store.dispatch(setCategoryOfRow({ category, id: rowId }))
}

export async function downloadCsv() {
    const state = store.getState()

    const response = await remote.get_csv(state.transactions.table)
    if ('result' in response) {
        saveTextFile(response.result, 'transactions.csv')
    }
}

export async function deleteReport() {
    const state = store.getState()
    await remote.delete_report(state.transactions.table)
}

export async function updateReportName(newTable: string) {
    const state = store.getState()
    await remote.rename_report(state.transactions.table, newTable)
    store.dispatch(set({ table: newTable }))
}