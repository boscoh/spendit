import { ref } from 'vue'
import { defineStore } from 'pinia'
import { remote } from '../../../rpc/rpc.js'

export const transactionsStore = defineStore('transactions', () => {
  const table = ref('')
  const headers = ref([])
  const rows = ref([])
  const updateCount = ref(0)
  const keyLock = ref(false)
  const filterCategory = ref(null)
  const categories = ref([])
  const clickTransaction = ref(null)

  async function loadCategories() {
    let response = await remote.get_categories()
    categories.value = response.result
  }

  async function loadTransactions(newTable) {
    table.value = newTable
    let response = await remote.get_transactions(newTable)
    headers.value = response.result.columns
    rows.value = response.result.data
    updateCount.value = updateCount.value + 1
  }

  async function getTables() {
    let response = await remote.get_tables()
    return response.result
  }

  function updateRow(row) {
    for (let storeRow of rows.value) {
      const iId = 0
      if (storeRow[iId] === row[iId]) {
        for (let i = 1; i < row.length; i += 1) {
          storeRow[i] = row[i]
        }
      }
    }
    updateCount.value = updateCount.value + 1
  }

  async function updateCategory(id, category) {
    for (let storeRow of rows.value) {
      if (storeRow[0] === id) {
        storeRow[storeRow.length - 1] = category
      }
    }
    await remote.update_transactions(table.value, id, { category })
    updateCount.value = updateCount.value + 1
  }

  async function autofill() {
    await remote.set_categories(categories.value)
    await remote.autofill(table.value)
    loadTransactions(table.value)
  }

  return {
    headers,
    rows,
    filterCategory,
    table,
    clickTransaction,
    keyLock,
    categories,
    updateCount,
    loadTransactions,
    loadCategories,
    updateRow,
    getTables,
    updateCategory,
    autofill
  }
})
