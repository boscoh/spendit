<script setup>
import DataTable from '../components/DataTable.vue'
import CategoryPlot from '../components/CategoryPlot.vue'
import AutofillPanel from '../components/AutofillPanel.vue'
import SummaryPanel from '../components/SummaryPanel.vue'
import { onMounted, ref, watch } from 'vue'
import { transactionsStore } from '../stores/transactionsStore.js'
import { useRoute, useRouter } from 'vue-router'
import { remote, saveTextFile } from '../../../rpc/rpc.js'
import { Modal } from 'bootstrap'

const store = transactionsStore()
const route = useRoute()
const router = useRouter()
const newTable = ref('')
const modalRef = ref(null)

async function downloadCsv() {
  const response = await remote.get_csv(store.table)
  if ('result' in response) {
    saveTextFile(response.result, `${store.table}.csv`)
  }
}

async function deleteTable() {
  await remote.delete_table(store.table)
  router.push('/')
}

async function renameTable() {
  await remote.rename_table(store.table, newTable.value)
  console.log(store.table, '->', newTable.value)
  Modal.getInstance(modalRef.value)?.hide()
  store.table = newTable.value
  router.replace(`/table/${store.table}`)
}

onMounted(() => {
  modalRef.value.addEventListener('show.bs.modal', () => (newTable.value = store.table))
  store.loadTransactions(route.params.table)
})

watch(
  () => route.params.table || store.updateCount,
  () => {
    store.loadTransactions(route.params.table)
  }
)
</script>

<template>
  <div
    ref="modalRef"
    id="exampleModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel"
          >Rename Table</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <input type="text" v-model="newTable" class="form-control" id="recipient-name" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="renameTable">Rename</button>
        </div>
      </div>
    </div>
  </div>

  <div class="p-3 d-flex flex-column" style="height: calc(100vh - 56px)">
    <h3>Table: {{ store.table }}</h3>

    <CategoryPlot />

    <div class="d-flex flex-row justify-content-between">
      <div class="d-flex flex-row gap-2 mb-2">
        <AutofillPanel />
        <SummaryPanel />
        <button class="btn btn-outline-primary" @click="downloadCsv()">CSV</button>
        <button
          class="btn btn-outline-primary"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
          Rename
        </button>
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
      <div>
        <button class="btn btn-outline-primary" @click="deleteTable(table)">Delete</button>
      </div>
    </div>

    <div class="flex-grow-1 overflow-auto card px-2">
      <DataTable />
    </div>
  </div>
</template>