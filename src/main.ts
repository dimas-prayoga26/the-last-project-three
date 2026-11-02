import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { vReveal } from './directives/reveal'

const app = createApp(App)

app.use(createPinia())
app.use(createHead())
app.use(i18n)
app.use(router)
app.directive('reveal', vReveal)

app.mount('#app')
