<template>
  <f7-page
    ref="pagePersistenceSettings"
    class="persistence-settings-page"
    @keydown.stop.prevent.exact.ctrl.s="save()"
    @keydown.stop.prevent.exact.meta.s="save()">
    <f7-navbar>
      <oh-nav-content
        :title="'Persistence Settings' + dirtyIndicator"
        back-link="Settings"
        back-link-url="/settings/"
        :save-link="persistenceList.length > 0 ? `Save${$device.desktop ? ' (Ctrl-S)' : ''}` : ''"
        @save="save()"
        :f7router />
    </f7-navbar>

    <f7-block v-if="ready && persistenceList.length" form class="block-narrow">
      <f7-col>
        <f7-block-title medium> General Settings </f7-block-title>
        <config-sheet
          :parameter-groups="configDescriptions?.parameterGroups"
          :parameters="configDescriptions?.parameters"
          :configuration="config"
          :set-empty-config-as-null="true" />
      </f7-col>
    </f7-block>
    <f7-block v-if="ready && persistenceList.length" class="block-narrow">
      <f7-col>
        <f7-block-title medium> Configure Persistence Policies </f7-block-title>
        <f7-list>
          <f7-list-item
            v-for="persistence in persistenceList"
            media-item
            :key="persistence.id"
            :link="persistence.id"
            :title="persistence.label"
            :footer="persistence.id" />
          <f7-list-item link="/addons/persistence/" no-chevron media-item subtitle="Install more persistence add-ons">
            <template #media>
              <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !persistenceList.length" class="block-narrow">
      <empty-state-placeholder icon="download_circle" title="persistence.title" text="persistence.text" />
      <f7-row class="display-flex justify-content-center">
        <f7-button
          large
          fill
          color="blue"
          external
          :href="`${websiteUrl}/link/persistence`"
          target="_blank"
          :text="$t('home.overview.button.documentation')" />
        <span style="width: 8px" />
        <f7-button large fill color="blue" href="/addons/persistence/"> Install a persistence add-on </f7-button>
      </f7-row>
    </f7-block>
  </f7-page>
</template>

<style lang="stylus">
.persistence-settings-page
  .config-sheet
    .config-parameter
      margin-top 0px
      margin-bottom 0px
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Router } from 'framework7'

import { useDirty } from '@/pages/settings/useDirty'

import ConfigSheet from '@/components/config/config-sheet.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import * as api from '@/api'
import { showToast } from '@/js/dialog-promises'

// Page element ref for dirty tracking
const pagePersistenceSettings = ref<HTMLElement | null>(null)

const { dirty, dirtyIndicator, setupDirtyWatch } = useDirty(pagePersistenceSettings)
const { websiteUrl } = useRuntimeStore()

const serviceId = 'org.openhab.persistence'

// Props
defineProps<{
  f7router: Router.Router
}>()
// Local state
const loading = ref<boolean>(false)
const ready = ref<boolean>(false)
const persistenceList = ref<api.PersistenceService[]>([])
const configDescriptions = ref<api.ConfigDescription | null>(null)
const config = ref<Record<string, unknown> | null>(null)

// Watches
setupDirtyWatch(config)

// Lifecycle
onMounted(() => {
  void load()
})

// Methods
async function load() {
  if (loading.value) return
  loading.value = true

  try {
    const [persistenceServicesSettled, serviceConfigSettled, serviceSettled] = await Promise.allSettled([
      api.getPersistenceServices(),
      api.getServiceConfig({ serviceId }),
      api.getServicesById({ serviceId })
    ])

    persistenceList.value = persistenceServicesSettled.status === 'fulfilled' ? (persistenceServicesSettled.value ?? []) : []
    config.value = serviceConfigSettled.status === 'fulfilled' ? (serviceConfigSettled.value ?? null) : null
    const service = serviceSettled.status === 'fulfilled' ? serviceSettled.value : null

    if (service?.configDescriptionURI) {
      configDescriptions.value = (await api.getConfigDescriptionByUri({ uri: service.configDescriptionURI })) || null
    }
  } catch (error) {
    showToast('Failed to load persistence settings')
    console.error('Failed to load persistence settings:', error)
  } finally {
    loading.value = false
    ready.value = true
  }
}

async function save() {
  if (!config.value) return

  try {
    await api.updateServiceConfig({ serviceId, body: config.value })
    dirty.value = false
    showToast('Default persistence setting saved')
  } catch (error) {
    showToast('Failed to save default persistence setting')
    console.error('Failed to save default persistence setting: ', error)
  }
}
</script>
