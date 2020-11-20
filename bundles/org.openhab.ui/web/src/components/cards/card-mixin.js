export default {
  props: ['color', 'type', 'header', 'title', 'subtitle', 'items'],
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
  methods: {
    cardOpening () {
      history.pushState({ cardId: this.cardId }, null, window.location.href.split('#card=')[0] + '#' + this.$f7.utils.serializeObject({ card: this.cardId }))
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
      console.log(evt.state)
      if (!evt.state || evt.state.cardId === this.cardId) return
      if (this.opened) this.closeCard()
    }
  }
}
