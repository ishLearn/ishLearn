import pinia from './store/pinia'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/style.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

// eslint-disable-next-line
createApp(App).use(pinia).use(router).mount('#app')

import setupInterceptors from './services/setupInterceptors'
setupInterceptors()
