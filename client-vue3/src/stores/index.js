import { ref } from 'vue'
import { defineStore } from 'pinia'
import { remote } from '../../../rpc/rpc.js'
import _ from 'lodash'

export const index = defineStore('counter', () => {
  const table = ref('')
  const headers = ref([])
  const rows = ref([])
  const updateCount = ref(0)
  const keyLock = ref(false)
  const filterCategory = ref(null)
  const categories = ref([])

  async function loadCategories() {
    let response = await remote.get_categories()
    categories.value = response.result
  }

  async function loadTable(newTable) {
    console.log(
      'loaded table',
      _.map(rows.value, (r) => r[1])
    )
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

  return {
    headers,
    rows,
    filterCategory,
    table,
    keyLock,
    categories,
    updateCount,
    loadTable,
    loadCategories,
    updateRow,
    getTables
  }
})
