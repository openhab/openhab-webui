<template>
  <f7-list media-list>
    <f7-list-item v-for="addon in addons" :key="addon.uid" class="addons-setup-wizard">
      <f7-block class="addon display-flex flex-direction-column">
        <f7-row no-gap class="item-title">
          <f7-col width="10">
            <f7-checkbox checked :disabled="addon.installed" @change="$event.target.value ? selectAddon(addon) : unSelectAddon(addon)" />
          </f7-col>
          <f7-col width="70">
            {{ addon.label }}
          </f7-col>
          <f7-col v-if="addon.link" width="20" style="text-align: right">
            <f7-link icon-f7="doc_text_search" :external="true" color="gray" target="_blank" :href="addon.link" />
          </f7-col>
        </f7-row>
        <f7-row no-gap style="margin-top: 0.5rem, margin-bottom: 0rem">
          <f7-col width="15">
            <addon-logo class="logo-square" :addon="addon" size="50" />
          </f7-col>
          <f7-col width="85">
            <span v-html="description(addon)" />
          </f7-col>
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
    .logo-square
      position relative
      background #fff
      width 100%
      margin-top 0.2em
      display flex
      align-items center
      &:after
        content ' '
        display block
        padding-bottom 100%
      .logo
        position absolute
        top 0px
        left 0px
        width calc(100% - 2px)
        height calc(100% - 2px)
        object-fit contain
</style>

<script>
import { loadLocaleMessages } from '@/js/i18n'
import AddonLogo from '@/components/addons/addon-logo.vue'
export default {
  props: ['addons'],
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
    selectAddon (addon) {
      this.selected = [...new Set(this.selected.concat(addon))]
      this.$emit('updated', this.selected)
    },
    unSelectedAddon (addon) {
      this.selected = this.selected.filter(a => (a.uid !== addon.uid))
      this.$emit('updated', this.selected)
    },
    description (addon) {
      let line1 = this.$t('setupwizard.addon.' + addon.uid + '.line1')
      const hasLine1 = (line1 !== 'setupwizard.addon.' + addon.uid + '.line1')
      line1 = hasLine1 ? line1 : addon.uid
      let line2 = this.$t('setupwizard.addon.' + addon.uid + '.line2')
      const hasLine2 = (line2 !== 'setupwizard.addon.' + addon.uid + '.line2')
      line2 = hasLine1 ? (hasLine2 ? line2 : '') : addon.version
      return line1 + (line2 ? '<br>' + line2 : '')
    }
  },
  mounted () {
    this.selected = this.addons
  }
}
</script>
