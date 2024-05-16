<script setup>
import { transactionsStore } from '../stores/transactionsStore.js'
import VuePlotly from './VuePlotly.vue'
import { ref, watch } from 'vue'
import _ from 'lodash'

const store = transactionsStore()
const data = ref([])
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

function onClick(data) {
  const point = data.points[0]
  store.clickTransaction = { time: point.x, category: point.data.name.split(' ')[0] }
}

watch(
  () => [store.updateCount, store.categories, store.filterCategory],
  async () => {
    let categories = store.categories
    if (store.filterCategory) {
      categories = _.filter(categories, (c) => c.key === store.filterCategory)
    }

    let newData = []
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
      newData.push(dataset)
    }
    data.value = newData
  }
)
</script>

<template>
  <VuePlotly @plotly_click="onClick" :data="data" :layout="layout"></VuePlotly>
</template>