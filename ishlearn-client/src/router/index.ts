import AuthService from '@/services/auth.service'
import { createRouter, createWebHashHistory, RouteRecordRaw, useRoute } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
  },
  // Alles für die Projekte
  {
    path: '/projects',
    name: 'AllProjects',
    component: () => import('../views/ProjectsAllView.vue'),
  },
  {
    path: '/projects/add',
    name: 'AddProject',
    component: () => import('../views/ProjectAdd.vue'),
  },
  {
    path: '/projects/view/:id',
    name: 'ViewProject',
    component: () => import('../views/ProjectDetail.vue'),
  },
  // Alles rund um den Benutzer
  {
    path: '/user/signup',
    name: 'UserSignup',
    component: () => import('../views/UserSignUpView.vue'),
  },
  {
    path: '/user/login',
    name: 'UserLogin',
    component: () => import('../views/UserLoginView.vue'),
  },
  {
    path: '/user/logout',
    name: 'UserLogout',
    component: () => import('../views/UserLogoutDummy.vue'),
  },
  {
    path: '/user/:id',
    name: 'UserDetail',
    component: () => import('../views/UserProfileView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
