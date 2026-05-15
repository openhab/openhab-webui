<template>
  <group-container :title="$t('settings.groups.addon-settings')">
    <f7-list class="search-list">
      <f7-list-item v-for="a in addonsSettings" v-show="!a.hidden" :key="a.uid" :link="'addons/' + a.uid" :title="a.label" />
      <f7-list-button v-if="!expanded && addonsSettings.find((a) => a.hidden)" color="blue" @click="$emit('expand')">
        {{ $t('dialogs.showAll') }}
      </f7-list-button>
    </f7-list>
  </group-container>
</template>

<script>
import GroupContainer from '@/components/util/group-container.vue'

export default {
  components: {
    GroupContainer
  },
  props: {
    addonsInstalled: Array,
    addonsServices: Array,
    expanded: Boolean
  },
  emits: ['expand'],
  computed: {
    addonsSettings() {
      if (this.expanded) return this.addonsInstalled
      return this.addonsInstalled.map((addon) => {
        const show =
          addon.type === 'persistence' || this.addonsServices.findIndex((as) => as.configDescriptionURI.split(':')[1] === addon.id) > -1
        return Object.assign({ hidden: !show }, addon)
      })
    }
  }
}
</script>
