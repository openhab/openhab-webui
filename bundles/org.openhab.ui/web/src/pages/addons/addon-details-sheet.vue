<template>
  <f7-sheet ref="sheet"
            class="demo-sheet-swipe-to-step"
            @sheet:closed="$emit('closed')"
            swipe-to-close
            swipe-to-step
            backdrop>
    <div class="sheet-modal-swipe-step">
      <div v-if="!noDetails" class="swipe-handler" @click="toggleSwipeStep" />
      <f7-block-title>
        <strong>{{ addon.label }}</strong>
      </f7-block-title>
      <f7-block v-if="state === 'UNINSTALLED'">
        <div v-if="addon.verifiedAuthor" class="text-color-green display-flex align-items-center">
          <f7-icon f7="checkmark_shield" class="margin-right" />
          Verified Author
        </div>
        <h3 v-else-if="showUnpublishedWarning" class="text-color-red display-flex align-items-center">
          <f7-icon f7="xmark_shield" class="margin-right" />
          WARNING! UNPUBLISHED ADD-ON
        </h3>
        <div v-else-if="showUnverifiedAuthorWarning" class="text-color-orange display-flex align-items-center">
          <f7-icon f7="exclamationmark_shield" class="margin-right" />
          Unverified Author
        </div>
        <f7-block-footer v-if="showUnpublishedWarning" class="display-flex align-items-center text-color-red">
          This add-on has not been published to the Marketplace. DO NOT install this add-on, unless
          for debugging purposes if you are the author or a marketplace curator!<br><br>
          Please make sure "Show Unpublished Entries" is not inadvertently turned on in Settings >
          Community Marketplace.
        </f7-block-footer>
        <f7-block-footer v-if="showUnverifiedAuthorWarning" class="display-flex align-items-center">
          <small>Adding this type of add-on from unknown providers can harm your system because its code
            might not have been properly reviewed. Make sure you trust the source and understand the
            risks before installing this add-on.</small>
        </f7-block-footer>
      </f7-block>
      <f7-block>
        <f7-row>
          <f7-col class="col-100 margin-top padding-horizontal">
            <f7-button v-if="state === 'UNINSTALLED'"
                       large
                       fill
                       color="blue"
                       @click="install()">
              {{ installableAddon ? 'Install' : 'Add' }}
            </f7-button>
            <f7-button v-if="state !== 'UNINSTALLED'"
                       large
                       fill
                       color="red"
                       @click="uninstall()">
              {{ installableAddon ? 'Uninstall' : 'Remove' }}
            </f7-button>
          </f7-col>
        </f7-row>
      </f7-block>
      <f7-block class="padding-bottom no-margin-vertical" @click="toggleSwipeStep">
        <div v-if="!noDetails" class="margin-top margin-bottom text-align-center" style="cursor: pointer">
          <f7-icon f7="chevron_down_circle" />&nbsp;Expand for details
        </div>
      </f7-block>
    </div>
    <f7-page-content v-if="!noDetails" style="margin-top: var(--f7-safe-area-top)">
      <addon-info-table :addon="addon" class="no-margin-top" />
    </f7-page-content>
  </f7-sheet>
</template>

<style lang="stylus">
.demo-sheet-swipe-to-step
  height auto

.demo-sheet-swipe-to-close,
.demo-sheet-swipe-to-step {
  --f7-sheet-border-color: transparent;
  border-radius: 15px 15px 0 0;
  overflow: hidden;
}
.swipe-handler {
  height: 16px;
  position: absolute;
  left: 0;
  width: 100%;
  top: 0;
  cursor: pointer;
  z-index: 10;
}
.swipe-handler:after {
  content: '';
  width: 36px;
  height: 6px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -18px;
  margin-top: -3px;
  border-radius: 3px;
  background: #666;
}

@media (min-width: 1024px)
  .demo-sheet-swipe-to-close, .demo-sheet-swipe-to-step
    margin-left 15%
    margin-right 15%
    width calc(100% - 30%)

@media (min-width: 1280px)
  .demo-sheet-swipe-to-close, .demo-sheet-swipe-to-step
    margin-left 30%
    margin-right 30%
    width: calc(100% - 60%)
</style>

<script>
import { f7 } from 'framework7-vue'

import AddonInfoTable from '@/components/addons/addon-info-table.vue'

export default {
  props: {
    addonId: String,
    serviceId: String,
    opened: Boolean,
    noDetails: Boolean
  },
  components: {
    AddonInfoTable
  },
  emits: ['closed', 'install', 'uninstall'],
  data () {
    return {
      addon: {},
      bindingInfo: {}
    }
  },
  watch: {
    opened (state) {
      let self = this
      if (state) {
        if (!this.addonId) {
          this.addon = {}
          this.bindingInfo = {}
          return
        }
        f7.preloader.show()
        this.$oh.api.get('/rest/addons/' + this.addonId + (this.serviceId ? '?serviceId=' + this.serviceId : '')).then((data) => {
          this.addon = data

          f7.preloader.hide()
          setTimeout(() => {
            if (!this.noDetails) this.$refs.sheet.$el.f7Modal.setSwipeStep()
            this.$refs.sheet.$el.f7Modal.open()
          })
        })
      } else {
        this.$refs.sheet.$el.f7Modal.close()
      }
    }
  },
  computed: {
    state () {
      // TODO: figure out somehow whether the addon is BEING installed/uninstalled.
      if (!this.addon) return 'UNKNOWN'
      return this.addon.installed ? 'INSTALLED' : 'UNINSTALLED'
    },
    installableAddon () {
      return (this.addon && this.addon.contentType && (this.addon.contentType === 'application/vnd.openhab.bundle' || this.addon.contentType.indexOf('application/vnd.openhab.feature') === 0))
    },
    showUnverifiedAuthorWarning () {
      return this.addon && !this.addon.verifiedAuthor && this.installableAddon
    },
    showUnpublishedWarning () {
      return (this.serviceId === 'marketplace' && this.addon.properties && this.addon.properties.tags && this.addon.properties.tags.indexOf('published') < 0)
    }
  },
  methods: {
    toggleSwipeStep () {
      const self = this
      self.$refs.sheet.$el.f7Modal.stepToggle('.demo-sheet-swipe-to-step')
    },
    install () {
      this.$oh.api.post('/rest/addons/' + this.addonId + '/install' + (this.serviceId ? '?serviceId=' + this.serviceId : ''), {}, 'text').then((data) => {
        this.$emit('install', this.addon)
      })
    },
    uninstall () {
      this.$oh.api.post('/rest/addons/' + this.addonId + '/uninstall' + (this.serviceId ? '?serviceId=' + this.serviceId : ''), {}, 'text').then((data) => {
        this.$emit('uninstall', this.addon)
      })
    }
  }
}
</script>
