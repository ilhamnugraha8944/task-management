import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import TaskView from '../views/TaskView.vue'
import MaterialView from '../views/materialView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
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
