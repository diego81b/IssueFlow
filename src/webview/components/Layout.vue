<template>
  <div class="h-screen flex flex-col">
    <Header />
    <!-- Main Content -->
    <main class="flex-1 overflow-hidden p-2">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
</script>
