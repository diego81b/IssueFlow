<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
      <div :class="[
        'pointer-events-auto shadow-xl flex flex-row items-center gap-3 alert',
        type === 'success' ? 'alert-success' : '',
        type === 'info' ? 'alert-info' : '',
        type === 'error' ? 'alert-error' : ''
      ]"
  class="min-w-[300px] max-w-[90vw] mb-8">
        <span class="flex-1">{{ message }}</span>
        <button @click="close" class="btn btn-sm btn-ghost">✕</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
const props = defineProps<{
  message: string | null
  type: 'success' | 'info' | 'error'
  duration?: number // ms
}>()

const visible = ref(!!props.message)
let timer: number | null = null

const close = () => {
  visible.value = false
}

watch(() => props.message, (val) => {
  visible.value = !!val
  if (val) {
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      close()
    }, props.duration ?? 4000)
  }
})

onMounted(() => {
  if (props.message) {
    timer = window.setTimeout(() => {
      close()
    }, props.duration ?? 4000)
  }
})
</script>
