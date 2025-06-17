import './compatibility'
import './logging'

// Import Vue
import Vue from 'vue'

// Import globally registered components
import OHIconComponent from '../components/widgets/system/oh-icon.vue'
import GenericWidgetComponent from '../components/widgets/generic-widget-component.vue'
import DeveloperDockIcon from '../components/developer/developer-dock-icon.vue'

// Import Framework7
import Framework7 from 'framework7/framework7-lite.esm.bundle.js'

// Import Framework7-Vue Plugin
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle.js'

// Import Framework7 Styles
import 'framework7/css/framework7.bundle.css'

// Import Icons and App Custom Styles
import '../css/icons.css'
import '../css/nomini.css'
import '../css/app.styl'

// Import App Component
import App from '../components/app.vue'

// Import openHAB API helpers
import openhab from './openhab/index'

// Import AsyncComputed
import AsyncComputed from 'vue-async-computed'
Vue.use(AsyncComputed)

// Import vue-magic-grid
// import MagicGrid from 'vue-magic-grid'
// Vue.use(MagicGrid)

import VueMasonry from 'vue-masonry-css'
Vue.use(VueMasonry)

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue)

// Import VueX store
import store from './store'
Vue.prototype.$store = store
store.dispatch('initializeTrackingStore')

// initialize i18n
import i18n from './i18n'

// Import vuetrend
import Trend from 'vuetrend'
Vue.use(Trend)

// Import Fullscreen Plugin
import fullscreen from 'vue-fullscreen'
Vue.use(fullscreen)

// Import clipboard plugin
import Clipboard from 'v-clipboard'
Vue.use(Clipboard)

// Extend prototype with the openHAB API interface
Vue.prototype.$oh = openhab

// Init App
// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: '#app',
  i18n,
  render: (h) => h(App),

  // Register App Component
  components: {
    app: App
  }
})

// Register global components
Vue.component('oh-icon', OHIconComponent)
Vue.component('generic-widget-component', GenericWidgetComponent)
Vue.component('developer-dock-icon', DeveloperDockIcon)
