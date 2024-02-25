<template>
  <div>
    <f7-block-title>
      Add-on Settings
    </f7-block-title>
    <f7-list class="search-list">
      <f7-list-item
        v-for="a in addonsSettings"
        :key="a.uid"
        :link="'addons/' + a.uid"
        :title="a.label"
        v-show="!a.hidden" />
      <f7-list-button v-if="!expanded && addonsSettings.find((a) => a.hidden)" color="blue" @click="$emit('expand')">
        {{ $t('dialogs.showAll') }}
      </f7-list-button>
    </f7-list>
  </div>
</template>

<script>
export default {
  props: ['addonsInstalled', 'addonsServices', 'expanded'],
  computed: {
    addonsSettings () {
      if (this.expanded) return this.addonsInstalled
      return this.addonsInstalled.map((addon) => {
        const show = addon.type === 'persistence' ||
          this.addonsServices.findIndex((as) => as.configDescriptionURI.split(':')[1] === addon.id) > -1
        return Object.assign({ hidden: !show }, addon)
      })
    }
  }
}
</script>
