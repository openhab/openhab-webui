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
        :title="a.label" />
      <f7-list-button v-if="!expanded && addonsInstalled.length > addonsSettings.length" color="blue" @click="$emit('expanded', true)">
        {{ $t('dialogs.showAll') }}
      </f7-list-button>
    </f7-list>
  </div>
</template>

<script>
export default {
  props: ['addonsInstalled', 'addonsServices', 'expanded'],
  emits: ['expanded'],
  data () {
    return {
      ready: false
    }
  },
  computed: {
    addonsSettings () {
      if (this.expanded !== false) return this.addonsInstalled
      return this.addonsInstalled.filter((a) =>
        a.type === 'persistence' ||
        this.addonsServices.findIndex((as) => as.configDescriptionURI.split(':')[1] === a.id) > -1
      )
    }
  }
}
</script>
