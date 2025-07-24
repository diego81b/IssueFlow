<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">Autenticazione</h2>
      <p class="text-gray-600 mb-8">
        Configura l'accesso a GitHub e GitLab per creare automaticamente le issue dai tuoi TODO.
      </p>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- GitHub Section -->
        <div class="border rounded-lg p-6">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-bold">GH</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">GitHub</h3>
              <p class="text-sm text-gray-600">GitHub.com</p>
            </div>
          </div>

          <div class="space-y-4">
            <div v-if="(authStatus ?? {}).github" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-green-800 font-medium">Connesso</span>
              </div>
              <p class="text-green-700 text-sm mt-1">
                Account GitHub configurato correttamente
              </p>
              <button 
                @click="logoutGitHub"
                class="mt-3 text-sm text-green-700 hover:text-green-800 underline"
              >
                Disconnetti
              </button>
            </div>

            <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span class="text-gray-700 font-medium">Non connesso</span>
              </div>
              <p class="text-gray-600 text-sm mb-3">
                Effettua il login per accedere ai tuoi repository GitHub
              </p>
              <button 
                @click="loginGitHub"
                :disabled="loading"
                class="w-full bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {{ loading ? 'Connessione...' : 'Connetti GitHub' }}
              </button>
            </div>

            <!-- GitHub Instructions -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="text-sm font-medium text-blue-800 mb-2">Come configurare GitHub:</h4>
              <ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Vai su GitHub.com → Settings → Developer settings</li>
                <li>Clicca su "Personal access tokens" → "Tokens (classic)"</li>
                <li>Genera un nuovo token con scope "repo"</li>
                <li>Copia il token e incollalo quando richiesto</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- GitLab Section -->
        <div class="border rounded-lg p-6">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-bold">GL</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">GitLab</h3>
              <p class="text-sm text-gray-600">{{ gitlabUrl || 'Non configurato' }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <div v-if="authStatus?.gitlab" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-green-800 font-medium">Connesso</span>
              </div>
              <p class="text-green-700 text-sm mt-1">
                Account GitLab configurato correttamente
              </p>
              <div class="flex space-x-2 mt-3">
                <button 
                  @click="logoutGitLab"
                  class="text-sm text-green-700 hover:text-green-800 underline"
                >
                  Disconnetti
                </button>
                <span class="text-gray-400">•</span>
                <button 
                  @click="reconfigureGitLab"
                  class="text-sm text-green-700 hover:text-green-800 underline"
                >
                  Riconfigura
                </button>
              </div>
            </div>

            <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span class="text-gray-700 font-medium">Non connesso</span>
              </div>
              <p class="text-gray-600 text-sm mb-3">
                Configura GitLab per accedere ai tuoi repository
              </p>
              <button 
                @click="loginGitLab"
                :disabled="loading"
                class="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {{ loading ? 'Configurazione...' : 'Configura GitLab' }}
              </button>
            </div>

            <!-- GitLab Instructions -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="text-sm font-medium text-blue-800 mb-2">Come configurare GitLab:</h4>
              <ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Scegli GitLab.com o la tua installazione personalizzata</li>
                <li>Vai su GitLab → User Settings → Access Tokens</li>
                <li>Crea un nuovo token con scope "api"</li>
                <li>Copia il token e incollalo quando richiesto</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-medium text-gray-800 mb-3">Azioni Rapide</h3>
        <div class="flex flex-wrap gap-3">
          <button 
            @click="refreshAuthStatus"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Aggiorna Stato
          </button>
          <router-link 
            to="/todos"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
          >
            📝 Vai ai TODO
          </router-link>
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
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted } from 'vue'
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
const localMessageType = ref<'success' | 'error' | 'info'>('info')

const showLocalMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
  localMessage.value = text
  localMessageType.value = type
  setTimeout(() => {
    localMessage.value = ''
  }, 4000)
}

const loginGitHub = () => {
  loading.value = true
  vscode.postMessage({ type: 'githubLogin' })
}

const loginGitLab = () => {
  loading.value = true
  vscode.postMessage({ type: 'gitlabLogin' })
}

const logoutGitHub = () => {
  vscode.postMessage({ type: 'logout', platform: 'github' })
}

const logoutGitLab = () => {
  vscode.postMessage({ type: 'logout', platform: 'gitlab' })
}

const reconfigureGitLab = () => {
  loading.value = true
  vscode.postMessage({ type: 'reconfigureGitLab' })
}

const refreshAuthStatus = () => {
  vscode.postMessage({ type: 'getAuthStatus' })
  showLocalMessage('Stato aggiornato', 'info')
}

// Get GitLab URL on mount
onMounted(() => {
  vscode.postMessage({ type: 'getGitLabUrl' })
})

// Listen for GitLab URL response
window.addEventListener('message', event => {
  const message = event.data
  if (message.type === 'gitlabUrl') {
    gitlabUrl.value = message.url
  }
})
</script>
