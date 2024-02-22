<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar title="Persistence Settings" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right v-if="persistenceList.length > 0">
        <developer-dock-icon />
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
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
          <f7-list-item link="/addons/other/" no-chevron media-item :color="($theme.dark) ? 'black' : 'white'" subtitle="Install more persistence add-ons">
            <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !persistenceList.length" class="block-narrow">
      <empty-state-placeholder icon="download_circle" title="persistence.title" text="persistence.text" />
      <f7-row class="display-flex justify-content-center">
        <f7-button large fill color="blue" external :href="`${$store.state.websiteUrl}/link/persistence`" target="_blank" v-t="'home.overview.button.documentation'" />
        <span style="width: 8px" />
        <f7-button large fill color="blue" href="/addons/other/">
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
import DirtyMixin from '../dirty-mixin'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  mixins: [DirtyMixin],
  components: {
    'empty-state-placeholder': () => import('@/components/empty-state-placeholder.vue'),
    ConfigSheet
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
        this.$set(this, 'persistenceList', data)
      })
      this.$oh.api.get('/rest/services/' + this.serviceId).then(data => {
        if (data.configDescriptionURI) {
          this.$oh.api.get('/rest/config-descriptions/' + data.configDescriptionURI).then(data2 => {
            this.$set(this, 'configDescriptions', data2)
            this.$oh.api.get('/rest/services/' + this.serviceId + '/config').then(data3 => {
              this.$set(this, 'config', data3)
              this.$nextTick(() => {
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
        this.$f7.toast.create({
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
