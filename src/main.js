import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import './assets/globals.css'
import vuetify from './plugins/vuetify'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css';

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')