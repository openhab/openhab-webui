<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content :title="'Configure ' + addon.label + dirtyIndicator"
                      :save-link="`Save${$device.desktop ? ' (Ctrl-S)' : ''}`"
                      @save="save()"
                      :f7router />
    </f7-navbar>
    <f7-block v-if="type === 'persistence'" class="block-narrow">
      <f7-col>
        <f7-button large
                   fill
                   color="blue"
                   :href="'/settings/persistence/' + name"
                   class="persistence-button">
          Configure Persistence Policies
        </f7-button>
      </f7-col>
    </f7-block>
    <f7-block form v-if="configDescription && config" class="block-narrow">
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
    <f7-block form v-if="loggerPackages.length > 0" class="block-narrow">
      <f7-col>
        <f7-block-title medium>
          Add-on log settings
        </f7-block-title>
        <f7-list class="col wide">
          <f7-list-item v-for="loggerPackage in loggerPackages"
                        :key="loggerPackage.loggerName"
                        :title="loggerPackage.loggerName">
            <f7-input type="select"
                      :value="loggerPackage.level"
                      @input="loggerPackage.level = $event.target.value">
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

<style lang="stylus">
.config-sheet
  .config-parameter
    margin-top 0px
    margin-bottom 0px

.persistence-button
  @media (max-width 1023px)
    margin-left 16px
    margin-right 16px
</style>

<script>
import { f7, theme } from 'framework7-vue'

import ConfigSheet from '@/components/config/config-sheet.vue'
import DirtyMixin from '@/pages/settings/dirty-mixin'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'
import debounce from 'debounce'

export default {
  mixins: [DirtyMixin],
  components: {
    ConfigSheet
  },
  props: {
    addonId: String,
    f7router: Object
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      addon: {},
      configDescription: null,
      config: null,
      originalConfig: null,
      bindingId: null,
      loggerPackages: [],
      originalLoggerPackages: [],
      serviceId: null,
      strippedAddonId: '',
      configLoaded: false,
      loggersLoaded: false
    }
  },
  computed: {
    type () {
      return this.addonId.split('-')[0]
    },
    name () {
      return this.addonId.split('-')[1]
    }
  },
  watch: {
    config: {
      handler: function () {
        this.checkDirty()
      },
      deep: true
    },
    loggerPackages: {
      handler: function () {
        this.checkDirty()
      },
      deep: true
    }
  },
  methods: {
    checkDirty: debounce(function () {
      const configChanged = this.configLoaded && !fastDeepEqual(this.config, this.originalConfig)
      const loggersChanged = this.loggersLoaded && !fastDeepEqual(this.loggerPackages, this.originalLoggerPackages)
      this.dirty = configChanged || loggersChanged
    }, 100),
    save () {
      let promises = []

      const originalLoggerMap = Object.fromEntries(this.originalLoggerPackages.map((l) => [l.loggerName, l.level]))
      this.loggerPackages.forEach((logger) => {
        if (logger.level !== originalLoggerMap[logger.loggerName]) {
          if (logger.level === 'DEFAULT') {
            promises.push(this.$oh.api.delete('/rest/logging/' + logger.loggerName))
          } else {
            promises.push(this.$oh.api.put('/rest/logging/' + logger.loggerName, logger))
          }
        }
      })

      if (this.configDescription && this.config) {
        promises.push(this.$oh.api.put('/rest/addons/' + this.strippedAddonId + '/config' + (this.serviceId ? '?serviceId=' + this.serviceId : ''), this.config))
      }

      Promise.all(promises).then(() => {
        f7.toast.create({
          text: 'Saved',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
      this.dirty = false
      this.f7router.back()
    },
    onPageAfterIn () {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    keyDown (ev) {
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        this.save()
        ev.stopPropagation()
        ev.preventDefault()
      }
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

    this.$oh.api.get(requestUri).then((data) => {
      this.addon = data
      const configDescriptionURI = this.addon.configDescriptionURI

      if (configDescriptionURI) {
        this.$oh.api.get('/rest/config-descriptions/' + configDescriptionURI).then((data2) => {
          this.configDescription = data2
          this.$oh.api.get('/rest/addons/' + this.strippedAddonId + '/config' + (this.serviceId ? '?serviceId=' + this.serviceId : '')).then((data3) => {
            this.originalConfig = data3
            this.config = cloneDeep(data3)
            this.configLoaded = true
          })
        })
      }
      if (Array.isArray(this.addon.loggerPackages)) {
        const promises = this.addon.loggerPackages.map((logger) => this.$oh.api.get('/rest/logging/' + logger))
        Promise.all(promises).then((data) => {
          this.originalLoggerPackages = data.flatMap((logging) => logging.loggers).sort((a, b) => a.loggerName.localeCompare(b.loggerName))
          this.loggerPackages = cloneDeep(this.originalLoggerPackages)
          this.loggersLoaded = true
        })
      }
    })
  }
}
</script>
