<script setup>
import DataTable from '../components/DataTable.vue'
import CategoryPlot from '../components/CategoryPlot.vue'
import AutofillPanel from '../components/AutofillPanel.vue'
import SummaryPanel from '../components/SummaryPanel.vue'
import { watch } from 'vue'
import { index } from '../stores/index.js'
import { useRoute } from 'vue-router'
import { remote, saveTextFile } from '../../../rpc/rpc.js'

const store = index()
const route = useRoute()

store.loadTable(route.params.table)

watch(
  () => route.params.table,
  (table, prevTable) => {
    console.log('watching route', table)
    store.loadTable(table)
  }
)

async function downloadCsv() {
  const response = await remote.get_csv()
  if ('result' in response) {
    saveTextFile(response.result, 'transactions.csv')
  }
}
</script>

<template>
  <div class="p-3 d-flex flex-column" style="height: calc(100vh - 56px)">

    <h3>Table: {{ store.table }}</h3>

    <CategoryPlot />

    <div class="d-flex flex-row gap-2 mb-2">
      <AutofillPanel />
      <SummaryPanel />
      <button class="btn btn-outline-primary" @click="downloadCsv()">CSV</button>
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

    <div class="flex-grow-1 overflow-auto card px-2">
      <DataTable />
    </div>

  </div>
</template>