<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar>
      <oh-nav-content title="Health Checks" back-link="Settings" back-link-url="/settings/" :f7router />
    </f7-navbar>

    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-footer class="padding-horizontal">
          This page provides information about potential issues with your openHAB setup.
          <br />
          It is recommended to fix these issues to ensure a stable and reliable system.
        </f7-block-footer>
      </f7-col>
    </f7-block>

    <f7-block v-if="orphanLinksCount || semanticsProblemCount" class="block-narrow">
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
            <template #media>
              <f7-icon f7="link" color="gray" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Router } from 'framework7'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import * as api from '@/api'

defineProps<{
  f7router: Router.Router
}>()

const runtimeStore = useRuntimeStore()
const apiEndpoints = computed(() => runtimeStore.apiEndpoints)

const objectsSubtitles = {
  orphanLinks: 'Items pointing to non-existent thing channels or vica versa',
  semanticsProblems: 'Issues with semantic model configuration',
  persistenceProblems: 'Persistence configurations missing items or strategies'
}

const orphanLinksCount = ref(0)
const semanticsProblemCount = ref(0)
const persistenceProblemsCount = ref(0)

const loadCounters = async () => {
  if (!apiEndpoints.value) return

  if (runtimeStore.apiEndpoint('links')) {
    const data = await api.getOrphanLinks()
    orphanLinksCount.value = data?.length ?? 0
  }

  if (runtimeStore.apiEndpoint('items')) {
    const data = await api.getSemanticsHealth()
    semanticsProblemCount.value = data?.length ?? 0
  }

  if (runtimeStore.apiEndpoint('persistence')) {
    const data = await api.getPersistenceHealth()
    persistenceProblemsCount.value = data?.length ?? 0
  }
}

watch(apiEndpoints, () => {
  loadCounters()
}, { immediate: true })

const onPageAfterIn = () => {
  loadCounters()
}
</script>
