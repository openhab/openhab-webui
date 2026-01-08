import mixin from '@/components/widgets/widget-mixin'
import { f7 } from 'framework7-vue'

// TODO: Restore functionality to close card with browser back.
// This has been removed as the history manipulation caused double-back navigation to the overview page from the analyzer
export default {
  mixins: [mixin],
  props: {
    type: String,
    element: Object
  },
  data () {
    return {
      opened: false,
      cardId: this.title
    }
  },
  mounted () {
    // window.addEventListener('popstate', this.back)
  },
  beforeUnmount () {
    // window.removeEventListener('popstate', this.back)
  },
  computed: {
    title () {
      if (this.config.title) return this.config.title
      return (this.element) ? this.element.defaultTitle : '?'
    },
    subtitle () {
      if (this.config.subtitle) return this.config.subtitle
      return (this.element) ? this.element.defaultSubtitle : '?'
    },
    color () {
      if (this.config.backgroundColor) {
        return this.config.backgroundColor
      }
      switch (this.type) {
        case 'location':
          const item = this.element.item
          if (item.metadata.semantics.value.indexOf('LivingRoom') > 0) return 'palette-7'
          if (item.metadata.semantics.value.indexOf('Kitchen') > 0) return 'palette-9'
          if (item.metadata.semantics.value.indexOf('Bedroom') > 0) return 'palette-4'
          if (item.metadata.semantics.value.indexOf('Bathroom') > 0) return 'palette-1'
          if (item.metadata.semantics.value.indexOf('_Room') > 0) return 'palette-5'
          if (item.metadata.semantics.value.indexOf('_Floor') > 0) return 'palette-8'
          if (item.metadata.semantics.value.indexOf('_Outdoor') > 0) return 'palette-2'
          return 'gray'
        case 'equipment':
          const equipmentType = this.element.key
          if (equipmentType === 'HVAC') return 'palette-7'
          if (equipmentType === 'Lightbulb') return 'palette-3'
          if (equipmentType === 'Window') return 'palette-1'
          if (equipmentType === 'Door') return 'palette-3'
          if (equipmentType === 'Camera') return 'palette-4'
          if (equipmentType === 'Blinds') return 'palette-6'
          if (equipmentType === 'SmokeDetector' || equipmentType === 'Siren') return 'palette-8'
          // etc. - use a map
          return 'gray'
        case 'property':
          const property = this.element.key
          if (property === 'Temperature') return 'palette-4'
          if (property === 'Light') return 'palette-7'
          if (property === 'Humidity') return 'palette-1'
          if (property === 'Presence') return 'palette-6'
          if (property === 'Pressure') return 'palette-8'
          // etc. - use a map
          return 'gray'
        default:
          return 'gray'
      }
    }
  },
  methods: {
    cardOpening () {
      this.cardId = this.title + '-' + f7.utils.id()
      // history.pushState({ cardId: this.cardId }, null, window.location.href.split('#card=')[0] + '#' + f7.utils.serializeObject({ card: this.element.key }))
      setTimeout(() => { this.opened = true })
    },
    cardClosed () {
      // if (history.state.cardId && history.state.cardId === this.cardId) history.back()
      this.opened = false
    },
    closeCard () {
      if (this.$refs.card) setTimeout(() => { f7.card.close(this.$refs.card.$el) }, 100)
    },
    back (evt) {
      console.debug(evt.state)
      if (!evt.state || evt.state.cardId === this.cardId) return
      if (this.opened) this.closeCard()
    }
  }
}
