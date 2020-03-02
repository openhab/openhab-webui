// Import Vue
import Vue from 'vue'

// Import globally registered components
import SitemapWidgetGeneric from '../components/sitemap/widget-generic.vue'
import OHIconComponent from '../components/oh-icon.vue'
import ModelTreeviewItem from '../components/model/treeview-item.vue'
import SitemapTreeviewItem from '../components/pagedesigner/sitemap/treeview-item.vue'
import EmptyStatePlaceholder from '../components/empty-state-placeholder.vue'
import GenericWidgetComponent from '../components/widgets/generic-widget-component.vue'

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

// Import AsyncComputed
import AsyncComputed from 'vue-async-computed'
Vue.use(AsyncComputed)

// Import vue-magic-grid
import MagicGrid from 'vue-magic-grid'
Vue.use(MagicGrid)

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue)

// Import VueX store
import store from './store'
Vue.prototype.$store = store
store.dispatch('initializeTrackingStore')

// Extend prototype with the openHAB API interface
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
Vue.component('model-treeview-item', ModelTreeviewItem)
Vue.component('sitemap-treeview-item', SitemapTreeviewItem)
Vue.component('empty-state-placeholder', EmptyStatePlaceholder)
Vue.component('generic-widget-component', GenericWidgetComponent)
