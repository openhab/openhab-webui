<template>
  <f7-popup @popup:open="onOpen">
    <f7-page class="group-popup-content disable-user-select">
      <f7-navbar :title="(item) ? item.label || item.name : ''" :back-link="$t('dialogs.back')" />
      <div class="group-item-control no-padding no-margin">
        <generic-widget-component v-if="ready && groupControlContext" v-bind="$attrs" :context="groupControlContext" />
      </div>

      <generic-widget-component v-if="ready" v-bind="$attrs" :context="context" />
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.group-item-control
  width 100%
</style>

<script>
import itemDefaultStandaloneComponent from '@/components/widgets/standard/default-standalone-item'
import itemDefaultListComponent from '@/components/widgets/standard/list/default-list-item'
import { compareItems } from '@/components/widgets/widget-order'

import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
  props: {
    groupItem: String
  },
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
          store: useStatesStore().trackedItems,
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
      } else if (this.item.type === 'Group') {
        return {
          component: {
            component: 'Label',
            config: {
              class: ['padding', 'text-align-center'],
              text: 'This group has no members.'
            }
          }
        }
      } else {
        return {
          store: useStatesStore().trackedItems,
          component: itemDefaultStandaloneComponent(this.item)
        }
      }
    },
    groupControlContext () {
      if (!this.item || !this.item.groupType || this.item.groupType === '') return null

      // make a fake item of the group's base type to build the standalone widget for the group
      const itemAsBaseType = Object.assign({}, this.item)
      itemAsBaseType.type = itemAsBaseType.groupType
      itemAsBaseType.groupType = undefined

      return {
        store: useStatesStore().trackedItems,
        component: itemDefaultStandaloneComponent(itemAsBaseType)
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
    load () {
      this.$oh.api.get(`/rest/items/${this.groupItem}?metadata=semantics,widget,listWidget,widgetOrder`).then((data) => {
        this.item = data
        // array is sorted in-place
        this.item.members.sort(compareItems)
      })
    }
  }
}
</script>
