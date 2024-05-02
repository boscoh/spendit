import { remote } from '../../rpc/rpc.ts'
import _ from 'lodash'
import { ITransactions, setTransactions } from './store/transactionsSlice.tsx'
import store from './store/store.ts'

async function fetchTable(table: string) {
    const transactions = {
        table,
        keyLock: false,
        categories: [],
        headers: [],
        rows: [],
        filterCategory: '',
    } as ITransactions

    const response = await remote.get_categories()
    if ('result' in response) {
        transactions.categories = response.result
    }

    const response2 = await remote.get_transactions(table)
    if ('result' in response2) {
        transactions.headers = response2.result.columns
        transactions.rows = response2.result.data
    }

    store.dispatch(setTransactions(transactions))
}

async function autofill() {
    const state = store.getState()
    await remote.set_categories(state.transactions.categories)
    await remote.autofill(state.transactions.table)
    await fetchTable(state.transactions.table)
}


async function getTables() {
    const response = await remote.get_tables()
    if ('result' in response) {
        return response.result
    }
    return []
}

export { fetchTable, autofill, getTables }
