<template>
  <div class="card shadow-xl bg-neutral-800">
    <div class="card-body">
      <h3 class="card-title mb-2 flex justify-center">GITHUB</h3>
      <p class="mb-4 text-sm opacity-80">Autenticazione per GitHub.com</p>
      <div class="flex flex-col h-full">
        <div class="mb-4">
          <div class="flex flex-col gap-2 mt-2">
            <button v-if="authStatus?.github" @click="logoutGitHub" class="btn btn-outline btn-error w-full">Disconnetti</button>
            <button v-else @click="loginGitHub" :disabled="loading" class="btn btn-primary w-full">
              {{ loading ? 'Connessione...' : 'Connetti GitHub' }}
            </button>
          </div>
          <!-- Placeholder per allineamento con GitLab -->
          <div class="h-12"></div>
        </div>
        <div class="flex-grow flex flex-col justify-start">
          <div class="p-4 rounded-lg border border-primary bg-base-200">
            <h4 class="font-bold text-primary mb-3">Istruzioni per configurare GitHub</h4>
            <div class="flex flex-col gap-2 text-sm">
              <div><span class="font-bold">1.</span> Vai su <span class="underline">GitHub.com → Settings → Developer settings</span></div>
              <div><span class="font-bold">2.</span> Clicca su <span class="underline">Personal access tokens → Tokens (classic)</span></div>
              <div><span class="font-bold">3.</span> Genera un nuovo token con scope <span class="badge badge-primary">repo</span></div>
              <div><span class="font-bold">4.</span> Copia il token e incollalo quando richiesto</div>
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
  authStatus: { github: boolean }
  loading: boolean
  loginGitHub: () => void
  logoutGitHub: () => void
}>()
</script>
