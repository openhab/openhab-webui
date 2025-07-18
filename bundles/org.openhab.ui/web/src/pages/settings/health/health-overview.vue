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

    <f7-block v-if="orphanLinksCount" class="block-narrow">
      <f7-col>
        <f7-list media-list>
          <f7-list-item
            media-item link="orphanlinks/" title="Orphan Links"
            :badge="orphanLinksCount > 0 ? orphanLinksCount : undefined"
            :after="orphanLinksCount > 0 ? undefined : orphanLinksCount"
            :badge-color="orphanLinksCount ? 'red' : 'blue'"
            :footer="objectsSubtitles.orphanLinks">
            <f7-icon slot="media" f7="link" color="gray" />
          </f7-list-item>
          <f7-list-item
            media-item link="semantics/" title="Semantic Model Conflicts"
            :badge="semanticsProblemCount > 0 ? semanticsProblemCount : undefined"
            :after="semanticsProblemCount > 0 ? undefined : semanticsProblemCount"
            :badge-color="semanticsProblemCount ? 'red' : 'blue'"
            :footer="objectsSubtitles.semanticsProblems">
            <f7-icon slot="media" f7="list_bullet_indent" color="gray" />
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block v-if="persistenceProblemsCount" class="block-narrow">
      <f7-col>
        <f7-list media-list>
          <f7-list-item
            media-item
            link="persistence/"
            title="Persistence Problems"
            :badge="persistenceProblemsCount > 0 ? persistenceProblemsCount : undefined"
            :after="persistenceProblemsCount > 0 ? undefined : persistenceProblemsCount"
            :badge-color="persistenceProblemsCount ? 'red' : 'blue'"
            :footer="objectsSubtitles.persistenceProblems">
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
        semanticsProblems: 'Issues with semantic model configuration',
        persistenceProblems: 'Persistence configurations missing items or strategies'
      },
      orphanLinksCount: 0,
      semanticsProblemCount: 0,
      persistenceProblemsCount: 0,

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
          this.orphanLinksCount = data.length || 0
        })
      }
      if (this.$store.getters.apiEndpoint('items')) {
        this.$oh.api.get('/rest/items/semantics/health').then((data) => {
          this.semanticsProblemCount = data.length || 0
        })
      }
      if (this.$store.getters.apiEndpoint('persistence')) {
        this.$oh.api.get('/rest/persistence/persistencehealth').then((data) => {
          self.persistenceProblemsCount = data.length || 0
        })
      }
    },
    onPageAfterIn () {
      this.loadCounters()
    }
  }
}
</script>
