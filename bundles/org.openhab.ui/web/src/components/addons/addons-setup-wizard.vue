<template>
  <f7-list media-list>
    <f7-list-item v-for="addon in addons" :key="addon.uid" class="addons-setup-wizard">
      <f7-block class="addon display-flex flex-direction-column">
        <f7-row no-gap class="item-title">
          <f7-col width="10">
            <f7-checkbox :checked="selectedAddon(addon)" :disabled="addon.installed" @change="changeAddonSelection(addon, $event)" />
          </f7-col>
          <f7-col width="70">
            {{ addon.label }}
          </f7-col>
          <f7-col v-if="addon.link" width="20" style="text-align: right">
            <f7-link icon-f7="doc_text_search" :external="true" color="gray" target="_blank" :href="addon.link" />
          </f7-col>
        </f7-row>
        <f7-row no-gap style="margin-top: 0.5rem; margin-bottom: 0">
          <div class="addon-description">
            <addon-logo class="logo-square" :addon="addon" size="54" />
            <span class="text" v-html="description(addon)" />
          </div>
        </f7-row>
      </f7-block>
    </f7-list-item>/>
  </f7-list>
</template>

<style lang="stylus">
.addons-setup-wizard
  .addon
    margin-top: 0.5rem
    margin-bottom: 0.5rem
    padding: 0
    .addon-description
      width 100%
      display flex
      .logo-square
        background white
        border-radius 10%
        width 64px
        height 64px
        margin-top 6.5px
        display flex
        justify-content center
        align-items center
        .logo
          margin-left 0
          max-height 54px
          max-width 54px
      .text
        margin-left 0.5rem
        max-width calc(100% - 64px - 0.5rem)
</style>

<script>
import AddonLogo from '@/components/addons/addon-logo.vue'

import { loadLocaleMessages } from '@/js/i18n'

export default {
  model: {
    prop: 'selected',
    event: 'update'
  },
  props: ['addons', 'selectedAddons'],
  components: {
    AddonLogo
  },
  data () {
    return {
      selected: []
    }
  },
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/setup-wizard'))
  },
  methods: {
    selectedAddon (addon) {
      if (typeof this.selectedAddons === 'undefined') return true
      return this.selectedAddons.includes(addon)
    },
    changeAddonSelection (addon, event) {
      if (event.target.checked) {
        this.$set(this, 'selected', [...new Set(this.selected.concat(addon))])
      } else {
        this.$set(this, 'selected', this.selected.filter(a => (a.uid !== addon.uid)))
      }
      this.$emit('update', this.selected)
    },
    description (addon) {
      const line1 = this.$t('setupwizard.addon.' + addon.uid + '.line1')
      const line2 = this.$t('setupwizard.addon.' + addon.uid + '.line2')
      const hasLine1 = (line1 !== 'setupwizard.addon.' + addon.uid + '.line1')
      const hasLine2 = (line2 !== 'setupwizard.addon.' + addon.uid + '.line2')
      let descr = (hasLine1 ? line1 : '') + (hasLine2 ? ('<br>' + line2) : '')
      return descr || addon.description || (addon.uid + '<br>' + addon.version)
    }
  },
  mounted () {
    this.selected = this.addons
  }
}
</script>
