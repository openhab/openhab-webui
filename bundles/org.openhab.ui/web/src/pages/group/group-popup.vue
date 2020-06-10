<template>
  <f7-popup @popup:open="onOpen" @popup:close="onClose">
    <f7-page class="analyzer-content">
      <f7-navbar :title="(item) ? item.label || item.name : ''" back-link="Back">
      </f7-navbar>

      <generic-widget-component v-if="ready" :context="context" v-on="$listeners" />
    </f7-page>
  </f7-popup>
</template>

<script>
import itemDefaultListComponent from '@/components/widgets/standard/list/default-list-item'

export default {
  props: ['groupItem'],
  data () {
    return {
      item: null
    }
  },
  computed: {
    context () {
      if (!this.item) return null

      if (this.item.members && this.item.members.length > 0) {
        return {
          store: this.$store.getters.trackedItems,
          component: {
            component: 'oh-list-card',
            config: {
              mediaList: true
            },
            slots: {
              default: this.item.members.map((i) => itemDefaultListComponent(i))
            }
          }
        }
      } else {
        return {
          component: 'Label',
          config: {
            text: 'This item is not a group, or it has no members'
          }
        }
      }
    },
    ready () {
      return this.context !== null
    }
  },
  methods: {
    onOpen () {
      this.load()
    },
    onClose () {

    },
    load () {
      this.$oh.api.get(`/rest/items/${this.groupItem}?metadata=listWidget`).then((data) => {
        this.item = data
      })
    }
  }
}
</script>
