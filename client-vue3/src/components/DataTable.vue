<script setup>
import { transactionsStore } from '../stores/transactionsStore.js'
import _ from 'lodash'
import { remote } from '../../../rpc/rpc.js'
import { computed, onMounted, ref, watch } from 'vue'
import { DateTime } from 'luxon'

const store = transactionsStore()
let descByCategory = {}
let categoryKeys = []
let iRowActive = ref(0)

onMounted(async () => {
  await store.loadCategories()
  descByCategory = {}
  categoryKeys = []
  for (let category of store.categories) {
    descByCategory[category.key] = category.desc
    categoryKeys.push(category.key)
  }
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

function getRow(iRow) {
  return _.cloneDeep(filteredRows.value[iRow])
}

function selectRow(iRow) {
  iRowActive.value = iRow
}

async function setCategory(iRow, category) {
  console.log('setCategory', iRow, category)
  let row = getRow(iRow)
  let id = row[0]
  let iLast = row.length - 1
  row[iLast] = category
  store.updateRow(row)
  await remote.update_transactions(store.table, id, { category })
}

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
    if (categoryKeys.includes(category)) {
      await setCategory(iRowActive.value, category)
    }
  }
}

function displayCategory(v) {
  return v + ' - ' + descByCategory[v]
}

function formatRow(row) {
  let result = _.cloneDeep(row)
  for (let iCol = 0; iCol < row.length; iCol += 1) {
    const header = store.headers[iCol]
    if (header && header.indexOf('date') >= 0) {
      const date = DateTime.fromISO(result[iCol])
      result[iCol] = date.toFormat('ddLLLyy')
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
          v-bind:class="iRow === iRowActive ? 'active align-middle' : 'align-middle'"
          :key="i"
        >
          <div v-if="i < row.length - 1">
            {{ val }}
          </div>
          <template v-else>
            <select
              class="form-select"
              aria-label="Default select example"
              @change="(e) => setCategory(iRow, e.target.value)"
              @focus="selectRow(iRow)"
            >
              <option selected :value="null">-- select an option --</option>
              <option
                v-for="c of store.categories"
                :key="c.key"
                :value="c.key"
                :selected="c.key === _.last(row)"
              >
                {{ displayCategory(c.key) }}
              </option>
            </select>
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>