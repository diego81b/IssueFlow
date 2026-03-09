<template>
  <div :class="['card shadow-sm hover:shadow-md transition-shadow rounded-lg p-4 border', getBorderClass(todo.type)]">
    <div class="flex items-center space-x-3">
      <input type="checkbox" :checked="todo.selected" @change="$emit('toggle', todo.id)"
        :class="['checkbox', getCheckboxClass(todo.type)]" />
      <div class="flex-1 min-w-0">
        <!-- contenuto del TODO a sinistra, badge a destra -->
        <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2 flex-1 min-w-0 mr-3">
            <component :is="getTypeIcon(todo.type)" class="h-4 w-4 flex-shrink-0"
              :class="getTypeIconColor(todo.type)" />
            <p class="uppercase font-bold text-base-content whitespace-normal break-words" :title="todo.content" v-html="highlightHtml(displayContent(todo.content), filter)"></p>
          </div>
          <div :class="['badge badge-sm flex-shrink-0', getBadgeClass(todo.type)]">
            {{ TODO_TYPE_LABELS[todo.type] }}
          </div>
        </div>

        <!-- Sezione descrizione (solo se selezionato o se ha già una descrizione) -->
        <div class="mb-2">
          <label class="label mb-2">
            <span class="label-text text-xs font-medium">Descrizione dettagliata:</span>
          </label>
          <textarea :value="todo.description" :disabled="!todo.selected"
            @input="$emit('updateDescription', todo.id, ($event.target as HTMLTextAreaElement)?.value || '')"
            class="textarea w-full text-sm resize-none disabled:bg-neutral-800 disabled:text-base-content/50"
            rows="3"
            :placeholder="todo.description || 'Aggiungi una descrizione dettagliata per questo TODO...'"></textarea>
        </div>

        <!-- nome file e linea -->
        <div class="flex items-center space-x-2 text-xs text-base-content/60">
          <DocumentTextIcon class="h-3 w-3" />
          <span class="break-words whitespace-normal max-w-full">{{ getFileName(todo.file) }}:{{ todo.line }}</span>
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
  filter?: string | null
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

const getBorderClass = (type: TodoType) => {
  switch (type) {
    case TodoType.TODO:
      return 'border-info'
    case TodoType.FIXME:
      return 'border-warning'
    case TodoType.BUG:
      return 'border-error'
    default:
      return 'border-primary'
  }
}

const getBadgeClass = (type: TodoType) => {
  switch (type) {
    case TodoType.TODO:
      return 'badge-info'
    case TodoType.FIXME:
      return 'badge-warning'
    case TodoType.BUG:
      return 'badge-error'
    default:
      return 'badge-primary'
  }
}

const getCheckboxClass = (type: TodoType) => {
  switch (type) {
    case TodoType.TODO:
      return 'checkbox-info'
    case TodoType.FIXME:
      return 'checkbox-warning'
    case TodoType.BUG:
      return 'checkbox-error'
    default:
      return 'checkbox-primary'
  }
}

// Highlight helper: returns escaped HTML with <mark> wrapping matched substrings
const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const highlightHtml = (text: string | undefined, query: string | null | undefined) => {
  const t = String(text || '')
  if (!query) return escapeHtml(t)
  try {
    const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex
    const re = new RegExp(`(${q})`, 'ig')
  return escapeHtml(t).replace(re, '<mark class="bg-primary text-primary-content rounded px-1">$1</mark>')
  } catch (e) {
    return escapeHtml(t)
  }
}

defineEmits<{
  toggle: [id: string]
  updateDescription: [id: string, description: string]
}>()

// Remove leading TODO/FIXME/BUG label from displayed content since we already show a badge
const displayContent = (content: string | undefined) => {
  const raw = String(content || '')
  // remove leading patterns like: TODO:, TODO - , FIXME:, BUG
  return raw.replace(/^\s*(?:TODO|FIXME|BUG)[:\s-]*\s*/i, '').trim()
}
</script>
