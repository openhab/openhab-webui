<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="'Configure ' + addon.label + dirtyIndicator" back-link="Back">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block v-if="type === 'persistence'" class="block-narrow">
      <f7-col>
        <f7-button large fill color="blue" :href="'/settings/persistence/' + name" class="persistence-button">
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
import ConfigSheet from '@/components/config/config-sheet.vue'
import DirtyMixin from '@/pages/settings/dirty-mixin'

export default {
  mixins: [DirtyMixin],
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
      strippedAddonId: '',
      loadingConfig: true,
      loadingLoggers: true
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
        if (!this.loadingConfig) {
          this.dirty = true
        }
      },
      deep: true
    },
    loggerPackages: {
      handler: function () {
        if (!this.loadingLoggers) {
          this.dirty = true
        }
      },
      deep: true
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
        promises.push(this.$oh.api.put('/rest/addons/' + this.strippedAddonId + '/config' + (this.serviceId ? '?serviceId=' + this.serviceId : ''), this.config))
      }

      Promise.all(promises).then(() => {
        this.$f7.toast.create({
          text: 'Saved',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
      this.dirty = false
      this.$f7router.back()
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

    this.$oh.api.get(requestUri).then(data => {
      this.addon = data
      const configDescriptionURI = this.addon.configDescriptionURI

      if (configDescriptionURI) {
        this.$oh.api.get('/rest/config-descriptions/' + configDescriptionURI).then(data2 => {
          this.configDescription = data2
          this.$oh.api.get('/rest/addons/' + this.strippedAddonId + '/config' + (this.serviceId ? '?serviceId=' + this.serviceId : '')).then(data3 => {
            this.config = data3
            this.$nextTick(() => {
              this.loadingConfig = false
            })
          })
        })
      } else {
        this.loadingConfig = false
      }
      if (Array.isArray(this.addon.loggerPackages)) {
        this.addon.loggerPackages.forEach(loggerPackage => {
          this.$oh.api.get('/rest/logging/' + loggerPackage).then(data4 => {
            data4.loggers.forEach(logger => this.loggerPackages.push(logger))
            this.$nextTick(() => {
              this.loadingLoggers = false
            })
          })
        })
      } else {
        this.loadingLoggers = false
      }
    })
  }
}
</script>
