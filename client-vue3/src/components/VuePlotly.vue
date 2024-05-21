<template>
  <div ref="divRef" :id="plotlyId"></div>
</template>

<script setup>
import Plotly from 'plotly.js-dist'
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import { eventNames, functionNames } from './plotlyConstants.js'
import _ from 'lodash'

const props = defineProps(['data', 'layout', 'config'])
const emit = defineEmits(eventNames)

const plotlyId = ref(_.uniqueId('plotly-'))
const divRef = ref(null)
const resizeObserver = new ResizeObserver(_.debounce(resize, 50))
const fnByName = _.mapValues(functionNames, (functionName) => {
  const plotlyFn = Plotly[functionName]
  return (...args) => plotlyFn(divRef.value, ...args)
})

let isCreated = false

function resize() {
  Plotly.Plots.resize(divRef.value)
}

watchEffect(async () => {
  if (isCreated) {
    Plotly.react(plotlyId.value, props.data, props.layout, props.config)
  } else if (divRef.value) {
    const div = await Plotly.newPlot(plotlyId.value, props.data, props.layout, props.config)
    resizeObserver.observe(div)
    eventNames.forEach((eventName) => {
      div.on(eventName, (...args) => emit(eventName, ...args))
    })
    isCreated = true
  }
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
  Plotly.purge(divRef.value)
})

defineExpose({ plotlyId, ...fnByName })
</script>