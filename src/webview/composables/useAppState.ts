import { ref } from 'vue'
import type { TodoItem } from '../types/TodoItem'
import type { Repository } from '../types/Repository'
import type { AuthStatus } from '../types/AuthStatus'

export interface AppState {
  todos: ReturnType<typeof ref<TodoItem[]>>
  authStatus: ReturnType<typeof ref<AuthStatus>>
  loading: ReturnType<typeof ref<boolean>>
  selectedPlatform: ReturnType<typeof ref<string>>
  selectedRepo: ReturnType<typeof ref<Repository | null>>
  repos: ReturnType<typeof ref<Repository[]>>
  vscode: any
  resetTodos: () => void
}

export function useAppState(): AppState {
  const todos = ref<TodoItem[]>([])
  const authStatus = ref<AuthStatus>({ github: false, gitlab: false })
  const loading = ref(false)
  const selectedPlatform = ref('')
  const selectedRepo = ref<Repository | null>(null)
  const repos = ref<Repository[]>([])
  
  // Use the global vscode object we set up in index.html
  const vscode = (window as any).vscode

  const resetTodos = () => {
    console.log('AppState: resetting todos to empty array')
    todos.value = []
    selectedPlatform.value = ''
    selectedRepo.value = null
    repos.value = []
  }

  return {
    todos,
    authStatus,
    loading,
    selectedPlatform,
    selectedRepo,
    repos,
    vscode,
    resetTodos
  }
}
