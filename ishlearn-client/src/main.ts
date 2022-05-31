import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import store from './store';
import setupInterceptors from './services/setupInterceptors';
import './styles/style.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

setupInterceptors(store);

createApp(App)
  .use(store)
  .use(router)
  .use(createPinia())
  .mount('#app');
