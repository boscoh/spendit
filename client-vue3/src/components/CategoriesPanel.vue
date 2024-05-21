<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { transactionsStore } from '../stores/transactionsStore.js'
import _ from 'lodash'

const store = transactionsStore()

function onDelete(i) {
  const categories = _.cloneDeep(store.categories)
  categories.splice(i, 1)
  store.categories = categories
}

function onCreate() {
  store.categories = _.concat(store.categories, {
    key: '',
    desc: 'Edit category description',
    filter: ''
  })
}
</script>

<template>
  <div class="d-inline">
    <button
      class="btn btn-outline-secondary"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#category-panel"
      aria-controls="category-panel"
    >
      Categories
    </button>
  </div>

  <div
    class="offcanvas offcanvas-start"
    tabindex="-1"
    id="category-panel"
    aria-labelledby="category-title"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="category-title">Categories</h5>
      <div class="px-2"></div>
      <button class="btn btn-outline-secondary" @click="store.updateCategories">Save</button>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body">
      <div v-for="[i, category] of store.categories.entries()" :key="i">
        <div class="d-flex flex-row mb-3 gap-2">
          <input
            class="form-control"
            maxlength="1"
            style="width: 3em"
            v-model="category.key"
            @blur="store.keyLock = false"
            @focus="store.keyLock = true"
          />
          <input
            v-model="category.desc"
            class="form-control"
            :id="category + 'Form'"
            @blur="store.keyLock = false"
            @focus="store.keyLock = true"
          />
          <button class="btn btn-outline-secondary" @click="onDelete(i)">
            <FontAwesomeIcon :icon="faTrash"></FontAwesomeIcon>
          </button>
        </div>
      </div>
      <button class="btn btn-outline-secondary" @click="onCreate">
        <FontAwesomeIcon :icon="faPlus"></FontAwesomeIcon>
      </button>
    </div>
  </div>
</template>