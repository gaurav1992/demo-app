import { IonicVue } from '@ionic/vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { theme } from './theme/variables'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/display.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'

/* Theme variables */
import './theme/variables.css'

const app = createApp(App)
const pinia = createPinia()

app.config.globalProperties.$theme = theme
app.use(IonicVue)
app.use(router)
app.use(pinia)

router.isReady().then(() => {
  app.mount('#app')
})
