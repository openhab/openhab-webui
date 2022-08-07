<template>
  <f7-page>
    <f7-navbar :title="'Configure ' + addon.label" back-link="Back">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block form v-if="configDescription && config" class="service-config block-narrow">
      <f7-col>
        <f7-block-title medium>
          Add-on configuration
        </f7-block-title>
        <config-sheet
          :parameter-groups="configDescription.parameterGroups"
          :parameters="configDescription.parameters"
          :configuration="config" />
      </f7-col>
    </f7-block>
    <f7-block form v-if="loggerPackages.length > 0" class="service-config block-narrow">
      <f7-col>
        <f7-block-title medium>
          Add-on log settings
        </f7-block-title>
        <f7-list class="col wide">
          <f7-list-item v-for="loggerPackage in loggerPackages" :key="loggerPackage.loggerName"
                        :title="loggerPackage.loggerName">
            <f7-input type="select" :value="loggerPackage.level"
                      @input="loggerPackage.level = $event.target.value; loggerPackage.changed = true">
              <option value="DEFAULT">
                Default
              </option>
              <option value="TRACE">
                Trace
              </option>
              <option value="DEBUG">
                Debug
              </option>
              <option value="INFO">
                Info
              </option>
              <option value="WARN">
                Warning
              </option>
              <option value="ERROR">
                Error
              </option>
            </f7-input>
          </f7-list-item>
        </f7-list>
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
  props: ['addonId'],
  data () {
    return {
      addon: {},
      configDescription: null,
      config: null,
      bindingId: null,
      loggerPackages: [],
      serviceId: null,
      strippedAddonId: ''
    }
  },
  methods: {
    save () {
      let promises = []

      this.loggerPackages.forEach(logger => {
        if (logger.changed === true) {
          if (logger.level === 'DEFAULT') {
            promises.push(this.$oh.api.delete('/rest/logging/' + logger.loggerName))
          } else {
            delete logger.changed
            promises.push(this.$oh.api.put('/rest/logging/' + logger.loggerName, logger))
          }
        }
      })

      if (this.configDescription && this.config) {
        promises.push(this.$oh.api.put('/rest/bindings/' + this.bindingId + '/config', this.config))
      }

      Promise.all(promises).then(() => {
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
    let serviceSeparator = this.addonId.indexOf(':')
    if (serviceSeparator === -1) {
      this.strippedAddonId = this.addonId
    } else {
      this.strippedAddonId = this.addonId.substring(serviceSeparator + 1)
      this.serviceId = this.addonId.substring(0, serviceSeparator)
    }
    let requestUri = '/rest/addons/' + this.strippedAddonId + (this.serviceId ? '?serviceId=' + this.serviceId : '')

    this.$oh.api.get(requestUri).then(data => {
      this.addon = data
      let configDescriptionURI = this.addon.configDescriptionURI || ''
      if (configDescriptionURI.startsWith('binding')) {
        this.$oh.api.get('/rest/config-descriptions/' + configDescriptionURI).then(data2 => {
          this.configDescription = data2

          this.bindingId = configDescriptionURI.substring(configDescriptionURI.indexOf(':') + 1)
          this.$oh.api.get('/rest/bindings/' + this.bindingId + '/config').then(data3 => {
            this.config = data3
          })
        })
      }
      if (Array.isArray(this.addon.loggerPackages)) {
        this.addon.loggerPackages.forEach(loggerPackage => {
          this.$oh.api.get('/rest/logging/' + loggerPackage).then(data4 => {
            data4.loggers.forEach(logger => this.loggerPackages.push(logger))
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
