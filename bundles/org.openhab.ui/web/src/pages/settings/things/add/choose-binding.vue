<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar title="Choose Binding" back-link="Back">
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-things"
          :init="initSearchbar"
          search-container=".binding-list"
          search-in=".item-title, .item-header, .item-footer"
          :disable-button="!$theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>

    <empty-state-placeholder v-if="ready && !bindings.length" icon="circle_grid_hex" title="things.nobindings.title" text="things.nobindings.text" />

    <f7-block class="block-narrow">
      <f7-col>
        <f7-list v-if="!ready" class="col binding-list">
          <f7-list-group>
            <f7-list-item
              v-for="n in 10"
              media-item
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the binding"
              header="BindingID"
              footer="This contains the description of the binding" />
          </f7-list-group>
        </f7-list>
        <f7-list v-else class="col">
          <f7-list-item
            v-for="binding in bindings"
            media-item
            :key="binding.uid"
            :link="binding.id"
            :title="binding.label"
            :header="binding.uid"
            :badge="inbox.filter((e) => e.thingTypeUID.split(':')[0] === binding.id && e.flag !== 'IGNORED').length || undefined"
            badge-color="red"
            :footer="(binding.description && binding.description.indexOf('<br>') >= 0) ?
              binding.description.split('<br>')[0] : binding.description" />
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block class="block-narrow" v-if="$store.getters.apiEndpoint('addons')">
      <f7-col v-if="bindings.length">
        <f7-list>
          <f7-list-button color="blue" title="Install More Bindings" href="/addons/" />
        </f7-list>
      </f7-col>
      <f7-row v-else-if="ready" class="display-flex justify-content-center">
        <f7-button large fill color="blue" href="/addons/">
          Install Bindings
        </f7-button>
      </f7-row>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
  components: {
    'empty-state-placeholder': () => import('@/components/empty-state-placeholder.vue')
  },
  data () {
    return {
      ready: false,
      loading: false,
      initSearchbar: false,
      bindings: [],
      inbox: []
    }
  },
  methods: {
    onPageAfterIn () {
      this.loading = true
      this.$oh.api.get('/rest/addons?serviceId=all').then((data) => {
        let installedBindings = data.filter(addon => addon.type === 'binding' && addon.installed === true)
        this.bindings = installedBindings.sort((a, b) => a.label.localeCompare(b.label))
        this.loading = false
        this.initSearchbar = true
        this.ready = true
        this.$nextTick(() => {
          if (this.$device.desktop && this.$refs.searchbar) {
            this.$refs.searchbar.f7Searchbar.$inputEl[0].focus()
          }
        })
      })
      this.$oh.api.get('/rest/inbox').then((data) => {
        this.inbox = data
      })
    }
  }
}
</script>
