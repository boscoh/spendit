<script setup>
import { onMounted, watch } from 'vue'
import { transactionsStore } from '../stores/transactionsStore.js'
import { useRoute, useRouter } from 'vue-router'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

import DataTable from '../components/TransactionTable.vue'
import CategoryPlot from '../components/CategoryPlot.vue'
import AutofillPanel from '../components/AutofillPanel.vue'
import SummaryPanel from '../components/SummaryPanel.vue'
import EditBox from '@/components/EditBox.vue'
import CategoriesPanel from '@/components/CategoriesPanel.vue'

const store = transactionsStore()
const route = useRoute()
const router = useRouter()

async function deleteTable() {
  await store.deleteReport()
  await router.push('/')
}

async function renameTable(newTable) {
  await store.updateReportName(newTable)
  await router.replace(`/table/${newTable}`)
}

function reset() {
  store.loadReport(route.params.table)
}

onMounted(reset)

watch(() => route.params.table, reset)
</script>

<template>
  <div class="p-3 d-flex flex-column" style="height: calc(100vh - 56px)">
    <div class="d-flex flex-row justify-content-between align-items-center">
      <edit-box :text="store.table" :handle-text="renameTable"></edit-box>
      <button class="btn btn-outline-secondary" @click="deleteTable(table)">
        <FontAwesomeIcon :icon="faTrash"></FontAwesomeIcon>
      </button>
    </div>

    <CategoryPlot />

    <div class="d-flex flex-row justify-content-between">
      <div class="d-flex flex-row gap-2 my-2">
        <AutofillPanel />
        <CategoriesPanel />
        <SummaryPanel />
        <button class="btn btn-outline-secondary" @click="store.downloadReportCsv">CSV</button>
        <div>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="store.filterCategory"
          >
            <option selected :value="null">-- all --</option>
            <option
              v-for="c of store.categories"
              :key="c.key"
              :value="c.key"
              :selected="c.key === store.filterCategory"
            >
              only {{ c.key }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex-grow-1 overflow-auto card px-2">
      <DataTable />
    </div>
  </div>
</template>