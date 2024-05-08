import { remote } from '../../rpc/rpc.ts'
import { ITransactions, set } from './store/transactionsSlice.tsx'
import store from './store'

async function fetchTransactions(table: string) {
    const transactions = { table } as Partial<ITransactions>
    const categoriesResponse = await remote.get_categories()
    if ('result' in categoriesResponse) {
        transactions.categories = categoriesResponse.result
    }
    const transactionsResponse = await remote.get_transactions(table)
    if ('result' in transactionsResponse) {
        transactions.headers = transactionsResponse.result.columns
        transactions.rows = transactionsResponse.result.data
    }
    store.dispatch(set(transactions))
}

async function autofill() {
    const state = store.getState()
    await remote.set_categories(state.transactions.categories)
    await remote.autofill(state.transactions.table)
    await fetchTransactions(state.transactions.table)
}

async function getTables() {
    const response = await remote.get_tables()
    if ('result' in response) {
        return response.result
    }
    return []
}

export { fetchTransactions, autofill, getTables }
