<template>
  <div class="rounded-lg shadow-md flex-1 flex flex-col overflow-hidden bg-neutral-800 h-full pb-4">
    <div class="p-4 flex-shrink-0">
      <div class="mb-2">
        <h2 class="text-xl font-bold text-neutral-content">TODO Trovati</h2>
      </div>

      <!-- Controls row: selected count | select/deselect buttons | checkbox -->
      <div class="flex items-center justify-between space-x-4">
        <div class="flex-1">
          <span class="text-sm text-neutral-content/60">
            {{ selectedCount }} di {{ todos.length }} selezionati
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <button @click="$emit('selectAll')" class="btn btn-soft btn-sm">
            Seleziona tutti
          </button>
          <button @click="$emit('deselectAll')" class="btn btn-soft btn-sm">
            Deseleziona tutti
          </button>
        </div>

        <div>
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="showOnlySelected" class="checkbox checkbox-primary">
            <span class="text-sm text-neutral-content/60">Mostra solo selezionati</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Scrollable TODO List (limited to viewport height minus header/actions) -->
    <div class="flex-1 overflow-y-auto px-4 pb-4">
      <div class="space-y-2">
        <TodoListItem v-for="todo in filteredTodos" :key="todo.id" :todo="todo" :filter="props.filter"
          @toggle="(id: string) => $emit('toggle', id)"
          @updateDescription="(id: string, description: string) => $emit('updateDescription', id, description)" />
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
  filter?: string | null
}>()

const showOnlySelected = ref(false)

const filteredTodos = computed(() => {
  let list = props.todos
  if (showOnlySelected.value) {
    list = list.filter(todo => todo.selected)
  }
  if (props.filter && props.filter.trim().length > 0) {
    const q = props.filter.trim().toLowerCase()
    list = list.filter(todo => {
      const content = String(todo.content || '').toLowerCase()
      const desc = String(todo.description || '').toLowerCase()
      return content.includes(q) || desc.includes(q)
    })
  }
  return list
})

defineEmits<{
  selectAll: []
  deselectAll: []
  toggle: [id: string]
  updateDescription: [id: string, description: string]
}>()
</script>
