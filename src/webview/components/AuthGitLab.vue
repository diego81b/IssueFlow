<template>
  <div class="card shadow-xl bg-neutral-800">
    <div class="card-body">
      <h3 class="card-title mb-2 flex justify-center">GITLAB</h3>
      <p class="mb-4 text-sm opacity-80">Autenticazione per {{ gitlabUrl || 'GitLab.com' }}</p>
      <div class="flex flex-col h-full">
        <div class="mb-4">
          <div class="flex flex-col gap-2 mt-2">
            <button v-if="authStatus?.gitlab" @click="logoutGitLab" class="btn btn-outline btn-error w-full">Disconnetti</button>
            <button v-if="authStatus?.gitlab" @click="reconfigureGitLab" class="btn btn-outline btn-secondary w-full">Riconfigura</button>
            <button v-else @click="loginGitLab" :disabled="loading" class="btn btn-primary w-full">
              {{ loading ? 'Configurazione...' : 'Configura GitLab' }}
            </button>
          </div>
        </div>
        <div class="flex-grow flex flex-col justify-start">
          <div class="p-4 rounded-lg border border-primary bg-base-200">
            <h4 class="font-bold text-primary mb-3">Istruzioni per configurare o riconfigurare GitLab</h4>
            <div class="flex flex-col gap-2 text-sm">
              <div><span class="font-bold">1.</span> Quando configuri o riconfiguri, puoi scegliere <span class="underline">GitLab.com</span> oppure inserire l'URL di una installazione personalizzata.</div>
              <div><span class="font-bold">2.</span> Dopo aver scelto l'URL, vai su <span class="underline">User Settings → Access Tokens</span> nella tua istanza GitLab.</div>
              <div><span class="font-bold">3.</span> Crea un nuovo token con scope <span class="badge badge-primary">api</span></div>
              <div><span class="font-bold">4.</span> Copia il token e incollalo quando richiesto dalla configurazione.</div>
            </div>
            <div class="mt-2 text-xs text-primary">
              La riconfigurazione permette di reinserire sia l'URL che il token.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps<{
  authStatus: { gitlab: boolean }
  loading: boolean
  gitlabUrl: string
  loginGitLab: () => void
  logoutGitLab: () => void
  reconfigureGitLab: () => void
}>()
</script>
