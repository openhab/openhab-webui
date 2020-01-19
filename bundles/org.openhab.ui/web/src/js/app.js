// Import Vue
import Vue from 'vue'

import SitemapWidgetGeneric from '../components/sitemap/widget-generic.vue'
import OHIconComponent from '../components/oh-icon.vue'
import TreeviewItem from '../components/model/treeview-item.vue'

// Import Framework7
import Framework7 from 'framework7/framework7-lite.esm.bundle.js'

// Import Framework7-Vue Plugin
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle.js'

// Import Framework7 Styles
import 'framework7/css/framework7.bundle.css'

// Import Icons and App Custom Styles
import '../css/icons.css'
import '../css/app.styl'

// Import App Component
import App from '../components/app.vue'

// Import openHAB API helpers
import openhab from './openhab/openhab.js'

import AsyncComputed from 'vue-async-computed'
Vue.use(AsyncComputed)

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue)

Vue.prototype.$oh = openhab

// Init App
// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: '#app',
  render: (h) => h(App),

  // Register App Component
  components: {
    app: App
  }
})

Vue.component('sitemap-widget-generic', SitemapWidgetGeneric)
Vue.component('oh-icon', OHIconComponent)
Vue.component('model-treeview-item', TreeviewItem)
