<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">IssueFlow</h1>
            <p class="text-sm text-gray-600">Trasforma i tuoi TODO in issue</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Auth Status Indicators -->
            <div class="flex items-center space-x-2">
              <div class="flex items-center space-x-1">
                <div 
                  :class="authStatus?.github ? 'bg-green-500' : 'bg-gray-300'" 
                  class="w-2 h-2 rounded-full"
                ></div>
                <span class="text-xs text-gray-600">GitHub</span>
              </div>
              <div class="flex items-center space-x-1">
                <div 
                  :class="authStatus?.gitlab ? 'bg-green-500' : 'bg-gray-300'" 
                  class="w-2 h-2 rounded-full"
                ></div>
                <span class="text-xs text-gray-600">GitLab</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="bg-white border-b">
      <div class="px-6">
        <div class="flex space-x-8">
          <router-link
            to="/auth"
            class="py-4 px-1 border-b-2 text-sm font-medium transition-colors"
            :class="route.path === '/auth' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            🔐 Autenticazione
          </router-link>
          <router-link
            to="/todos"
            class="py-4 px-1 border-b-2 text-sm font-medium transition-colors"
            :class="route.path === '/todos' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            📝 Gestione TODO
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import type { AppState } from '../composables/useAppState'

const route = useRoute()
const appState = inject<AppState>('appState')!
const { authStatus } = appState
</script>
