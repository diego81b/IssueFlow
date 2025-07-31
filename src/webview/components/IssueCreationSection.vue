<template>
  <div class="card bg-base-100 shadow-lg flex-shrink-0">
    <div class="card-body">
      <div class="flex items-center space-x-2 mb-4">
        <PlusCircleIcon class="h-6 w-6 text-primary" />
        <h2 class="card-title">Crea Issue</h2>
      </div>
      <p class="text-base-content/70 mb-6">
        Seleziona la piattaforma e il repository dove creare le issue per i TODO selezionati.
      </p>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Platform Selection -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Piattaforma</span>
          </label>
          <select 
            :value="selectedPlatform"
            @change="$emit('platformChange', ($event.target as HTMLSelectElement).value)"
            class="select select-bordered w-full"
          >
            <option value="">Seleziona piattaforma</option>
            <option value="github" :disabled="!authStatus?.github">
              <div class="flex items-center space-x-2">
                GitHub {{ !authStatus?.github ? '(non autenticato)' : '' }}
              </div>
            </option>
            <option value="gitlab" :disabled="!authStatus?.gitlab">
              GitLab {{ !authStatus?.gitlab ? '(non autenticato)' : '' }}
            </option>
          </select>
          <label v-if="selectedPlatform && authStatus && !((authStatus as any)[selectedPlatform])" class="label">
            <span class="label-text-alt text-error">
              <ExclamationTriangleIcon class="h-3 w-3 inline mr-1" />
              Devi autenticarti su {{ selectedPlatform }} per creare issue.
            </span>
          </label>
        </div>

        <!-- Repo Selection -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Repository</span>
          </label>
          <select 
            :value="selectedRepo"
            @change="$emit('repoChange', ($event.target as HTMLSelectElement).value)"
            :disabled="!selectedPlatform || repos.length === 0"
            class="select select-bordered w-full"
          >
            <option value="" disabled>
              {{ repos.length === 0 ? 'Nessun repository disponibile' : 'Seleziona repository' }}
            </option>
            <option v-for="repo in repos" :key="repo.id" :value="JSON.stringify(repo)">
              {{ repo.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Create Issues Button -->
      <div class="mt-6">
        <button 
          @click="$emit('createIssues')"
          :disabled="loading || !selectedRepo || selectedTodos.length === 0"
          class="btn btn-success w-full"
        >
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

      <!-- Issue Preview -->
      <div v-if="selectedRepo && selectedTodos.length > 0" class="mt-6">
        <div class="flex items-center space-x-2 mb-3">
          <EyeIcon class="h-5 w-5 text-base-content/70" />
          <h3 class="text-lg font-medium">Anteprima Issue</h3>
        </div>
        <div class="max-h-48 overflow-y-auto space-y-2">
          <div 
            v-for="todo in selectedTodos.slice(0, 3)" 
            :key="todo.id"
            class="card bg-base-200 shadow-sm"
          >
            <div class="card-body p-3">
              <div class="flex items-center space-x-2 mb-1">
                <DocumentTextIcon class="h-4 w-4 text-base-content/60" />
                <span class="text-sm font-medium">{{ getFileName(todo.file) }}:{{ todo.line }}</span>
                <div class="badge badge-primary badge-sm">
                  {{ TODO_TYPE_LABELS[todo.type] || todo.type || 'TODO' }}
                </div>
              </div>
              <p class="text-sm text-base-content/80 mb-1">{{ todo.content }}</p>
              <div v-if="todo.description && todo.description !== todo.content" class="text-xs text-base-content/60 bg-base-100 p-2 rounded">
                <strong>Descrizione:</strong> {{ todo.description }}
              </div>
            </div>
          </div>
          <p v-if="selectedTodos.length > 3" class="text-sm text-base-content/60 text-center">
            ... e altre {{ selectedTodos.length - 3 }} issue
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '../types/TodoItem'
import type { Repository } from '../types/Repository'
import type { AuthStatus } from '../types/AuthStatus'
import { TODO_TYPE_LABELS } from '../types/TodoType'
import { 
  PlusCircleIcon, 
  EyeIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon 
} from '@heroicons/vue/24/outline'

defineProps<{
  selectedTodos: TodoItem[]
  selectedPlatform: string
  selectedRepo: Repository | null
  repos: Repository[]
  authStatus: AuthStatus | null
  loading: boolean
}>()

const getFileName = (filePath: string) => {
  return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
}

defineEmits<{
  platformChange: [platform: string]
  repoChange: [repo: string]
  createIssues: []
}>()
</script>
