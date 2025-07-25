import { createApp } from 'vue'
import './style.css'
import router from './router'
import Layout from './components/Layout.vue'
import { useAppState } from './composables/useAppState'
import type { AuthStatus } from './types/AuthStatus'
import type { TodoItem } from './types/TodoItem'

const app = createApp(Layout)

// Provide global app state
const appState = useAppState()
app.provide('appState', appState)

// Setup message listener
window.addEventListener('message', event => {
  const message = event.data
  console.log('main.ts received message:', message.type, message)
  
  switch (message.type) {
    case 'resetAppState':
      console.log('Resetting appState...')
      appState.resetTodos()
      break
      
    case 'todosScanned':
      console.log('Setting todos in appState:', message.todos)
      appState.todos.value = message.todos
      break
      
    case 'authStatus':
      appState.authStatus.value = message
      break
      
    case 'loginSuccess':
      if (message.authStatus) {
        appState.authStatus.value = message.authStatus
      } else if (appState.authStatus.value) {
        (appState.authStatus.value as AuthStatus)[message.platform as keyof AuthStatus] = true
      }
      break
      
    case 'logoutSuccess':
      if (appState.authStatus.value) {
        (appState.authStatus.value as AuthStatus)[message.platform as keyof AuthStatus] = false
      }
      // Reset platform selection if logged out
      if (appState.selectedPlatform.value === message.platform) {
        appState.selectedPlatform.value = ''
        appState.selectedRepo.value = null
        appState.repos.value = []
      }
      break
      
    case 'githubRepos':
    case 'gitlabRepos':
      console.log('Received repos:', message.type, message.repos)
      appState.repos.value = message.repos
      console.log('Repos array updated, length:', (appState.repos.value as any[]).length)
      break
      
    case 'issuesCreated':
      // Deselect created todos
      (appState.todos.value as TodoItem[]).forEach((todo: any) => todo.selected = false)
      break
      
    case 'error':
      console.error('Error received in main.ts:', message.message)
      break
  }
})

// Initialize auth status on startup
appState.vscode.postMessage({ type: 'getInitialAuthStatus' })

app.use(router)
app.mount('#app')
