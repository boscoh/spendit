<script setup>
import { onMounted, ref } from 'vue'
import { index } from '../stores/index.js'

const store = index()
const tables = ref([])

onMounted(async () => {
  tables.value = await store.getTables()
})
</script>

<template>
  <div class="d-flex flex-column p-3">
    <h1>Tables</h1>
    <ul class="mt-3 list-group">
      <RouterLink
        :to="'./table/' + table"
        v-for="(table, i) of tables"
        class="list-group-item list-group-item-action"
        :key="i"
      >
        {{ table }}
      </RouterLink>
    </ul>
  </div>
</template>
