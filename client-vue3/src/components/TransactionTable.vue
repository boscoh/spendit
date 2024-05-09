<script setup>
import { transactionsStore } from '../stores/transactionsStore.js'
import _ from 'lodash'
import { computed, onMounted, ref, watch } from 'vue'
import { DateTime } from 'luxon'

const store = transactionsStore()
let iRowActive = ref(0)

const filteredRows = computed(() => {
  if (!store.filterCategory) {
    return store.rows
  }
  let rows = _.filter(store.rows, (r) => _.last(r) === store.filterCategory)
  if (store.filterCategory === 'X') {
    const emptyRows = _.filter(store.rows, (r) => !_.last(r))
    rows = _.concat(rows, emptyRows)
  }
  return rows
})

onMounted(async () => {
  document.addEventListener('keydown', onKeydown)
})

watch(
  () => store.clickTransaction,
  () => {
    const time = store.clickTransaction.time
    const category = store.clickTransaction.category
    const rows = filteredRows.value
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      if (time === row[1] && category === _.last(row)) {
        const targetId = row[0]
        document.getElementById(targetId).scrollIntoView()
        iRowActive.value = i
      }
    }
  }
)

async function onKeydown(event) {
  if (store.keyLock) {
    return
  }
  if (event.key === 'ArrowDown') {
    iRowActive.value += 1
    if (iRowActive.value === store.rows.length) {
      iRowActive.value = 0
    }
  } else if (event.key === 'ArrowUp') {
    iRowActive.value -= 1
    if (iRowActive.value < 0) {
      iRowActive.value = store.rows.length - 1
    }
  } else {
    let category = event.key.toUpperCase()
    if (_.find(store.categories, (c) => c.key === category)) {
      const id = filteredRows.value[iRowActive.value][0]
      await store.updateCategory(id, category)
    }
  }
}

function formatRow(row) {
  let result = _.cloneDeep(row)
  for (let iCol = 0; iCol < row.length; iCol += 1) {
    const header = store.headers[iCol]
    if (header && header.indexOf('date') >= 0) {
      result[iCol] = DateTime.fromISO(result[iCol]).toFormat('ddLLLyy')
    }
  }
  return result
}
</script>

<style scoped>
th,
td {
  text-align: left;
}
.active {
  background-color: #ffe;
}
</style>

<template>
  <table class="table">
    <thead>
      <tr>
        <th scope="col" v-for="key of store.headers" :key="key">{{ key }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, iRow) of filteredRows" :key="row[0]" :id="row[0]" @click="iRowActive = iRow">
        <td
          v-for="(val, i) of formatRow(row)"
          :class="iRow === iRowActive ? 'active' : ''"
          :key="i"
        >
          <div v-if="i < row.length - 1">
            {{ val }}
          </div>
          <template v-else>
            <select
              class="form-select"
              aria-label="Default select example"
              @change="(e) => store.updateCategory(row[0], e.target.value)"
              @focus="iRowActive = iRow"
            >
              <option selected :value="null">-- select an option --</option>
              <option
                v-for="c of store.categories"
                :key="c.key"
                :value="c.key"
                :selected="c.key === _.last(row)"
              >
                {{ c.key + ' - ' + c.desc }}
              </option>
            </select>
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>