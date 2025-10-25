<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Persistence Settings"
                      back-link="Settings"
                      back-link-url="/settings/"
                      :save-link="persistenceList.length > 0 ? `Save${$device.desktop ? ' (Ctrl-S)' : ''}` : ''"
                      @save="save()"
                      :f7router />
    </f7-navbar>

    <f7-block form v-if="ready && persistenceList.length" class="block-narrow">
      <f7-col>
        <f7-block-title medium>
          General Settings
        </f7-block-title>
        <config-sheet
          :parameter-groups="configDescriptions.parameterGroups"
          :parameters="configDescriptions.parameters"
          :configuration="config"
          :set-empty-config-as-null="true" />
      </f7-col>
    </f7-block>
    <f7-block v-if="ready && persistenceList.length" class="block-narrow">
      <f7-col>
        <f7-block-title medium>
          Configure Persistence Policies
        </f7-block-title>
        <f7-list>
          <f7-list-item
            v-for="persistence in persistenceList"
            media-item
            :key="persistence.id"
            :link="persistence.id"
            :title="persistence.label"
            :footer="persistence.id" />
          <f7-list-item link="/addons/persistence/"
                        no-chevron
                        media-item
                        :color="theme.dark ? 'black' : 'white'"
                        subtitle="Install more persistence add-ons">
            <template #media>
              <f7-icon color="green"
                       aurora="f7:plus_circle_fill"
                       ios="f7:plus_circle_fill"
                       md="material:control_point" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !persistenceList.length" class="block-narrow">
      <empty-state-placeholder icon="download_circle" title="persistence.title" text="persistence.text" />
      <f7-row class="display-flex justify-content-center">
        <f7-button large
                   fill
                   color="blue"
                   external
                   :href="`${runtimeStore.websiteUrl}/link/persistence`"
                   target="_blank"
                   :text="$t('home.overview.button.documentation')" />
        <span style="width: 8px" />
        <f7-button large
                   fill
                   color="blue"
                   href="/addons/persistence/">
          Install a persistence add-on
        </f7-button>
      </f7-row>
    </f7-block>
  </f7-page>
</template>

<style lang="stylus">
.config-sheet
  .config-parameter
    margin-top 0px
    margin-bottom 0px
</style>

<script>
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import DirtyMixin from '../dirty-mixin'
import ConfigSheet from '@/components/config/config-sheet.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

export default {
  mixins: [DirtyMixin],
  components: {
    EmptyStatePlaceholder,
    ConfigSheet
  },
  props: {
    f7router: Object
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      loading: false,
      ready: false,
      serviceId: 'org.openhab.persistence',
      persistenceList: [],
      configDescriptions: null,
      config: null
    }
  },
  computed: {
    ...mapStores(useRuntimeStore)
  },
  watch: {
    config: {
      handler: function () {
        if (!this.loading) {
          this.dirty = true
        }
      },
      deep: true
    }
  },
  methods: {
    onPageAfterIn () {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.load()
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    load () {
      if (this.loading) return
      this.loading = true

      this.$oh.api.get('/rest/persistence').then((data) => {
        this.persistenceList = data
      })
      this.$oh.api.get('/rest/services/' + this.serviceId).then((data) => {
        if (data.configDescriptionURI) {
          this.$oh.api.get('/rest/config-descriptions/' + data.configDescriptionURI).then((data2) => {
            this.configDescriptions = data2
            this.$oh.api.get('/rest/services/' + this.serviceId + '/config').then((data3) => {
              this.config = data3
              nextTick(() => {
                this.loading = false
                this.ready = true
              })
            })
          })
        }
      })
    },
    save () {
      this.$oh.api.put('/rest/services/' + this.serviceId + '/config', this.config).then(() => {
        f7.toast.create({
          text: 'Default persistence setting saved',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
      this.dirty = false
    },
    keyDown (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        switch (ev.keyCode) {
          case 83:
            this.save()
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    }
  }
}
</script>
