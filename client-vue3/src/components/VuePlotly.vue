<template>
  <div ref="container" :id="plotlyId"></div>
</template>

<script setup>
import { v4 as uuidv4 } from 'uuid'
import Plotly from 'plotly.js-dist'
import { onBeforeUnmount, ref, watchEffect } from 'vue'

const props = defineProps(['data', 'layout', 'config'])
const emit = defineEmits([
  'plotly_click',
  'plotly_hover',
  'plotly_unhover',
  'plotly_selecting',
  'plotly_selected',
  'plotly_restyle',
  'plotly_relayout',
  'plotly_autosize',
  'plotly_deselect',
  'plotly_doubleclick',
  'plotly_redraw',
  'plotly_animated',
  'plotly_afterplot'
])
let plotlyId = ref(`plotly-${uuidv4()}`)
let container = ref(null)
let isRendered = false
let resizeObserver = null

function debounce(func, timeout = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => func(...args), timeout)
  }
}

const resize = debounce(() => Plotly.Plots.resize(container.value), 50)

function update() {
  Plotly.react(plotlyId.value, props.data, props.layout, props.config)
}

async function render() {
  const div = await Plotly.newPlot(plotlyId.value, props.data, props.layout, props.config)
  const events = [
    'plotly_click',
    'plotly_hover',
    'plotly_unhover',
    'plotly_selecting',
    'plotly_selected',
    'plotly_restyle',
    'plotly_relayout',
    'plotly_autosize',
    'plotly_deselect',
    'plotly_doubleclick',
    'plotly_redraw',
    'plotly_animated',
    'plotly_afterplot'
  ]
  events.forEach((name) => div.on(name, (...args) => emit(name, ...args)))
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(div)
}

watchEffect(() => {
  if (container.value) {
    if (!isRendered) {
      render()
      isRendered = true
    } else {
      update()
    }
  }
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
})

function downloadImage(imageProps = { format: 'png', width: 800, height: 600, filename: 'plot' }) {
  Plotly.downloadImage(container.value, imageProps)
}

defineExpose({ plotlyId, render, update, resize, downloadImage })
</script>