<template>
  <hb-btn-group :model="btnGroupModel" :class="{'highlight-and-fade': this.model.highlight}" />
</template>

<script>
import HbBtnGroup from 'components/HbBtnGroup.vue'

export default {
  name: 'HbPlayer',
  props: ['model'],
  components: {
    HbBtnGroup
  },
  computed: {
    itemState () {
      return this.$store.getters['items/itemState'](this.model.config.item, true)
    },
    btnGroupModel () {
      return {
        component: 'HbBtnGroup',
        config: {
          rounded: true
        },
        slots: {
          buttons: [
            {
              component: 'HbBtn',
              config: {
                icon: 'skip_previous',
                size: this.model.config.size || 'md',
                item: this.model.config.item,
                command: 'PREVIOUS',
                rounded: true
              }
            },
            {
              component: 'HbBtn',
              config: {
                icon: (this.itemState === 'PLAY') ? 'pause' : 'play_arrow',
                size: this.model.config.size || 'md',
                item: this.model.config.item,
                command: (this.itemState === 'PLAY') ? 'PAUSE' : 'PLAY',
                rounded: true,
                color: 'primary',
                glossy: true
              }
            },
            {
              component: 'HbBtn',
              config: {
                icon: 'skip_next',
                size: this.model.config.size || 'md',
                item: this.model.config.item,
                command: 'NEXT',
                rounded: true
              }
            }
          ]
        }
      }
    }
  }
}
</script>
