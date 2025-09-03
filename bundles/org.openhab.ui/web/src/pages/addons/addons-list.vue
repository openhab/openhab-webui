<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="addonPopupOpened = false" @page:afterout="stopEventSource">
    <f7-navbar>
      <f7-nav-left>
        <f7-link icon-f7="chevron_left" href="/settings/">
          Settings
        </f7-link>
      </f7-nav-left>
      <f7-nav-title>
        {{ 'Add-ons: ' + addonsLabels[addonType] }}
      </f7-nav-title>
    </f7-navbar>
    <f7-block form class="block-narrow">
      <f7-col>
        <f7-block-title v-if="!ready">
          Loading...
        </f7-block-title>
        <f7-block-title v-else-if="addons.length">
          {{ addons.length }} add-on{{ addons.length > 1 ? 's' : '' }} installed
        </f7-block-title>
        <f7-list media-list v-if="!ready">
          <f7-list-item
            v-for="n in 10"
            :key="n"
            :class="`skeleton-text skeleton-effect-blink`"
            title="Label of the binding"
            header="BindingID"
            footer="Binding version"
            media-item />
        </f7-list>
        <f7-list v-else>
          <f7-list-item v-for="addon in addons"
                        media-item
                        link="#"
                        :key="addon.uid"
                        @click="openAddonPopup(addon.uid)"
                        :header="addon.uid"
                        :footer="addon.version"
                        :after="currentlyUninstalling.indexOf(addon.uid) >= 0 ? 'Uninstalling...' : ''"
                        :title="addon.label" />
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block form v-if="ready && !addons.length" class="block-narrow">
      <empty-state-placeholder :icon="addonsIcons[addonType]"
                               :title="'No ' + addonsLabels[addonType] + ' installed yet'"
                               text="addons.text" />
    </f7-block>
    <template #fixed>
      <f7-fab position="right-bottom" color="blue" href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:close" md="material:close" aurora="f7:close" />
      </f7-fab>
    </template>
    <addon-details-sheet
      v-if="ready"
      :addon-id="currentAddonId"
      :opened="addonPopupOpened"
      @closed="addonPopupOpened = false"
      @uninstall="uninstallAddon" />
  </f7-page>
</template>

<script>
import { f7 } from 'framework7-vue'

import AddonDetailsSheet from './addon-details-sheet.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

export default {
  components: {
    'empty-state-placeholder': EmptyStatePlaceholder,
    AddonDetailsSheet
  },
  props: {
    addonType: String
  },
  data () {
    return {
      addons: [],
      ready: false,
      currentAddonId: null,
      addonPopupOpened: false,
      currentlyUninstalling: [],
      addonsLabels: {
        automation: 'automation add-ons',
        binding: 'bindings',
        persistence: 'persistence services',
        transformation: 'transformations',
        misc: 'miscellaneous add-ons',
        ui: 'user interfaces',
        voice: 'voice services'
      },
      addonsIcons: {
        automation: 'sparkles',
        binding: 'circle_grid_hex',
        persistence: 'download_circle',
        transformation: 'function',
        misc: 'rectangle_3_offgrid',
        ui: 'play_rectangle',
        voice: 'chat_bubble_2'
      }
    }
  },
  methods: {
    openAddonPopup (addonId) {
      this.currentAddonId = addonId
      this.addonPopupOpened = true
    },
    onPageAfterIn () {
      this.currentlyUninstalling = []
      this.load()
    },
    load () {
      this.$oh.api.get('/rest/addons').then((data) => {
        this.addons = data.filter((addon) => addon.installed && addon.type === this.addonType).sort((a, b) => a.label.toUpperCase().localeCompare(b.label.toUpperCase()))
        this.ready = true
        this.startEventSource()
      }).catch((err) => {
        // sometimes we get 502 errors ('Jersey is not ready yet!'), keep trying
        console.log('Error while accessing the API, retrying every 5 seconds: ', err)
        setTimeout(this.load, 5000)
      })
    },
    uninstallAddon (addon) {
      this.addonPopupOpened = false
      this.currentlyUninstalling.push(addon.uid)
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/addons/*/*', null, (event) => {
        console.log(event)
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'installed':
          case 'uninstalled':
            f7.emit('addonChange', null)
            this.stopEventSource()
            this.load()
            break
          case 'failed':
            f7.toast.create({
              text: `Uninstallation of add-on ${topicParts[2]} failed`,
              closeButton: true,
              destroyOnClose: true
            }).open()
            this.stopEventSource()
            this.load()
            break
        }
      }, () => {
        // in case of error, maybe the SSE connection was closed by the add-ons change itself - try reloading to refresh
        this.stopEventSource()
        this.load()
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    }
  }
}
</script>
