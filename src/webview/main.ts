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
  appState.loading.value = false
  
  switch (message.type) {
    case 'todosScanned':
      appState.todos.value = message.todos
      appState.message.value = `${message.todos.length} TODO trovati`
      appState.messageType.value = 'success'
      break
      
    case 'authStatus':
      appState.authStatus.value = message
      break
      
    case 'loginSuccess':
      if (appState.authStatus.value) {
        (appState.authStatus.value as AuthStatus)[message.platform as keyof AuthStatus] = true
      }
      appState.message.value = `Login ${message.platform} completato`
      appState.messageType.value = 'success'
      break
      
    case 'logoutSuccess':
      if (appState.authStatus.value) {
        (appState.authStatus.value as AuthStatus)[message.platform as keyof AuthStatus] = false
      }
      appState.message.value = `Logout ${message.platform} completato`
      appState.messageType.value = 'success'
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
      appState.message.value = `${message.repos.length} repository trovati`
      appState.messageType.value = 'success'
      break
      
    case 'issuesCreated':
      appState.message.value = `${message.count} issue create con successo su ${message.platform}`
      appState.messageType.value = 'success';
      // Deselect created todos
      (appState.todos.value as TodoItem[]).forEach((todo: any) => todo.selected = false)
      break
      
    case 'error':
      appState.message.value = message.message
      appState.messageType.value = 'error'
      break
  }
})

// Initialize
appState.vscode.postMessage({ type: 'getAuthStatus' })

app.use(router)
app.mount('#app')
