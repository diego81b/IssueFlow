<template>
  <div v-if="message" :class="{
    'bg-green-50 text-green-800 border-green-200': type === 'success',
    'bg-blue-50 text-blue-800 border-blue-200': type === 'info',
    'bg-red-50 text-red-800 border-red-200': type === 'error',
  }"
  class="border rounded-lg p-4 mb-4 flex-shrink-0">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string | null
  type: 'success' | 'info' | 'error'
}>()
</script>
