<script setup>
import {transactionsStore} from '../stores/transactionsStore.js'
import {ref, watch} from 'vue'
import {DateTime, Interval} from 'luxon'
import _ from 'lodash'

const store = transactionsStore()

const summaries = ref([])
const nDay = ref(null)
const nWeek = ref(null)
const nMonth = ref(null)

watch(
  () => [store.offsetDays],
  () => {
    store.updateOffsetDays()
  }
)
watch(
  () => [store.updateCount, store.offsetDays, store.categories],
  () => {
    if (!store.categories) {
      return
    }

    // DateTime.fromFormat(v, 'dd/MM/yyyy').toFormat('LLLdd-yy')
    let times = _.filter(_.map(store.rows, (r) => r[1]))
    if (!times.length) {
      return
    }

    times = _.map(times, DateTime.fromISO)
    times.sort((a, b) => b - a)
    let interval = Interval.fromDateTimes(_.last(times), _.head(times))
    nDay.value = interval.length('days') - store.offsetDays
    nWeek.value = (nDay.value / 7).toFixed(2)
    nMonth.value = (nDay.value / 30).toFixed(2)

    summaries.value = []
    for (let c of store.categories) {
      let dataset = {
        sum: 0,
        key: c.key,
        desc: c.key + ': ' + c.desc
      }
      for (let row of store.rows) {
        if (row[4] === c.key) {
          dataset.sum = dataset.sum + row[3]
        }
      }
      summaries.value.push(dataset)
    }

    let extra = 0
    for (let row of store.rows) {
      if (!row[4]) {
        extra += row[3]
      }
    }
    let i = summaries.value.length - 1
    summaries.value[i].sum += extra

    for (let dataset of summaries.value) {
      dataset.sumDay = (dataset.sum / nDay.value).toFixed(0)
      dataset.sumWeek = (dataset.sum / nWeek.value).toFixed(0)
      dataset.sumMonth = (dataset.sum / nMonth.value).toFixed(0)
      dataset.sum = dataset.sum.toFixed(0)
      dataset.sumYear = dataset.sumMonth * 12
    }
  }
)
</script>

<template>
<div class="d-inline">
  <button
    class="btn btn-outline-primary"
    type="button"
    data-bs-toggle="offcanvas"
    data-bs-target="#summaryOffCanvas"
    aria-controls="summaryOffCanvas"
  >
    Summary
  </button>
</div>

<div
  class="offcanvas offcanvas-start"
  tabindex="-1"
  id="summaryOffCanvas"
  aria-labelledby="summaryOffCanvasLabel"
>
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="summaryOffCanvasLabel">Summary</h5>
    <div class="px-2"></div>
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="offcanvas"
      aria-label="Close"
    ></button>
  </div>
  <div class="offcanvas-body">
    <p>
      Day = {{ nDay }} &nbsp; Week = {{ nWeek }} &nbsp; Month = {{ nMonth }}
      <div class="d-flex flex-row gap-2 align-items-center">
        <label for="store.offsetDays">Skip Days =</label>
        <input
          class="form-control"
          id="offsetDay"
          v-model="store.offsetDays"
          style="width: 4.5em"
          type="number"
          required
        />
      </div>
    </p>
    <table class="table">
      <thead>
      <tr>
        <th>#</th>
        <th class="text-end">Total</th>
        <th class="text-end">Day</th>
        <th class="text-end">Week</th>
        <th class="text-end">Month</th>
        <th class="text-end">Year</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(summary, i) of summaries" :key="i">
        <td>{{ summary.key }}</td>
        <td class="text-end">{{ summary.sum }}</td>
        <td class="text-end">{{ summary.sumDay }}</td>
        <td class="text-end">{{ summary.sumWeek }}</td>
        <td class="text-end">{{ summary.sumMonth }}</td>
        <td class="text-end">{{ summary.sumYear }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>
</template>