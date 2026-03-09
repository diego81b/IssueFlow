<template>
  <div class="card bg-neutral-800 shadow-lg h-full flex flex-col relative">
    <div class="card-body flex-1 flex flex-col">

      <!-- Header + selects -->
      <div class="flex-none">
        <div class="flex items-center space-x-2 mb-4">
          <PlusCircleIcon class="h-6 w-6 text-primary" />
          <h2 class="card-title">Crea Issue</h2>
        </div>
        <p class="text-base-content/70 mb-6">Seleziona la piattaforma e il repository dove creare le issue per i TODO selezionati.</p>

        <div class="flex flex-col gap-4 flex-none z-10">
          <div class="form-control">
            <label class="label mb-2"><span class="label-text font-medium">Piattaforma</span></label>
            <select
              :value="selectedPlatform"
              @change="$emit('platformChange', ($event.target as HTMLSelectElement).value)"
              :disabled="noTodosSelected || (!(authStatus?.github) && !(authStatus?.gitlab))"
              class="select select-bordered w-full"
            >
              <option value="">Seleziona piattaforma</option>
              <option value="github" :disabled="!authStatus?.github">GitHub {{ !authStatus?.github ? '(non autenticato)' : '' }}</option>
              <option value="gitlab" :disabled="!authStatus?.gitlab">GitLab {{ !authStatus?.gitlab ? '(non autenticato)' : '' }}</option>
            </select>
            <label v-if="!noTodosSelected && selectedPlatform && authStatus && !((authStatus as any)[selectedPlatform])" class="label">
              <span class="label-text-alt text-error">
                <ExclamationTriangleIcon class="h-3 w-3 inline mr-1" />
                Devi autenticarti su {{ selectedPlatform }} per creare issue.
              </span>
            </label>
          </div>

          <div class="form-control">
            <label class="label mb-2">
              <span class="label-text font-medium">Repository</span>
              <span v-if="reposLoading" class="label-text-alt ml-2 text-sm text-neutral-content/60">
                <span class="loading loading-spinner loading-xs inline-block mr-2"></span>
                Caricamento repository...
              </span>
            </label>
            <select
              :value="selectedRepo ? JSON.stringify(selectedRepo) : ''"
              @change="$emit('repoChange', ($event.target as HTMLSelectElement).value)"
              :disabled="noTodosSelected || !selectedPlatform || reposLoading"
              class="select select-bordered w-full"
            >
              <option value="" disabled>{{ repoPlaceholder }}</option>
              <option v-for="repo in repos" :key="repo.id" :value="JSON.stringify(repo)">{{ repo.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Issue Preview -->
      <div v-if="selectedRepo" class="mt-6 flex-1 overflow-y-auto space-y-3 pb-36">
        <div class="flex items-center space-x-2 mb-3">
          <EyeIcon class="h-5 w-5 text-base-content/70" />
          <h3 class="text-lg font-medium">Anteprima Issue</h3>
        </div>

        <div>
          <div v-for="todo in selectedTodos" :key="todo.id" :class="['card shadow-sm hover:shadow-md transition-shadow rounded-lg p-4 mb-3 border', getBorderClass(todo.type)]">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center space-x-2">
                <DocumentTextIcon class="h-4 w-4 flex-shrink-0" :class="getTypeIconColor(todo.type)" />
              </div>
              <div :class="['badge badge-sm flex-shrink-0', getBadgeClass(todo.type)]">{{ TODO_TYPE_LABELS[todo.type] || todo.type || 'TODO' }}</div>
            </div>

            <p class="text-sm text-base-content/80 mb-2">{{ todo.content }}</p>

            <div v-if="todo.description && todo.description !== todo.content" class="mt-2 p-3 bg-neutral-700 rounded-md text-sm text-base-content">
              <strong class="block mb-1">Descrizione dettagliata</strong>
              <div class="markdown-body" v-html="renderMarkdownToSafeHtml(todo.description)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Issues Button -->
      <div class="absolute bottom-4 left-4 right-4 z-30">
        <button @click="$emit('createIssues')" :disabled="loading || !selectedRepo || selectedTodos.length === 0" class="btn btn-soft btn-primary w-full">
          <template v-if="loading">
            <span class="loading loading-spinner loading-sm"></span>
            Creazione...
          </template>
          <template v-else>
            <PlusCircleIcon class="h-5 w-5" />
            Crea {{ selectedTodos.length }} Issue su {{ selectedPlatform }}
          </template>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '../types/TodoItem'
import type { Repository } from '../types/Repository'
import type { AuthStatus } from '../types/AuthStatus'
import { TODO_TYPE_LABELS } from '../types/TodoType'
import { PlusCircleIcon, EyeIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { renderMarkdownToSafeHtml } from '../utils/markdown'

const props = defineProps<{
  selectedTodos: TodoItem[]
  selectedPlatform: string
  selectedRepo: Repository | null
  repos: Repository[]
  authStatus: AuthStatus | null
  loading: boolean
  reposLoading?: boolean
}>()

import { computed, toRefs } from 'vue'
const { selectedTodos, selectedPlatform, selectedRepo, repos, authStatus, loading, reposLoading } = toRefs(props)

// Disable platform/repo selection unless at least one TODO is selected
const noTodosSelected = computed(() => !(selectedTodos.value && selectedTodos.value.length > 0))

const repoPlaceholder = computed(() => {
  if (reposLoading?.value) return 'Caricamento repository...'
  if (!selectedPlatform?.value) return 'Seleziona piattaforma prima'
  return repos.value.length === 0 ? 'Nessun repository trovato' : 'Seleziona repository'
})

const getBadgeClass = (type?: string) => {
  // Use the same badge mapping as TodoListItem.vue for consistency
  switch ((type || '').toLowerCase()) {
    case 'bug':
      return 'badge badge-sm badge-error'
    case 'fixme':
      return 'badge badge-sm badge-warning'
    case 'todo':
    case 'task':
      return 'badge badge-sm badge-info'
    default:
      return 'badge badge-sm badge-primary'
  }
}

const getBorderClass = (type?: string) => {
  switch ((type || '').toLowerCase()) {
    case 'todo':
      return 'border-info'
    case 'fixme':
      return 'border-warning'
    case 'bug':
      return 'border-error'
    default:
      return 'border-primary'
  }
}

const getTypeIconColor = (type?: string) => {
  switch ((type || '').toLowerCase()) {
    case 'todo':
      return 'text-info'
    case 'fixme':
      return 'text-warning'
    case 'bug':
      return 'text-error'
    default:
      return 'text-info'
  }
}

defineEmits<{
  platformChange: [platform: string]
  repoChange: [repo: string]
  createIssues: []
}>()
</script>
