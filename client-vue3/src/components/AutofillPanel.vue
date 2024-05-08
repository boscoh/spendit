<script setup>
import { transactionsStore } from '../stores/transactionsStore.js'

const store = transactionsStore()
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
    class="offcanvas offcanvas-start"
    tabindex="-1"
    id="offcanvasExample"
    aria-labelledby="autofillPanel"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="autofillPanel">Autofill panel</h5>
      <div class="px-2"></div>
      <button class="btn btn-outline-primary" @click="store.autofill">Recalculate</button>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body">
      <div v-for="category of store.categories" :key="category">
        <div class="d-flex flex-row mb-3">
          <label class="mt-2" :for="category + 'Form'">{{ category.key }}</label>
          <textarea
            v-model="category.filter"
            class="ms-2 form-control"
            :id="category + 'Form'"
            @blur="store.keyLock = false"
            @focus="store.keyLock = true"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>