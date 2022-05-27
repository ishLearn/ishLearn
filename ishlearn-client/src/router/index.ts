import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
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
    path: '/user/:id',
    name: 'UserLogin',
    component: () => import('../views/UserLoginView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
