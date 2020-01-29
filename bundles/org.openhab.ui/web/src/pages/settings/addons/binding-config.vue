<template>
  <f7-page>
    <f7-navbar :title="'Configure ' + binding.name" back-link="Bindings">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block form v-if="configDescriptions && config" class="service-config block-narrow">
      <f7-col>
        <config-sheet
          :parameter-groups="configDescriptions.parameterGroups"
          :parameters="configDescriptions.parameters"
          :configuration="config"
        />
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  components: {
    ConfigSheet
  },
  props: ['bindingId'],
  data () {
    return {
      binding: {},
      configDescriptions: null,
      config: null
    }
  },
  methods: {
    save () {
      this.$oh.api.put('/rest/bindings/' + this.bindingId + '/config', this.config).then(() => {
        this.$f7.toast.create({
          text: 'Saved',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
      this.$f7router.back()
    }
  },
  created () {
    this.$oh.api.get('/rest/bindings').then(data => {
      this.binding = data.find((b) => b.id === this.bindingId)

      if (this.binding.configDescriptionURI) {
        this.$oh.api.get('/rest/config-descriptions/' + this.binding.configDescriptionURI).then(data2 => {
          this.configDescriptions = data2

          this.$oh.api.get('/rest/bindings/' + this.bindingId + '/config').then(data3 => {
            this.config = data3
          })
        })
      }
    })
  }
}
</script>

<style lang="stylus">
.service-config
  .item-input-info
    white-space  normal
</style>
