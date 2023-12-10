import mixin from '@/components/widgets/widget-mixin'

export default {
  mixins: [mixin],
  props: ['type', 'element'],
  data () {
    return {
      opened: false,
      cardId: this.title
    }
  },
  mounted () {
    window.addEventListener('popstate', this.back)
  },
  beforeDestroy () {
    window.removeEventListener('popstate', this.back)
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
          if (item.metadata.semantics.value.indexOf('LivingRoom') > 0) return 'orange'
          if (item.metadata.semantics.value.indexOf('Kitchen') > 0) return 'deeporange'
          if (item.metadata.semantics.value.indexOf('Bedroom') > 0) return 'pink'
          if (item.metadata.semantics.value.indexOf('Bathroom') > 0) return 'blue'
          if (item.metadata.semantics.value.indexOf('_Room') > 0) return 'lightblue'
          if (item.metadata.semantics.value.indexOf('_Floor') > 0) return 'deeppurple'
          if (item.metadata.semantics.value.indexOf('_Outdoor') > 0) return 'green'
          return 'gray'
        case 'equipment':
          const equipmentType = this.element.key
          if (equipmentType === 'HVAC') return 'red'
          if (equipmentType === 'Lightbulb') return 'yellow'
          if (equipmentType === 'Window') return 'blue'
          if (equipmentType === 'Door') return 'green'
          if (equipmentType === 'Camera') return 'pink'
          if (equipmentType === 'Blinds') return 'teal'
          if (equipmentType === 'SmokeDetector' || equipmentType === 'Siren') return 'deeppurple'
          // etc. - use a map
          return 'gray'
        case 'property':
          const property = this.element.key
          if (property === 'Temperature') return 'red'
          if (property === 'Light') return 'orange'
          if (property === 'Humidity') return 'blue'
          if (property === 'Presence') return 'teal'
          if (property === 'Pressure') return 'deeppurple'
          // etc. - use a map
          return 'gray'
        default:
          return 'gray'
      }
    }
  },
  methods: {
    cardOpening () {
      this.cardId = this.title + '-' + this.$f7.utils.id()
      history.pushState({ cardId: this.cardId }, null, window.location.href.split('#card=')[0] + '#' + this.$f7.utils.serializeObject({ card: this.element.key }))
      setTimeout(() => { this.opened = true })
    },
    cardClosed () {
      if (history.state.cardId && history.state.cardId === this.cardId) history.back()
      this.opened = false
    },
    closeCard () {
      setTimeout(() => { this.$f7.card.close(this.$refs.card.$el) }, 100)
    },
    back (evt) {
      if (!evt.state || evt.state.cardId === this.cardId) return
      if (this.opened) this.closeCard()
    }
  }
}
