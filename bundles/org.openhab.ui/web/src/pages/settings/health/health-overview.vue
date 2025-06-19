<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar title="Health Checks" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <developer-dock-icon />
      </f7-nav-right>
    </f7-navbar>

    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-footer class="padding-horizontal">
          This page provides information about potential issues with your openHAB setup.
          <br>
          It is recommended to fix these issues to ensure a stable and reliable system.
        </f7-block-footer>
      </f7-col>
    </f7-block>

    <f7-block v-if="orphanLinksCount !== '0'" class="block-narrow">
      <f7-col>
        <f7-list media-list>
          <f7-list-item
            media-item
            link="orphanlinks/"
            title="Orphan Links"
            :badge="orphanLinksCount > 0 ? orphanLinksCount : undefined"
            :after="orphanLinksCount > 0 ? undefined : orphanLinksCount"
            :badge-color="orphanLinksCount ? 'red' : 'blue'"
            :footer="objectsSubtitles.orphanLinks">
            <f7-icon slot="media" f7="link" color="gray" />
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block v-if="semanticsProblemCount !== '0'" class="block-narrow">
      <f7-col>
        <f7-list media-list>
          <f7-list-item
            media-item
            link="semantics/"
            title="Semantics Problems"
            :badge="semanticsProblemCount > 0 ? semanticsProblemCount : undefined"
            :after="semanticsProblemCount > 0 ? undefined : semanticsProblemCount"
            :badge-color="semanticsProblemCount ? 'red' : 'blue'"
            :footer="objectsSubtitles.semanticsProblems">
            <f7-icon slot="media" f7="link" color="gray" />
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      objectsSubtitles: {
        orphanLinks: 'Items pointing to non-existent thing channels or vica versa',
        semanticsProblems: 'Issues with semantic model setup'
      },
      orphanLinksCount: '',
      semanticsProblemCount: '',

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
    loadCounters () {
      let self = this
      if (!this.apiEndpoints) return
      if (this.$store.getters.apiEndpoint('links')) {
        this.$oh.api.get('/rest/links/orphans').then((data) => {
          self.orphanLinksCount = data.length.toString()
        })
      }
      if (this.$store.getters.apiEndpoint('items')) {
        this.$oh.api.get('/rest/items/semantics/health').then((data) => {
          self.semanticsProblemCount = data.length.toString()
        })
      }
    },
    onPageAfterIn () {
      this.loadCounters()
    }
  }
}
</script>
