<script setup>
import { remote } from '../../../rpc/rpc.js'
import { transactionsStore } from '../stores/transactionsStore.js'
import { onMounted, ref } from 'vue'
import _ from 'lodash'

const store = transactionsStore()
const categories = ref([])

async function autofill() {
  console.log('submit autofill', _.cloneDeep(categories.value))
  await remote.set_categories(categories.value)
  await remote.autofill(store.table)
  store.loadTransactions(store.table)
}

onMounted(async () => {
  let response = await remote.get_categories()
  categories.value = response.result

  const autofillModalRef = ref(null);
  console.log(`autofillModalRef`, autofillModalRef)
})

async function lockKey() {
  store.keyLock = true
}

async function unlockKey() {
  store.keyLock = false
}

</script>

<template>
  <div class="d-inline">
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#offcanvasExample"
      aria-controls="offcanvasExample"
    >
      Autofill
    </button>
  </div>

  <div
    ref="autofillModalRef"
    class="offcanvas offcanvas-start"
    tabindex="-1"
    id="offcanvasExample"
    aria-labelledby="autofillPanel"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="autofillPanel">Autofill panel</h5>
      <div class="px-2"></div>
      <button class="btn btn-outline-primary" @click="autofill">Recalculate</button>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body">
      <div v-for="category of categories" :key="category">
        <div class="d-flex flex-row mb-3">
          <label class="mt-2" :for="category + 'Form'">{{ category.key }}</label>
          <textarea
            v-model="category.filter"
            class="ms-2 form-control"
            :id="category + 'Form'"
            @blur="unlockKey"
            @focus="lockKey"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>