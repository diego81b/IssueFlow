<template>
  <div class="bg-white rounded-lg shadow-md p-4 flex-shrink-0">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex-1">
        <h2 class="text-xl font-bold text-gray-800 mb-2">Scansione Workspace</h2>
        <p class="text-sm text-gray-600">
          Trova tutti i commenti TODO e FIXME nel tuo workspace per convertirli in issue.
        </p>
      </div>
      <div class="flex-shrink-0">
        <button 
          @click="$emit('scan')"
          :disabled="loading"
          class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span>{{ loading ? 'Scansione...' : 'Scansiona Workspace' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
}>()

defineEmits<{
  scan: []
}>()
</script>
