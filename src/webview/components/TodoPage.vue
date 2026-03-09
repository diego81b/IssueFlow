<template>
  <div class="flex-1 flex flex-col mx-auto space-y-4 p-4 overflow-hidden h-full">
    <!-- Two-column responsive layout: left = scan + todos, right = create issue -->
    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">

      <!-- LEFT COLUMN: Scan + TODO list -->
      <div class="flex flex-col overflow-hidden">
        <!-- Workspace Scan Section -->
        <WorkspaceScanSection 
          :loading="loadingScan"
          @scan="scanTodos"
        />

        <!-- TODO List or No Results -->
        <div class="flex-1 flex flex-col overflow-hidden mt-4">
          <TodoListSection
            v-if="appState?.todos?.value && appState.todos.value.length > 0"
            :todos="appState.todos.value"
            :selectedCount="selectedTodos.length"
            :filter="activeFilter"
            @selectAll="selectAllTodos"
            @deselectAll="deselectAllTodos"
            @toggle="toggleTodo"
            @updateDescription="updateTodoDescription"
          />

          <NoTodosFoundSection
            v-else
          />
        </div>
      </div>

      <!-- RIGHT COLUMN: Issue creation panel (always present, button disabled if no selection) -->
      <div class="flex flex-col overflow-hidden">
        <div class="h-full">
          <IssueCreationSection
            :selectedTodos="selectedTodos"
            :selectedPlatform="appState?.selectedPlatform?.value ?? ''"
            :selectedRepo="appState?.selectedRepo?.value ?? null"
            :repos="appState?.repos?.value ?? []"
            :authStatus="appState?.authStatus?.value ?? null"
            :loading="loadingCreate"
            :reposLoading="reposLoading"
            @platformChange="handlePlatformChange"
            @repoChange="handleRepoChange"
            @createIssues="createIssues"
          />
        </div>
      </div>

    </div>

    <!-- Local Message -->
    <LocalMessage
      :message="localMessage"
      :type="localMessageType"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import type { AppState } from '../composables/useAppState'
import type { TodoItem } from '../types/TodoItem'
import type { Repository } from '../types/Repository'

// Import components
import WorkspaceScanSection from './WorkspaceScanSection.vue'
import TodoListSection from './TodoListSection.vue'
import NoTodosFoundSection from './NoTodosFoundSection.vue'
import IssueCreationSection from './IssueCreationSection.vue'
import LocalMessage from './LocalMessage.vue'

const appState = inject<AppState>('appState')

// Local state
const loadingScan = ref(false)
const loadingCreate = ref(false)
const reposLoading = ref(false)
const localMessage = ref<string | null>(null)
const localMessageType = ref<'success' | 'info' | 'error'>('info')
const activeFilter = ref<string | null>(null)

// Computed properties
const selectedTodos = computed(() => {
  return (appState?.todos?.value ?? []).filter((todo: TodoItem) => todo.selected)
})

// Functions
const scanTodos = (filter?: string) => {
  if (loadingScan.value) return;
  loadingScan.value = true;
  activeFilter.value = filter && filter.trim().length > 0 ? filter.trim() : null
  const payload: any = { type: 'scanTodos' }
  if (activeFilter.value) payload.filter = activeFilter.value
  appState?.vscode.postMessage(payload)
}

const selectAllTodos = () => {
  // Gestisci direttamente nell'appState
  if (appState?.todos?.value) {
    appState.todos.value.forEach(todo => todo.selected = true)
  }
}

const deselectAllTodos = () => {
  // Gestisci direttamente nell'appState
  if (appState?.todos?.value) {
    appState.todos.value.forEach(todo => todo.selected = false)
  }
}

const toggleTodo = (todoId: string) => {
  // Gestisci direttamente nell'appState invece di passare dal provider
  if (appState?.todos?.value) {
    const todo = appState.todos.value.find(t => t.id === todoId)
    if (todo) {
      todo.selected = !todo.selected
    }
  }
}

const updateTodoDescription = (todoId: string, description: string) => {
  // Aggiorna direttamente nell'appState - niente sincronizzazione backend
  if (appState?.todos?.value) {
    const todo = appState.todos.value.find(t => t.id === todoId)
    if (todo) {
      todo.description = description
    }
  }
}

const loadRepos = () => {
  if (!appState?.vscode || !appState?.selectedPlatform?.value) return;
  const platform = appState.selectedPlatform.value;
  reposLoading.value = true
  if (platform === 'github') {
    appState.vscode.postMessage({ type: 'getGithubRepos' })
  } else if (platform === 'gitlab') {
    appState.vscode.postMessage({ type: 'getGitlabRepos' })
  }
}

const handlePlatformChange = (platform: string) => {
  if (appState?.selectedPlatform) {
    appState.selectedPlatform.value = platform
    loadRepos()
  }
}

const handleRepoChange = (repoString: string) => {
  if (appState?.selectedRepo) {
    try {
      const repo = JSON.parse(repoString) as Repository
      appState.selectedRepo.value = repo
    } catch (error) {
      console.error('Error parsing repository:', error)
    }
  }
}

const createIssues = () => {
  if (!appState?.vscode || !appState?.selectedRepo?.value || selectedTodos.value.length === 0 || loadingCreate.value) return

  loadingCreate.value = true

  const repoData = {
    id: appState.selectedRepo.value.id,
    name: appState.selectedRepo.value.name,
    full_name: appState.selectedRepo.value.full_name || appState.selectedRepo.value.name
  }
  
  console.log('Repo data to send:', repoData)
  console.log('Todos data to send:', selectedTodos.value)
  
  appState.vscode.postMessage({
    type: 'createIssues',
    platform: appState?.selectedPlatform?.value,
    repo: repoData,
    todos: selectedTodos.value
  })
}

// Listen for messages from extension
window.addEventListener('message', (event) => {
  const message = event.data
  console.log('📨 TodoPage received message:', message.type, message)
  
  switch (message.type) {
    case 'resetAppState':
      console.log('🔍 scansione in corso...')
      break
    case 'todosScanned':
      console.log('🔍 todos received in TodoPage:', message.todos)
      // Removed post-scan alert per user request: do not set localMessage here
      break;
    case 'githubRepos':
      reposLoading.value = false
      if (appState?.repos) {
        const repos = (message.repos || []).slice().sort((a: any, b: any) =>
          String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { sensitivity: 'base' })
        )
        appState.repos.value = repos
      }
      break
    case 'gitlabRepos':
      reposLoading.value = false
      if (appState?.repos) {
        const repos = (message.repos || []).slice().sort((a: any, b: any) =>
          String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { sensitivity: 'base' })
        )
        appState.repos.value = repos
      }
      break
    case 'scanTodosDone':
      console.log('✅ Setting loadingScan to false')
      loadingScan.value = false
      break
    case 'issuesCreated':
      loadingCreate.value = false
      localMessage.value = `${message.count} issue create con successo su ${message.platform}`
      localMessageType.value = 'success'
      // Clear message after 3 seconds
      setTimeout(() => {
        localMessage.value = null
      }, 3000)
      break
    case 'error': 
      console.log('❌ Error received:', message.message)
      loadingScan.value = false
      loadingCreate.value = false
      localMessage.value = message.message
      localMessageType.value = 'error'
      setTimeout(() => {
        localMessage.value = null
      }, 5000)
      break
  }
})
</script>
