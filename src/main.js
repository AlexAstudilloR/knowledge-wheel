import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'
import { router } from './router'
import { createPinia } from 'pinia'
import { FontAwesomeIcon } from './lib/foundation'

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
