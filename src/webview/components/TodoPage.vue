<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Scan Section -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Scansione Workspace</h2>
      <p class="text-gray-600 mb-4">
        Trova tutti i commenti TODO e FIXME nel tuo workspace per convertirli in issue.
      </p>
      
      <button 
        @click="scanTodos"
        :disabled="loadingScan"
        class="bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg v-if="loadingScan" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span>{{ loadingScan ? 'Scansione...' : 'Scansiona Workspace' }}</span>
      </button>
    </div>
    
    <!-- TODO List Section -->
    <div v-if="(todos ?? []).length > 0" class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800">TODO Trovati</h2>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{ (todos ?? []).length }} elementi trovati</span>
          <div class="flex space-x-2">
            <button 
              @click="selectAllTodos"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              Seleziona tutti
            </button>
            <button 
              @click="deselectAllTodos"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              Deseleziona tutti
            </button>
          </div>
        </div>
      </div>

      <!-- TODO Controls -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded mb-4">
        <span class="text-sm text-gray-600">
          {{ selectedTodos.length }} di {{ (todos ?? []).length }} selezionati
        </span>
        <div class="flex items-center space-x-4">
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="showOnlySelected" class="rounded">
            <span class="text-sm text-gray-600">Mostra solo selezionati</span>
          </label>
        </div>
      </div>

      <!-- TODO List -->
      <div class="max-h-96 overflow-y-auto space-y-2">
        <div 
          v-for="todo in filteredTodos" 
          :key="todo.id"
          class="border rounded p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start space-x-3">
            <input 
              type="checkbox" 
              :checked="todo.selected"
              @change="toggleTodo(todo.id)"
              class="mt-1 rounded"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-sm font-medium text-gray-800">{{ getFileName(todo.file) }}</span>
                <span class="text-xs text-gray-500">linea {{ todo.line }}</span>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {{ todo.content.includes('FIXME') ? 'FIXME' : 'TODO' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                {{ todo.fullLine.trim() }}
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ todo.file }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No TODOs Found -->
    <div v-else-if="!loading && hasScanned" class="bg-white rounded-lg shadow-md p-6 text-center">
      <div class="text-gray-400 text-6xl mb-4">📝</div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">Nessun TODO trovato</h3>
      <p class="text-gray-600">
        Non sono stati trovati commenti TODO o FIXME nel workspace corrente.
      </p>
    </div>

    <!-- Issue Creation Section -->
    <div v-if="selectedTodos.length > 0" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Crea Issue</h2>
      <p class="text-gray-600 mb-6">
        Seleziona la piattaforma e il repository dove creare le issue per i TODO selezionati.
      </p>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Platform Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Piattaforma</label>
          <select 
            v-model="selectedPlatform"
            @change="loadRepos"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleziona piattaforma</option>
            <option value="github" :disabled="!(authStatus ?? {}).github">
              GitHub {{ !(authStatus ?? {}).github ? '(non autenticato)' : '' }}
            </option>
            <option value="gitlab" :disabled="!(authStatus ?? {}).gitlab">
              GitLab {{ !(authStatus ?? {}).gitlab ? '(non autenticato)' : '' }}
            </option>
          </select>
          <p v-if="selectedPlatform && !(authStatus && (authStatus as Record<string, boolean>)[selectedPlatform])"
             class="text-xs text-red-600 mt-2">
            Devi autenticarti su {{ selectedPlatform }} per creare issue.
          </p>
        </div>

        <!-- Repo Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Repository</label>
          <select 
            v-model="selectedRepo"
            :disabled="!selectedPlatform || (repos ?? []).length === 0"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              {{ (repos ?? []).length === 0 ? 'Nessun repository disponibile' : 'Seleziona repository' }}
            </option>
            <option v-for="repo in repos ?? []" :key="repo.id" :value="repo">
              {{ repo.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Create Issues Button -->
      <div class="mt-6">
        <button 
          @click="createIssues"
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
                {{ todo.content.includes('FIXME') ? 'FIXME' : 'TODO' }}
              </span>
            </div>
            <p class="text-sm text-gray-600">{{ todo.content }}</p>
          </div>
          <p v-if="selectedTodos.length > 3" class="text-sm text-gray-500 text-center">
            ... e altre {{ selectedTodos.length - 3 }} issue
          </p>
        </div>
      </div>
    </div>

    <!-- Local Message -->
    <div v-if="localMessage" :class="{
      'bg-green-50 text-green-800 border-green-200': localMessageType === 'success',
      'bg-blue-50 text-blue-800 border-blue-200': localMessageType === 'info',
      'bg-red-50 text-red-800 border-red-200': localMessageType === 'error',
    }"
    class="border rounded-lg p-4 mb-4">
      {{ localMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import type { AppState } from '../composables/useAppState'
import type { TodoItem } from '../types/TodoItem'
import type { Repository } from '../types/Repository'

const appState = inject<AppState>('appState')
const {
  todos,
  authStatus,
  loading,
  selectedPlatform,
  selectedRepo,
  repos,
  vscode
} = appState ?? {
  todos: ref<TodoItem[]>([]),
  authStatus: ref({ github: false, gitlab: false }),
  loading: ref(false),
  selectedPlatform: ref(''),
  selectedRepo: ref<Repository | null>(null),
  repos: ref<Repository[]>([]),
  vscode: { postMessage: () => {} }
}

// Local state
const showOnlySelected = ref(false)
const hasScanned = ref(false)
const localMessage = ref('')
const localMessageType = ref<'success' | 'error' | 'info'>('info')
const loadingScan = ref(false)

// Local computed
const selectedTodos = computed(() => (todos.value ?? []).filter(todo => todo.selected))
const filteredTodos = computed(() => {
  return showOnlySelected.value 
    ? (todos.value ?? []).filter(todo => todo.selected)
    : (todos.value ?? [])
})

const showLocalMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
  localMessage.value = text
  localMessageType.value = type
  setTimeout(() => {
    localMessage.value = ''
  }, 4000)
}

const getFileName = (filePath: string) => {
  return filePath.split(/[\\/]/).pop() || filePath
}

const scanTodos = () => {
  loadingScan.value = true
  hasScanned.value = true
  vscode.postMessage({ type: 'scanTodos' })
}

// Ricevi messaggio di fine scansione (aggiungi questo listener se non già presente)
window.addEventListener('message', event => {
  const message = event.data
  if (message.type === 'scanTodosDone') {
    loadingScan.value = false
  }
})

const toggleTodo = (todoId: string) => {
  const todo = (todos.value ?? []).find(t => t.id === todoId)
  if (todo) {
    todo.selected = !todo.selected
  }
  vscode.postMessage({ type: 'toggleTodo', todoId })
}

const selectAllTodos = () => {
  (todos.value ?? []).forEach(todo => todo.selected = true)
  vscode.postMessage({ type: 'selectAllTodos' })
}

const deselectAllTodos = () => {
  (todos.value ?? []).forEach(todo => todo.selected = false)
  vscode.postMessage({ type: 'deselectAllTodos' })
}

const loadRepos = () => {
  console.log('loadRepos called, selectedPlatform:', selectedPlatform.value)
  console.log('Current auth status:', authStatus.value)
  
  if (!selectedPlatform.value) {
    console.log('No platform selected, returning')
    return
  }
  
  // Check if user is authenticated for the selected platform
  if (selectedPlatform.value === 'github' && !(authStatus.value ?? { github: false }).github) {
    console.log('GitHub not authenticated, cannot load repos')
    showLocalMessage('Devi prima effettuare il login su GitHub', 'error')
    selectedPlatform.value = '' // Reset selection
    return
  }
  
  if (selectedPlatform.value === 'gitlab' && !(authStatus.value ?? { gitlab: false }).gitlab) {
    console.log('GitLab not authenticated, cannot load repos')
    showLocalMessage('Devi prima effettuare il login su GitLab', 'error')
    selectedPlatform.value = '' // Reset selection
    return
  }
  
  loading.value = true
  repos.value = []
  selectedRepo.value = null
  
  if (selectedPlatform.value === 'github') {
    console.log('Requesting GitHub repos...')
    vscode.postMessage({ type: 'getGithubRepos' })
  } else if (selectedPlatform.value === 'gitlab') {
    console.log('Requesting GitLab repos...')
    vscode.postMessage({ type: 'getGitlabRepos' })
  }
}

const createIssues = () => {
  console.log('createIssues called with:', {
    selectedRepo: selectedRepo.value,
    selectedTodos: selectedTodos.value,
    selectedPlatform: selectedPlatform.value
  })
  
  if (!selectedRepo.value || selectedTodos.value.length === 0) {
    console.warn('Cannot create issues: missing repo or todos')
    showLocalMessage('Seleziona almeno un TODO e un repository', 'error')
    return
  }
  
  loading.value = true
  console.log('Sending createIssues message...')
  
  // Create a clean serializable repository object
  const repoData = {
    id: selectedRepo.value.id,
    name: selectedRepo.value.name,
    full_name: selectedRepo.value.full_name,
    path_with_namespace: selectedRepo.value.path_with_namespace
  }
  
  // Create clean serializable todos array
  const todosData = selectedTodos.value.map(todo => ({
    id: todo.id,
    file: todo.file,
    line: todo.line,
    content: todo.content,
    fullLine: todo.fullLine,
    selected: todo.selected
  }))
  
  console.log('Repo data to send:', repoData)
  console.log('Todos data to send:', todosData)
  
  vscode.postMessage({
    type: 'createIssues',
    platform: selectedPlatform.value,
    repo: repoData,
    todos: todosData
  })
}
</script>
