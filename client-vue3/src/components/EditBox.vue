<script setup>
import { ref } from 'vue'
import { transactionsStore } from '../stores/transactionsStore.js'

const store = transactionsStore()
const props = defineProps(['text', 'handleText'])
const newInput = ref('')
const inputRef = ref(null)
const isEdit = ref(false)
const style = 'font-size: 1.2em; font-weight: 500'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function startEdit() {
  newInput.value = props.text
  isEdit.value = true
  await sleep(200)
  inputRef.value.focus()
  document.addEventListener('keydown', handleEscape)
  store.keyLock = true
}

function cleanup() {
  isEdit.value = false
  store.keyLock = false
  document.removeEventListener('keydown', handleEscape)
}

function handleEscape(e) {
  if (e.key === 'Escape') {
    cleanup()
  }
}

async function submitText() {
  cleanup()
  props.handleText(newInput.value)
}
</script>

<style scoped></style>

<template>
  <div class="d-flex flex-row align-items-center py-2 gap-2">
    <template v-if="isEdit">
      <input
        type="text"
        :style="style"
        ref="inputRef"
        v-model="newInput"
        @blur="cleanup"
        class="form-control"
      />
      <button class="btn btn-outline-primary" @click="submitText">Rename</button>
    </template>
    <template v-else>
      <div :style="style" class="form-control" @click="startEdit">{{ props.text }}</div>
    </template>
  </div>
</template>