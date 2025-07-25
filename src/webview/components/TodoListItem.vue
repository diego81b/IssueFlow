<template>
  <div class="border rounded p-4 hover:bg-gray-50 transition-colors">
    <div class="flex items-center space-x-3">
      <input 
        type="checkbox" 
        :checked="todo.selected" 
        @change="$emit('toggle', todo.id)" 
        class="w-4 h-4"
      />
      <div class="flex-1 min-w-0">
        <!-- contenuto del TODO a sinistra, badge a destra -->
        <div class="flex items-center justify-between mb-2 min-w-0">
          <p class="uppercase font-bold text-gray-800 flex-1 mr-3 truncate">{{ todo.content }}</p>
          <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex-shrink-0">
            {{ TODO_TYPE_LABELS[todo.type] }}
          </span>
        </div>

        <!-- Sezione descrizione (solo se selezionato o se ha già una descrizione) -->
        <div v-show="todo.selected || todo.description" class="mb-2">
          <label class="block text-xs font-medium text-gray-700 mb-1">Descrizione dettagliata:</label>
          <textarea 
            :value="todo.description"
            :disabled="!todo.selected"
            @input="$emit('updateDescription', todo.id, ($event.target as HTMLTextAreaElement)?.value || '')"
            class="w-full text-sm text-gray-700 bg-blue-50 p-2 rounded border-l-4 border-blue-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            rows="3"
            :placeholder="todo.description || 'Aggiungi una descrizione dettagliata per questo TODO...'"
          ></textarea>
        </div>

        <!-- nome file e linea -->
        <p class="text-xs text-gray-500 mb-2">
          {{ getFileName(todo.file) }}:{{ todo.line }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '../types/TodoItem'
import { TODO_TYPE_LABELS } from '../types/TodoType'

defineProps<{
  todo: TodoItem
}>()

const getFileName = (filePath: string) => {
  return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
}

defineEmits<{
  toggle: [id: string]
  updateDescription: [id: string, description: string]
}>()
</script>
