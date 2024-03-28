<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar large :large-transparent="false" title-large="Health checks" title="Health checks" back-link="Back"
               back-link-url="/settings/" back-link-force />
    <f7-block class="block-narrow">
      <!-- TODO how to make content in this block algin left? -->
      <f7-block-title medium>
        Health checks
      </f7-block-title>
      <f7-block-footer>
        This page provides information about potential issues with your openHAB
        setup. It is recommended to fix these issues to ensure a stable and
        reliable system.
      </f7-block-footer>
    </f7-block>

    <f7-block class="block-narrow">
      <f7-block-title>Health checks</f7-block-title>
      <f7-list media-list class="col">
        <f7-list-item media-item link="orphanlinks" title="Orphan Links"
                      :badge="orphanLinksCount > 0 ? orphanLinksCount : undefined"
                      :after="orphanLinksCount > 0 ? undefined : orphanLinksCount" :badge-color="orphanLinksCount ? 'red' : 'blue'"
                      :footer="objectsSubtitles.orphanlinks">
          <f7-icon slot="media" f7="link" color="gray" />
        </f7-list-item>
      </f7-list>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      objectsSubtitles: {
        orphanlinks:
          'Items pointing to non-existent thing channels or vica versa'
      },
      orphanLinksCount: '',

      expandedTypes: {
        systemSettings: this.$f7.width >= 1450
      }
    }
  },
  computed: {
    apiEndpoints () {
      return this.$store.state.apiEndpoints
    }
  },
  watch: {
    apiEndpoints () {
      this.loadCounters()
    }
  },
  methods: {
    sortByLabel (s1, s2) {
      return s1.label.toLowerCase() > s2.label.toLowerCase() ? 1 : -1
    },
    loadCounters () {
      console.log('Hei')
      if (!this.apiEndpoints) return
      console.log('På')
      if (this.$store.getters.apiEndpoint('links')) {
        this.$oh.api.get('/rest/links/orphans').then((data) => {
          this.orphanLinksCount = data.length.toString()
        })
      }
      console.log('Deg')
    },
    onPageAfterIn () {
      this.loadCounters()
    }
  }
}
</script>
