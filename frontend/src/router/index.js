import { createRouter, createWebHistory } from 'vue-router'
import TaskView from '../views/TaskView.vue'
import MaterialView from '../views/materialView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/material',
    },
    {
      path: '/login',
      name: 'login',
      redirect: '/material',
    },
    {
      path: '/register',
      name: 'register',
      redirect: '/material',
    },
    {
      path: '/task',
      name: 'task',
      component: TaskView,
    },
    {
      path: '/material',
      name: 'material',
      component: MaterialView,
    },
  ],
})

export default router
