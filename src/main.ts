import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './underline/utils/indexedDB'
import './underline/utils/webWorker'

createApp(App).use(router).mount('#app')
