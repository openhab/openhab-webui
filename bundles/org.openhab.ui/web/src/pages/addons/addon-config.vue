<template>
  <f7-page ref="addon-config-page" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content
        :title="'Configure ' + addon.label + dirtyIndicator"
        :save-link="`Save${$device.desktop ? ' (Ctrl-S)' : ''}`"
        @save="save()"
        :f7router />
    </f7-navbar>
    <f7-block v-if="type === 'persistence'" class="block-narrow">
      <f7-col>
        <f7-button large fill color="theme-alt" :href="'/settings/persistence/' + name" class="persistence-button">
          Configure Persistence Policies
        </f7-button>
      </f7-col>
    </f7-block>

    <f7-block v-if="configDescription && config" form class="block-narrow">
      <f7-col>
        <config-sheet
          title="Add-on Configuration"
          :parameter-groups="configDescription.parameterGroups"
          :parameters="configDescription.parameters"
          :configuration="config" />
      </f7-col>
    </f7-block>
    <f7-block v-if="loggerPackages.length > 0" form class="block-narrow">
      <f7-col>
        <group-box :title="'Logging Levels'">
          <f7-list class="no-margin-top no-margin-bottom">
            <f7-list-item v-for="loggerPackage in loggerPackages" :key="loggerPackage.loggerName" class="logger-row-stacked">
              <div class="logger-container">
                <div class="logger-name">{{ loggerPackage.loggerName }}</div>

                <div class="custom-segmented-track">
                  <button
                    v-for="level in ['DEFAULT', 'OFF', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']"
                    :key="level"
                    type="button"
                    :class="{ 'segment-active': loggerPackage.level === level }"
                    @click="loggerPackage.level = level">
                    {{ level }}
                  </button>
                </div>
              </div>
            </f7-list-item>
          </f7-list>
        </group-box>
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

.config-page-header
  margin-top 24px !important
  margin-bottom 8px !important

  .header-flex-wrapper
    display flex // <-- CRITICAL: Tells the browser to use flexbox rules
    flex-direction column // Stacks nicely on small mobile screens
    justify-content space-between
    gap 12px
    padding-bottom 12px
    border-bottom 1px solid rgba(255, 255, 255, 0.08)

    // Snap to side-by-side layout on tablets & desktop screens
    @media (min-width: 768px)
      flex-direction row
      align-items flex-end // Snaps the toggle to the bottom line of the text description

  .header-main-text
    h2
      margin 0 0 4px 0
      font-size 18px // Sized down slightly to match standard dashboard headers
      font-weight 600
    p
      margin 0
      font-size 13px
      color rgba(255, 255, 255, 0.45)
      line-height 1.4

  .advanced-toggle-label
    display flex
    align-items center
    gap 8px
    cursor pointer
    user-select none
    font-size 13px
    font-weight 500
    color var(--f7-theme-color, #ff9500) // Keeps your unified theme tint matching
    white-space nowrap

    @media (min-width: 768px)
      padding-bottom 4px // Matches alignment beautifully to description baseline on desktop

    input[type="checkbox"]
      accent-color var(--f7-theme-color, #ff9500)

.logger-row-stacked
  .item-content, .item-inner
    display block

  .logger-container
    padding 12px 0 14px

  .logger-name
    margin-bottom 12px

  .custom-segmented-track
    display flex
    border 1px solid var(--f7-theme-color)
    border-radius 6px
    overflow hidden

    button
      // flex 1
      background transparent
      border none
      color var(--f7-theme-color-text)
      opacity 0.45
      font-size 11px
      font-weight 600
      height 2em
      cursor pointer

      &:hover:not(.segment-active)
        background var(--f7-theme-color)
        color var(--f7-theme-color-text)
        opacity 0.65

      &.segment-active
        background var(--f7-theme-color, #ff9500)
        color var(--f7-theme-color-text, #fff)
        opacity 1
        font-weight 700

      & + button
        border-left 1px solid var(--f7-theme-color)
</style>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'
import debounce from 'debounce'
import { showToast } from '@/js/dialog-promises'
import { useDirty } from '@/pages/useDirty'

export default {
  components: {
    ConfigSheet
  },
  props: {
    addonId: String,
    f7router: Object
  },
  setup() {
    const { dirty, dirtyIndicator } = useDirty('addon-config-page')
    return { dirty, dirtyIndicator }
  },
  data() {
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
    type() {
      return this.addonId.split('-')[0]
    },
    name() {
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
    save() {
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
        promises.push(
          this.$oh.api.put(
            '/rest/addons/' + this.strippedAddonId + '/config' + (this.serviceId ? '?serviceId=' + this.serviceId : ''),
            this.config
          )
        )
      }

      Promise.all(promises).then(() => {
        showToast('Saved')
      })
      this.dirty = false
      this.f7router.back()
    },
    onPageAfterIn() {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
    },
    onPageBeforeOut() {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    keyDown(ev) {
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        this.save()
        ev.stopPropagation()
        ev.preventDefault()
      }
    }
  },
  created() {
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
          this.$oh.api
            .get('/rest/addons/' + this.strippedAddonId + '/config' + (this.serviceId ? '?serviceId=' + this.serviceId : ''))
            .then((data3) => {
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
