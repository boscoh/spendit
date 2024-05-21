<script setup>
import { nextTick, ref } from 'vue'
import { transactionsStore } from '../stores/transactionsStore.js'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'

const store = transactionsStore()
const props = defineProps(['text', 'handleText'])
const inputText = ref('')
const input = ref(null)
const isEdit = ref(false)
const style = 'font-size: 1.2em; font-weight: 500'

function startEdit() {
  inputText.value = props.text
  isEdit.value = true
  nextTick(() => {
    document.addEventListener('keydown', handleEscape)
    store.keyLock = true
    input.value.focus()
  })
}

function cleanup() {
  isEdit.value = false
  store.keyLock = false
  document.removeEventListener('keydown', handleEscape)
}

function handleEscape(e) {
  if (e.key === 'Escape') {
    cleanup()
  } else if (e.key === 'Enter') {
    props.handleText(inputText.value)
    cleanup()
  }
}
</script>

<style scoped></style>

<template>
  <div class="d-flex flex-row align-items-center py-2 gap-2">
    <template v-if="isEdit">
      <input
        type="text"
        :style="style"
        ref="input"
        v-model="inputText"
        @blur="cleanup"
        class="form-control"
      />
    </template>
    <template v-else>
      <div :style="style" class="form-control" @click="startEdit">{{ props.text }}</div>
      <FontAwesomeIcon class="text-black-50" :icon="faPen"></FontAwesomeIcon>
    </template>
  </div>
</template>