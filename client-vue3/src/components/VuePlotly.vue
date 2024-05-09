<template>
  <div ref="container" :id="plotlyId"></div>
</template>

<script setup>
import { v4 as uuidv4 } from 'uuid'
import Plotly from 'plotly.js-dist'
import { defineEmits, defineProps, onBeforeUnmount, ref, watchEffect } from 'vue'

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
let plot = null
let resizeObserver = null

function debounce(func, timeout = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

function resize() {
  Plotly.Plots.resize(container.value)
}

function react() {
  Plotly.react(plotlyId.value, props.data, props.layout, props.config)
}

function init(div) {
  plot = Plotly.newPlot(div.id, props.data, props.layout, props.config)
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
  resizeObserver = new ResizeObserver(debounce(resize, 50))
  resizeObserver.observe(div)
}

onBeforeUnmount(() => {
  resizeObserver.disconnect()
})

watchEffect(() => {
  if (plot) {
    react()
  } else if (container.value) {
    init(container.value)
  }
})
</script>