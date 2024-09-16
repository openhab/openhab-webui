import ModelPickerPopup from '@/components/model/model-picker-popup.vue'

export default {
  data () {
    return {
      category: '',
      currentItem: null
    }
  },
  computed: {
    commandSuggestions () {
      if (!this.currentItem || this.category !== 'item') return []
      let type = (this.currentItem.type === 'Group' && this.currentItem.groupType) ? this.currentItem.groupType : this.currentItem.type

      if (this.currentItem.commandDescription && this.currentItem.commandDescription.commandOptions) {
        return this.currentItem.commandDescription.commandOptions
      }
      if (type === 'Switch') {
        return ['ON', 'OFF'].map((c) => { return { command: c, label: c } })
      }
      if (type === 'Rollershutter') {
        return ['UP', 'DOWN', 'STOP'].map((c) => { return { command: c, label: c } })
      }
      if (type === 'Color') {
        return ['ON', 'OFF'].map((c) => { return { command: c, label: c } })
      }

      return ['ON', 'OFF'].map((c) => { return { command: c, label: c } })
    },
    stateSuggestions () {
      if (!this.currentItem || this.category !== 'item') return []
      let type = (this.currentItem.type === 'Group' && this.currentItem.groupType) ? this.currentItem.groupType : this.currentItem.type

      if (this.currentItem.stateDescription && this.currentItem.stateDescription.options) {
        return this.currentItem.stateDescription.options
      }
      if (type === 'Switch') {
        return ['ON', 'OFF'].map((c) => { return { value: c, label: c } })
      }
      if (type === 'Rollershutter') {
        return ['UP', 'DOWN', 'STOP'].map((c) => { return { value: c, label: c } })
      }
      if (type === 'Contact') {
        return ['OPEN', 'CLOSED'].map((c) => { return { value: c, label: c } })
      }

      return ['ON', 'OFF'].map((c) => { return { value: c, label: c } })
    },
    isJsAvailable () {
      return this.isMimeTypeAvailable('application/javascript')
    }
  },
  methods: {
    openModelPicker () {
      const popup = {
        component: ModelPickerPopup
      }

      this.$f7router.navigate({
        url: 'pick-from-model',
        route: {
          path: 'pick-from-model',
          popup
        }
      }, {
        props: {
          multiple: false
        }
      })

      this.$f7.once('itemsPicked', this.itemPicked)
      this.$f7.once('modelPickerClosed', () => {
        this.$f7.off('itemsPicked', this.itemPicked)
      })
    },
    isMimeTypeAvailable (mimeType) {
      return this.languages.map(l => l.contentType).includes(mimeType)
    }
  }
}
