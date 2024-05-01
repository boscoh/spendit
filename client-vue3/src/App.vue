<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'

</script>

<template>
  <div class="d-flex flex-column">
    <nav-bar />
    <RouterView />
  </div>
</template>

<style scoped></style>