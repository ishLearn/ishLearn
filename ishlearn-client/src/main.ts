import pinia from './store/pinia'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/style.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

// eslint-disable-next-line
createApp(App).use(pinia).use(router).use(mavonEditor).mount('#app')

import setupInterceptors from './services/setupInterceptors'
setupInterceptors()
