<template>
  <div class="bg-neutral-800 rounded-lg shadow-md p-4 flex-shrink-0">
    <div class="flex items-center gap-2">
      <input
        ref="inputRef"
        v-model="filter"
        @keyup.enter="emitScan"
        type="text"
        placeholder="Filtra per testo TODO..."
        class="input input-md w-full h-10"
        aria-label="Filtro TODO"
      />
      <button @click="emitScan" :disabled="loading" class="btn btn-md btn-soft btn-primary h-10">
        <span>{{ loading ? 'Searching...' : 'Search' }}</span>
      </button>
      <button v-if="filter" @click="clearFilter" class="btn btn-md btn-ghost h-10">
        Annulla filtro
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{ loading: boolean }>()
const emit = defineEmits<{
  (e: 'scan', filter?: string): void
}>()

const filter = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function emitScan() {
  const value = filter.value && filter.value.trim().length > 0 ? filter.value.trim() : undefined
  emit('scan', value)
}

function clearFilter() {
  filter.value = ''
  emit('scan', undefined)
  // focus the input for convenience
  inputRef.value?.focus()
}

onMounted(() => {
  // optional: autofocus the input when mounted
  // inputRef.value?.focus()
})
</script>
