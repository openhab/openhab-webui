<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar>
      <oh-nav-content title="Health Checks"
                      back-link="Settings"
                      back-link-url="/settings"
                      :f7router />
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

    <f7-block class="block-narrow">
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
            <template #media>
              <f7-icon f7="link" color="gray" />
            </template>
          </f7-list-item>
          <f7-list-item
            media-item
            link="semantics/"
            title="Semantic Model Conflicts"
            :badge="semanticsProblemCount > 0 ? semanticsProblemCount : undefined"
            :after="semanticsProblemCount > 0 ? undefined : semanticsProblemCount"
            :badge-color="semanticsProblemCount ? 'red' : 'blue'"
            :footer="objectsSubtitles.semanticsProblems">
            <template #media>
              <f7-icon f7="list_bullet_indent" color="gray" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

export default {
  props: {
    f7router: Object
  },
  data () {
    return {
      objectsSubtitles: {
        orphanLinks: 'Items pointing to non-existent thing channels or vica versa',
        semanticsProblems: 'Issues with semantic model configuration'
      },
      orphanLinksCount: 0,
      semanticsProblemCount: 0,

      expandedTypes: {
        systemSettings: this.$f7dim.width >= 1450
      }
    }
  },
  computed: {
    apiEndpoints () {
      return useRuntimeStore().apiEndpoints
    }
  },
  watch: {
    apiEndpoints () {
      this.loadCounters()
    }
  },
  methods: {
    loadCounters () {
      if (!this.apiEndpoints) return
      if (useRuntimeStore().apiEndpoint('links')) {
        this.$oh.api.get('/rest/links/orphans').then((data) => {
          this.orphanLinksCount = data.length || 0
        })
      }
      if (useRuntimeStore().apiEndpoint('items')) {
        this.$oh.api.get('/rest/items/semantics/health').then((data) => {
          this.semanticsProblemCount = data.length || 0
        })
      }
    },
    onPageAfterIn () {
      this.loadCounters()
    }
  }
}
</script>
