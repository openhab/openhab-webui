<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar title="Choose Binding" back-link="Back">
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          class="searchbar-things"
          :init="initSearchbar"
          search-container=".binding-list"
          search-in=".item-title, .item-header, .item-footer"
          remove-diacritics
          :disable-button="!$theme.aurora"
        ></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <f7-list-index
      ref="listIndex"
      list-el=".binding-list"
      :scroll-list="true"
      :label="true"
    ></f7-list-index>

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
              footer="This contains the description of the binding">
            </f7-list-item>
          </f7-list-group>
        </f7-list>
        <f7-list v-else class="col">
          <f7-list-item
            v-for="binding in bindings"
            media-item
            :key="binding.id"
            :link="binding.id"
            :title="binding.name"
            :header="binding.id"
            :badge="inbox.filter((e) => e.thingTypeUID.split(':')[0] === binding.id && e.flag !== 'IGNORED').length || undefined"
            badge-color="red"
            :footer="(binding.description && binding.description.indexOf('<br>') >= 0) ?
                      binding.description.split('<br>')[0] : binding.description">
          </f7-list-item>
        </f7-list>

      </f7-col>
      <f7-col v-if="bindings.length">
        <f7-list>
          <f7-list-button color="blue" title="Install More Bindings" href="install-binding" />
        </f7-list>
      </f7-col>
      <f7-row v-else-if="ready" class="display-flex justify-content-center">
        <f7-button large fill color="blue" href="install-binding">Install Bindings</f7-button>
      </f7-row>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
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
      this.$oh.api.get('/rest/bindings').then((data) => {
        this.bindings = data.sort((a, b) => a.name.localeCompare(b.name))
        this.loading = false
        this.initSearchbar = true
        this.ready = true
      })
      this.$oh.api.get('/rest/inbox').then((data) => {
        this.inbox = data
      })
    }
  }
}
</script>

<style>
</style>
