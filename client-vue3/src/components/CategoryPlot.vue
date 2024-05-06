<script setup>
import { transactionsStore } from '../stores/transactionsStore.js'
import { VuePlotly } from 'vue3-plotly'
import { ref, watch } from 'vue'
import _ from 'lodash'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const store = transactionsStore()
const vuePlotlyEl = ref(null)
const plotData = ref([])

const layout = {
  margin: {
    l: 50,
    r: 50,
    b: 50,
    t: 50,
    pad: 4
  },
  height: 320,
  title: ''
}

watch(
  () => [store.updateCount, store.categories, store.filterCategory],
  async () => {

    let categories = store.categories
    if (store.filterCategory) {
      categories = _.filter(categories, (c) => c.key === store.filterCategory)
    }

    let newPlotData = []
    for (let category of categories) {
      if (category.key === 'X') {
        continue
      }
      let dataset = {
        x: [],
        y: [],
        type: 'scatter',
        name: category.key + ' - ' + category.desc
      }
      let cumul = 0
      for (let row of store.rows) {
        if (row[4] === category.key) {
          dataset.x.push(row[1])
          cumul += row[3]
          dataset.y.push(cumul)
        }
      }
      newPlotData.push(dataset)
    }

    plotData.value = newPlotData

    // wait for plotly to ingest data
    await sleep(100)
    const dev = document.getElementById(vuePlotlyEl.value.plotlyId)
    dev.on('plotly_click', (data) => {
      const point = data.points[0]
      store.clickTransaction = { time: point.x, category: point.data.name.split(' ')[0] }
    })
  }
)
</script>

<style scoped></style>

<template>
  <VuePlotly ref="vuePlotlyEl" :data="plotData" :layout="layout"></VuePlotly>
</template>