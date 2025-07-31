<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-neutral-content p-6">
      <h2 class="text-xl font-bold mb-6 text-center">Autenticazione</h2>
      <p class="mb-8 text-center">
        Configura l'accesso a GitHub e GitLab per creare automaticamente le issue dai tuoi TODO.
      </p>

      <div class="grid md:grid-cols-2 gap-6">
        <AuthGitHub :authStatus="authStatus ? { github: !!authStatus.github } : { github: false }"
          :loading="loadingGitHub" :loginGitHub="loginGitHub" :logoutGitHub="logoutGitHub" />
        <AuthGitLab :authStatus="authStatus ? { gitlab: !!authStatus.gitlab } : { gitlab: false }"
          :loading="loadingGitLab" :gitlabUrl="gitlabUrl ?? ''" :loginGitLab="loginGitLab" :logoutGitLab="logoutGitLab"
          :reconfigureGitLab="reconfigureGitLab" />
      </div>
      <LocalMessage v-if="localMessage" :message="localMessage" :type="localMessageType" :duration="4000" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted } from 'vue'
import AuthGitHub from './AuthGitHub.vue'
import AuthGitLab from './AuthGitLab.vue'
import LocalMessage from './LocalMessage.vue'
import type { AppState } from '../composables/useAppState'

const appState = inject<AppState>('appState')
const { 
  authStatus, 
  loading, 
  vscode 
} = appState ?? {
  authStatus: ref({ github: false, gitlab: false }),
  loading: ref(false),
  vscode: { postMessage: () => {} }
}

const gitlabUrl = ref('')
const localMessage = ref('')
const localMessageType = ref<'success' | 'info' | 'error'>('info')
const loadingGitHub = ref(false)
const loadingGitLab = ref(false)

const showLocalMessage = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
  localMessage.value = text
  localMessageType.value = type
}

const loginGitHub = () => {
  loadingGitHub.value = true
  vscode.postMessage({ type: 'githubLogin' })
}

const loginGitLab = () => {
  loadingGitLab.value = true
  vscode.postMessage({ type: 'gitlabLogin' })
}

const reconfigureGitLab = () => {
  loadingGitLab.value = true
  vscode.postMessage({ type: 'reconfigureGitLab' })
  setTimeout(() => {
    vscode.postMessage({ type: 'getGitLabUrl' })
  }, 500)
}

const logoutGitHub = () => {
  vscode.postMessage({ type: 'logout', platform: 'github' })
}

const logoutGitLab = () => {
  vscode.postMessage({ type: 'logout', platform: 'gitlab' })
}

// Get GitLab URL on mount
onMounted(() => {
  vscode.postMessage({ type: 'getGitLabUrl' })
})

// Listen for GitLab URL response and error
window.addEventListener('message', event => {
  const message = event.data
  if (message.type === 'gitlabUrl') {
    gitlabUrl.value = message.url
  }
  if (message.type === 'error') {
    showLocalMessage(message.message || 'Errore di autenticazione', 'error')
    loadingGitHub.value = false
    loadingGitLab.value = false
  }
  if (message.type === 'loginSuccess' || message.type === 'logoutSuccess') {
    loadingGitHub.value = false
    loadingGitLab.value = false
  }
})
</script>
