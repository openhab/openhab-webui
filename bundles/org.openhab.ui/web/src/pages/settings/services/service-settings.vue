<template>
  <f7-page class="service-config">
    <f7-navbar :title="service.label" back-link="Settings">
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

<style lang="stylus">
.service-config
  overflow-x hidden !important
  .item-input-info
    white-space normal
</style>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  components: {
    ConfigSheet
  },
  props: ['serviceId'],
  data () {
    return {
      service: {},
      configDescriptions: null,
      config: null
    }
  },
  methods: {
    save () {
      this.$oh.api.put('/rest/services/' + this.serviceId + '/config', this.config).then(() => {
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
    this.$oh.api.get('/rest/services/' + this.serviceId).then(data => {
      this.service = data

      if (this.service.configDescriptionURI) {
        this.$oh.api.get('/rest/config-descriptions/' + this.service.configDescriptionURI).then(data2 => {
          this.configDescriptions = data2

          this.$oh.api.get('/rest/services/' + this.serviceId + '/config').then(data3 => {
            this.config = data3
          })
        })
      }
    })
  }
}
</script>
