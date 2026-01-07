import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { Vue3Lottie } from 'vue3-lottie'

import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

app.component('Vue3Lottie', Vue3Lottie)
app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
