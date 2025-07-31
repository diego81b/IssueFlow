<template>
  <div class="min-h-screen">
    <Header />
    <!-- Main Content -->
    <main class="p-6 bg-base-100">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
</script>
