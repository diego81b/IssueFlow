import { createRouter, createWebHashHistory } from 'vue-router'
import AuthPage from '../components/AuthPage.vue'
import TodoPage from '../components/TodoPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthPage
  },
  {
    path: '/todos',
    name: 'Todos',
    component: TodoPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
