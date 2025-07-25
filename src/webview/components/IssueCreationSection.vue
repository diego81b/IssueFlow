<template>
  <div class="bg-white rounded-lg shadow-md p-6 flex-shrink-0">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Crea Issue</h2>
    <p class="text-gray-600 mb-6">
      Seleziona la piattaforma e il repository dove creare le issue per i TODO selezionati.
    </p>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Platform Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Piattaforma</label>
        <select 
          :value="selectedPlatform"
          @change="$emit('platformChange', ($event.target as HTMLSelectElement).value)"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Seleziona piattaforma</option>
          <option value="github" :disabled="!authStatus?.github">
            GitHub {{ !authStatus?.github ? '(non autenticato)' : '' }}
          </option>
          <option value="gitlab" :disabled="!authStatus?.gitlab">
            GitLab {{ !authStatus?.gitlab ? '(non autenticato)' : '' }}
          </option>
        </select>
        <p v-if="selectedPlatform && authStatus && !((authStatus as any)[selectedPlatform])"
           class="text-xs text-red-600 mt-2">
          Devi autenticarti su {{ selectedPlatform }} per creare issue.
        </p>
      </div>

      <!-- Repo Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Repository</label>
        <select 
          :value="selectedRepo"
          @change="$emit('repoChange', ($event.target as HTMLSelectElement).value)"
          :disabled="!selectedPlatform || repos.length === 0"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Creazione...' : `Crea ${selectedTodos.length} Issue su ${selectedPlatform}` }}
      </button>
    </div>

    <!-- Issue Preview -->
    <div v-if="selectedRepo && selectedTodos.length > 0" class="mt-6">
      <h3 class="text-lg font-medium text-gray-800 mb-3">Anteprima Issue</h3>
      <div class="max-h-48 overflow-y-auto space-y-2">
        <div 
          v-for="todo in selectedTodos.slice(0, 3)" 
          :key="todo.id"
          class="bg-gray-50 border rounded-lg p-3"
        >
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-sm font-medium">{{ getFileName(todo.file) }}:{{ todo.line }}</span>
            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {{ TODO_TYPE_LABELS[todo.type] || todo.type || 'TODO' }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-1">{{ todo.content }}</p>
          <div v-if="todo.description && todo.description !== todo.content" class="text-xs text-gray-500 bg-white p-2 rounded">
            <strong>Descrizione:</strong> {{ todo.description }}
          </div>
        </div>
        <p v-if="selectedTodos.length > 3" class="text-sm text-gray-500 text-center">
          ... e altre {{ selectedTodos.length - 3 }} issue
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '../types/TodoItem'
import type { Repository } from '../types/Repository'
import type { AuthStatus } from '../types/AuthStatus'
import { TODO_TYPE_LABELS } from '../types/TodoType'

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
