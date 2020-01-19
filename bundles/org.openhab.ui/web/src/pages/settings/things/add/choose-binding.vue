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
    <f7-block class="block-narrow">
      <f7-col>
        <f7-list v-if="!ready" class="col binding-list">
          <f7-list-group>
            <f7-list-item
              v-for="n in 10"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the binding"
              header="BindingID"
              footer="This contains the description of the binding"
              media-item
            >
            </f7-list-item>
          </f7-list-group>
        </f7-list>
        <f7-list v-else class="col">
          <f7-list-item v-for="binding in bindings"
            :key="binding.id"
            :link="binding.id"
            :title="binding.name"
            :header="binding.id"
            :footer="binding.description"
            media-item
          >
          </f7-list-item>
        </f7-list>

      </f7-col>
    </f7-block>
    <f7-block v-if="ready && !bindings.length" class="block-narrow">
      <f7-col>
        <f7-block strong>
          <p>No bindings available.</p>
        </f7-block>
      </f7-col>
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
      bindings: []
    }
  },
  created () {

  },
  methods: {
    onPageAfterIn () {
      // this.$f7.preloader.show()
      this.loading = true
      this.$oh.api.get('/rest/bindings').then((data) => {
        this.bindings = data.sort((a, b) => a.name.localeCompare(b.name))
        this.loading = false
        this.initSearchbar = true
        this.ready = true
      })
    }
  }
}
</script>

<style>
</style>
