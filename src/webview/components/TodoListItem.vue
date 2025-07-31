<template>
  <div class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
    <div class="card-body p-4">
      <div class="flex items-center space-x-3">
        <input 
          type="checkbox" 
          :checked="todo.selected" 
          @change="$emit('toggle', todo.id)" 
          class="checkbox checkbox-primary"
        />
        <div class="flex-1 min-w-0">
          <!-- contenuto del TODO a sinistra, badge a destra -->
          <div class="flex items-center justify-between mb-2 min-w-0">
            <div class="flex items-center space-x-2 flex-1 mr-3">
              <component :is="getTypeIcon(todo.type)" class="h-4 w-4 flex-shrink-0" :class="getTypeIconColor(todo.type)" />
              <p class="uppercase font-bold text-base-content truncate">{{ todo.content }}</p>
            </div>
            <div class="badge badge-primary badge-sm flex-shrink-0">
              {{ TODO_TYPE_LABELS[todo.type] }}
            </div>
          </div>

          <!-- Sezione descrizione (solo se selezionato o se ha già una descrizione) -->
          <div class="mb-2">
            <label class="label">
              <span class="label-text text-xs font-medium">Descrizione dettagliata:</span>
            </label>
            <textarea 
              :value="todo.description"
              :disabled="!todo.selected"
              @input="$emit('updateDescription', todo.id, ($event.target as HTMLTextAreaElement)?.value || '')"
              class="textarea textarea-bordered w-full text-sm resize-none focus:textarea-primary disabled:bg-base-200 disabled:text-base-content/50"
              rows="3"
              :placeholder="todo.description || 'Aggiungi una descrizione dettagliata per questo TODO...'"
            ></textarea>
          </div>

          <!-- nome file e linea -->
          <div class="flex items-center space-x-2 text-xs text-base-content/60">
            <DocumentTextIcon class="h-3 w-3" />
            <span>{{ getFileName(todo.file) }}:{{ todo.line }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '../types/TodoItem'
import { TODO_TYPE_LABELS, TodoType } from '../types/TodoType'
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  BugAntIcon,
  DocumentTextIcon 
} from '@heroicons/vue/24/outline'

defineProps<{
  todo: TodoItem
}>()

const getFileName = (filePath: string) => {
  return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
}

const getTypeIcon = (type: TodoType) => {
  switch (type) {
    case TodoType.TODO:
      return InformationCircleIcon
    case TodoType.FIXME:
      return ExclamationTriangleIcon
    case TodoType.BUG:
      return BugAntIcon
    default:
      return InformationCircleIcon
  }
}

const getTypeIconColor = (type: TodoType) => {
  switch (type) {
    case TodoType.TODO:
      return 'text-info'
    case TodoType.FIXME:
      return 'text-warning'
    case TodoType.BUG:
      return 'text-error'
    default:
      return 'text-info'
  }
}

defineEmits<{
  toggle: [id: string]
  updateDescription: [id: string, description: string]
}>()
</script>
