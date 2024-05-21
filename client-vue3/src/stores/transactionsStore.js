import { ref } from 'vue'
import { defineStore } from 'pinia'
import { remote, saveTextFile } from '../../../rpc/rpc.js'

export const transactionsStore = defineStore('transactions', () => {
  const table = ref('')
  const headers = ref([])
  const rows = ref([])
  const updateCount = ref(0)
  const keyLock = ref(false)
  const filterCategory = ref(null)
  const categories = ref([])
  const clickTransaction = ref(null)
  const offsetDays = ref(0)

  async function loadReport(newTable) {
    table.value = newTable

    let reportResponses = await remote.get_report_row(newTable)
    const report = reportResponses.result
    categories.value = JSON.parse(report.json_categories)
    offsetDays.value = report.offset_days

    let transactionResponse = await remote.get_transactions(newTable)
    headers.value = transactionResponse.result.columns
    rows.value = transactionResponse.result.data

    updateCount.value = updateCount.value + 1
  }

  async function updateCategoryOfRow(rowId, category) {
    for (let storeRow of rows.value) {
      if (storeRow[0] === rowId) {
        storeRow[storeRow.length - 1] = category
      }
    }
    await remote.update_transaction(table.value, rowId, { category })
    updateCount.value = updateCount.value + 1
  }

  async function updateOffsetDays() {
    await remote.update_report(table.value, { offset_days: offsetDays.value })
  }

  async function updateCategories() {
    await remote.update_categories(categories.value, table.value)
  }

  async function autofill() {
    await updateCategories()
    await remote.autofill(table.value)
    loadReport(table.value)
  }

  async function updateReportName(newName) {
    await remote.rename_report(table.value, newName)
    table.value = newName
  }

  async function downloadReportCsv() {
    const response = await remote.get_csv(table.value)
    if ('result' in response) {
      saveTextFile(response.result, `${table.value}.csv`)
    }
  }

  async function deleteReport() {
    await remote.delete_report(table.value)
  }

  async function getReportNames() {
    let response = await remote.get_report_names()
    if ('result' in response) {
      return response.result
    }
  }

  return {
    headers,
    rows,
    filterCategory,
    table,
    clickTransaction,
    keyLock,
    categories,
    offsetDays,
    updateCount,
    loadReport,
    updateOffsetDays,
    updateReportName,
    updateCategories,
    updateCategoryOfRow,
    downloadReportCsv,
    autofill,
    deleteReport,
    getReportNames: getReportNames
  }
})
