<script setup>
import { index } from '../stores/index.js'
import { VuePlotly } from 'vue3-plotly'
import { ref, watch } from 'vue'
import { remote } from '../../../rpc/rpc.js'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const store = index()

const vuePlotlyEl = ref(null)
const plotData = ref([])

const config = {}

// remove space for title
const layout = {
  margin: {
    l: 50,
    r: 50,
    b: 50,
    t: 50,
    pad: 4
  },
  height: 320,
  title: '',
  hovermode: 'closest',
  clickmode: 'event'
}

const descByCategory = {}
const categories = []

watch(
  () => store.updateCount,
  async () => {
    console.log('CategoryPlot: store.data changed')

    if (!categories.length) {
      let response = await remote.get_categories()
      const categorySets = response.result
      for (let categorySet of categorySets) {
        descByCategory[categorySet.key] = categorySet.desc
        categories.push(categorySet.key)
      }
    }

    let newPlotData = []
    for (let category of categories) {
      if (category === 'X') {
        continue
      }
      let dataset = {
        x: [],
        y: [],
        type: 'scatter',
        name: category + ' - ' + descByCategory[category]
      }
      let cumul = 0
      for (let row of store.rows) {
        if (row[4] === category) {
          dataset.x.push(row[1])
          cumul += row[3]
          dataset.y.push(cumul)
        }
      }
      newPlotData.push(dataset)
    }
    plotData.value = newPlotData

    const plotlyId = vuePlotlyEl.value.plotlyId
    const plotlyDiv = document.getElementById(plotlyId)
    sleep(100)
    plotlyDiv.on('plotly_click', (data) => {
      console.log(data)
    })
  }
)
</script>

<style scoped></style>

<template>
  <VuePlotly ref="vuePlotlyEl" :data="plotData" :layout="layout" :config="config"></VuePlotly>
</template>