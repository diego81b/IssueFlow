<template>
  <div class="bg-white rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
    <div class="p-6 flex-shrink-0">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800">TODO Trovati</h2>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{ todos.length }} elementi trovati</span>
          <div class="flex space-x-2">
            <button 
              @click="$emit('selectAll')"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              Seleziona tutti
            </button>
            <button 
              @click="$emit('deselectAll')"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              Deseleziona tutti
            </button>
          </div>
        </div>
      </div>

      <!-- TODO Controls -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded mb-4">
        <span class="text-sm text-gray-600">
          {{ selectedCount }} di {{ todos.length }} selezionati
        </span>
        <div class="flex items-center space-x-4">
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="showOnlySelected" class="rounded">
            <span class="text-sm text-gray-600">Mostra solo selezionati</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Scrollable TODO List -->
    <div class="flex-1 overflow-y-auto px-6 pb-6">
      <div class="space-y-2">
        <TodoListItem
          v-for="todo in filteredTodos" 
          :key="todo.id"
          :todo="todo"
          @toggle="(id: string) => $emit('toggle', id)"
          @updateDescription="(id: string, description: string) => $emit('updateDescription', id, description)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TodoItem } from '../types/TodoItem'
import TodoListItem from './TodoListItem.vue'

const props = defineProps<{
  todos: TodoItem[]
  selectedCount: number
}>()

const showOnlySelected = ref(false)

const filteredTodos = computed(() => {
  if (showOnlySelected.value) {
    return props.todos.filter(todo => todo.selected)
  }
  return props.todos
})

defineEmits<{
  selectAll: []
  deselectAll: []
  toggle: [id: string]
  updateDescription: [id: string, description: string]
}>()
</script>
