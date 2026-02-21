<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar>
      <oh-nav-content title="Persistence Configuration Issues" back-link="Health Checks" back-link-url="/settings/health/" :f7router />
    </f7-navbar>

    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-footer class="padding-horizontal">
          Persistence services need to be configured with items to persist and strategies for persisting these.
          <br />
          <br />
          Note that only the configuration of managed persistence service configurations can be changed through the UI, not configurations
          in <code>.persist</code> files - these must be fixed manually in the corresponding file. The latter are marked with
          <f7-icon f7="lock_fill" size="1rem" color="gray" />.
        </f7-block-footer>
      </f7-col>
    </f7-block>

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 10"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Type of problem"
              subtitle="Persistence service"
              footer="" />
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-else>
        <f7-block-title>
          {{ persistenceProblems.length }} persistence configuration problem{{ plural(persistenceProblems.length) }} found
        </f7-block-title>
        <f7-list class="col" contacts-list>
          <f7-list-item
            v-for="persistenceProblem in persistenceProblems"
            :key="problemKey(persistenceProblem)"
            media-item
            :link="getLinkForProblem(persistenceProblem)"
            :title="'Problem: ' + explanation(persistenceProblem.reason)"
            :subtitle="persistenceProblem.serviceId ? 'Persistence Service: ' + persistenceProblem.serviceId : ''"
            :footer="persistenceProblem.items ? 'Items: ' + persistenceProblem.items.join(', ') : ''">
            <template #after-title>
              <f7-icon v-if="!persistenceProblem.editable" f7="lock_fill" size="1rem" color="gray" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script setup lang="ts">
import type { Router } from 'framework7'
import * as api from '@/api'
import { ref } from 'vue'

defineProps<{
  f7router: Router.Router
}>()

const ready = ref(false)
const loading = ref(false)
const persistenceProblems = ref<api.PersistenceServiceProblem[]>([])

const persistenceProblemExplanation: Record<string, string> = {
  PERSISTENCE_NO_DEFAULT: 'No default persistence service defined',
  PERSISTENCE_SERVICE_NO_CONFIG: 'No configuration for persistence service',
  PERSISTENCE_SERVICE_NO_ITEMS: 'No persistence items defined for persistence service',
  PERSISTENCE_SERVICE_ITEMS_NO_STRATEGY: 'No persistence strategy set for persistence items',
  PERSISTENCE_SERVICE_ITEMS_NO_STORE_STRATEGY: 'Persistence strategy for persistence items only has a restore strategy'
}

const onPageAfterIn = () => {
  load()
}

const load = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const data = await api.getPersistenceHealth()
    persistenceProblems.value = data!
    ready.value = true
  } finally {
    loading.value = false
  }
}

const problemKey = (persistenceProblem: api.PersistenceServiceProblem): string => {
  let key = persistenceProblem.reason
  if (persistenceProblem.serviceId) key = `${key}_${persistenceProblem.serviceId}`
  if (persistenceProblem.items) key = `${key}_${persistenceProblem.items.join('_')}`
  return key
}

const getLinkForProblem = (persistenceProblem: api.PersistenceServiceProblem): string => {
  if (persistenceProblem.serviceId) {
    return `/settings/persistence/${persistenceProblem.serviceId}`
  }
  return '/settings/persistence/'
}

const explanation = (reason: string): string => {
  return persistenceProblemExplanation[reason] || reason
}

const plural = (count: number): string => {
  return count === 1 ? '' : 's'
}
</script>
