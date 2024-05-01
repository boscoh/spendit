<script setup>
import { index } from '../stores/index.js'
import _ from 'lodash'
import { remote } from '../../../rpc/rpc.js'
import { computed, onMounted, ref } from 'vue'
import { DateTime } from 'luxon'

const store = index()

let descByCategory = ref({})
let categoryKeys = ref([])
let iRowActive = ref(0)

onMounted(async () => {
  await store.loadCategories()
  descByCategory.value = {}
  categoryKeys.value = []
  for (let category of store.categories) {
    descByCategory.value[category.key] = category.desc
    categoryKeys.value.push(category.key)
  }
  document.addEventListener('keydown', onKeydown)
})

const filteredRows = computed(() => {
  if (!store.filterCategory) {
    return store.rows
  }
  let rows = _.filter(store.rows, (r) => _.last(r) === store.filterCategory)
  if (store.filterCategory === "X") {
    const emptyRows = _.filter(store.rows, (r) => ! _.last(r))
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
  console.log(store.keyLock)
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
  } else if (event.key === 'ArrowLeft') {
    let category = _.last(getRow(iRowActive.value))
    await setCategory(iRowActive.value, getStepItem(category, categoryKeys.value, -1))
  } else if (event.key === 'ArrowRight') {
    let category = _.last(getRow(iRowActive.value))
    await setCategory(iRowActive.value, getStepItem(category, categoryKeys.value, +1))
  } else {
    let category = event.key.toUpperCase()
    if (categoryKeys.value.includes(category)) {
      await setCategory(iRowActive.value, category)
    }
  }
}

function dropHead(vals) {
  return _.slice(vals, 1, vals.length)
}

function getStepItem(x, xVals, diff) {
  const i = xVals.indexOf(x)
  let j
  if (i < 0) {
    j = 0
  } else {
    j = i + diff
  }
  if (j < 0) {
    j = xVals.length - 1
  }
  if (j >= xVals.length) {
    j = 0
  }
  return xVals[j]
}

function displayCategory(v) {
  return v + ' - ' + descByCategory.value[v]
}

function formatRow(row) {
  let result = dropHead(row)
  for (let iCol = 0; iCol < row.length; iCol += 1) {
    let header = store.headers[iCol + 1]
    if (!header) {
      continue
    }
    if (header.indexOf('date') >= 0) {
      let v = result[iCol]
      result[iCol] = DateTime.fromISO(v).toFormat('ddLLLyy')
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
  <table class="table" @keydown="onKey">
    <thead>
      <tr>
        <th scope="col" v-for="key of dropHead(store.headers)" :key="key">{{ key }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, iRow) of filteredRows" :key="row[0]" @click="selectRow(iRow)">
        <td
          v-for="(val, i) of formatRow(row)"
          v-bind:class="iRow === iRowActive ? 'active align-middle' : 'align-middle'"
          :key="i"
        >
          <div v-if="i === row.length - 2">
            <select
              class="form-select"
              aria-label="Default select example"
              @change="
                (event) => {
                  setCategory(iRow, event.target.value)
                }
              "
              @focus="selectRow(iRow)"
            >
              <option selected :value="null">-- select an option --</option>
              <option v-for="c of categoryKeys" :key="c" :value="c" :selected="c === _.last(row)">
                {{ displayCategory(c) }}
              </option>
            </select>
          </div>
          <template v-else>
            {{ val }}
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>