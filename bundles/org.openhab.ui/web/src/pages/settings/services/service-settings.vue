<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="service.label + dirtyIndicator" back-link="Settings">
      <f7-nav-right>
        <f7-link v-if="theme.md"
                 @click="save()"
                 icon-md="material:save"
                 icon-only />
        <f7-link v-if="!theme.md" @click="save()">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block form v-if="configDescriptions && config" class="block-narrow">
      <f7-col>
        <config-sheet
          :parameter-groups="configDescriptions.parameterGroups"
          :parameters="configDescriptions.parameters"
          :configuration="config"
          :set-empty-config-as-null="true" />
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'

import fastDeepEqual from 'fast-deep-equal/es6'
import cloneDeep from 'lodash/cloneDeep'

import ConfigSheet from '@/components/config/config-sheet.vue'
import DirtyMixin from '../dirty-mixin'

export default {
  mixins: [DirtyMixin],
  components: {
    ConfigSheet
  },
  props: {
    serviceId: String,
    f7router: Object
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      service: {},
      configDescriptions: null,
      config: null,
      savedConfig: {},
      loading: true
    }
  },
  watch: {
    config: {
      handler: function () {
        if (!this.loading) {
          this.dirty = !fastDeepEqual(this.config, this.savedConfig)
        }
      },
      deep: true
    }
  },
  methods: {
    save () {
      this.$oh.api.put('/rest/services/' + this.serviceId + '/config', this.config).then(() => {
        f7.toast.create({
          text: 'Saved',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
      if (this.serviceId === 'org.openhab.i18n') {
        f7.emit('sidebarRefresh', this.config.locale)
      }
      this.savedConfig = cloneDeep(this.config)
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
    this.$oh.api.get('/rest/services/' + this.serviceId).then((data) => {
      this.service = data

      if (this.service.configDescriptionURI) {
        this.$oh.api.get('/rest/config-descriptions/' + this.service.configDescriptionURI).then((data2) => {
          this.configDescriptions = data2

          this.$oh.api.get('/rest/services/' + this.serviceId + '/config').then((data3) => {
            this.config = data3
            this.savedConfig = cloneDeep(this.config)
            nextTick(() => {
              this.loading = false
            })
          })
        })
      }
    })
  }
}
</script>
