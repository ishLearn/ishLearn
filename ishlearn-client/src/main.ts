import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import store from './store'
import setupInterceptors from './services/setupInterceptors'
import './styles/style.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

setupInterceptors(store)

// eslint-disable-next-line
createApp(App).use(createPinia()).use(store).use(router).mount('#app')
