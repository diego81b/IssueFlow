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
  message: ReturnType<typeof ref<string>>
  messageType: ReturnType<typeof ref<'success' | 'error' | 'info'>>
  vscode: any
}

export function useAppState(): AppState {
  const todos = ref<TodoItem[]>([])
  const authStatus = ref<AuthStatus>({ github: false, gitlab: false })
  const loading = ref(false)
  const selectedPlatform = ref('')
  const selectedRepo = ref<Repository | null>(null)
  const repos = ref<Repository[]>([])
  const message = ref('')
  const messageType = ref<'success' | 'error' | 'info'>('info')
  // @ts-ignore
  const vscode = window.acquireVsCodeApi()

  return {
    todos,
    authStatus,
    loading,
    selectedPlatform,
    selectedRepo,
    repos,
    message,
    messageType,
    vscode
  }
}
