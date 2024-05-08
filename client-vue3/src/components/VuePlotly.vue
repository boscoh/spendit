<template>
  <div ref="container" :id="plotlyId"></div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import Plotly from 'plotly.js-dist'

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

let timeOutFunctionId

export default {
  name: 'VuePlotly',

  data() {
    return {
      plotlyId: `plotly-${uuidv4()}`
    }
  },

  props: ['data', 'layout', 'config'],

  watch: {
    data() {
      this.reactPlot()
    },
    layout() {
      this.reactPlot()
    },
    config() {
      this.reactPlot()
    }
  },

  emits: events,

  mounted() {
    Plotly.newPlot(this.plotlyId, this.data, this.layout, this.config)

    events.forEach((name) => {
      this.$refs.container.on(name, (...args) => this.$emit(name, ...args))
    })

    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeOutFunctionId) // debounce the reset
      timeOutFunctionId = setTimeout(this.reactPlot, 100)
    })
    this.resizeObserver.observe(document.getElementById(this.plotlyId))
  },

  beforeUnmount() {
    this.resizeObserver.disconnect()
  },

  methods: {
    reactPlot() {
      Plotly.react(this.plotlyId, this.data, this.layout, this.config)
    }
  }
}
</script>