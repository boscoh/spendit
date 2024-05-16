<script setup>
import { onMounted, ref } from 'vue'
import { remoteUpload } from '../../../rpc/rpc.js'
import { transactionsStore } from '../stores/transactionsStore.js'

const tables = ref([])
const uploadInput = ref(null)
const uploadForm = ref(null)
const store = transactionsStore()

async function reset() {
  tables.value = await store.getReports()
}

async function submit() {
  const file = uploadInput.value.files[0]
  await remoteUpload(file, 'upload_csv')
  uploadInput.value.value = null
  await reset()
}

onMounted(reset)
</script>

<template>
  <div class="d-flex flex-column p-3">
    <h1>Tables</h1>

    <div class="mt-3">
      <ul class="list-group">
        <li v-for="(table, i) of tables" :key="i" class="d-flex flex-row">
          <RouterLink
            style="width: 20em"
            class="list-group-item list-group-item-action"
            :to="'./table/' + table"
          >
            {{ table }}
          </RouterLink>
        </li>
      </ul>
    </div>

    <div class="py-3">
      <form ref="uploadForm" class="form-group">
        <label>Upload CSV</label>
        <div class="d-flex flex-row gap-2">
          <input class="form-control" style="width: 20em" type="file" ref="uploadInput" />
          <button class="btn btn-outline-secondary" @click="submit">Upload</button>
        </div>
      </form>
    </div>
  </div>
</template>