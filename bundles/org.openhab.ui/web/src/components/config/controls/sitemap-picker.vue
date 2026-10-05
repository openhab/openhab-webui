<template>
  <ul class="sitemap-picker-container">
    <f7-list-item
      v-if="ready"
      ref="smartSelect"
      :title="title || 'Sitemap'"
      smart-select
      :smart-select-params="smartSelectParams"
      :no-chevron="disabled"
      :disabled="disabled">
      <select :name="name" :required="required" @change="select">
        <option value="" />
        <option v-for="sitemap in sitemaps" :key="sitemap.name" :value="sitemap.name" :selected="model === sitemap.name">
          {{ sitemap.label ? `${sitemap.label} (${sitemap.name})` : sitemap.name }}
        </option>
      </select>
    </f7-list-item>
    <!-- for placeholder purposes before sitemaps are loaded -->
    <f7-list-item v-show="!ready" link :title="title" />
  </ul>
</template>

<style lang="stylus">
.sitemap-picker-container
  .item-inner:after
    display none
</style>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { f7 } from 'framework7-vue'
import { useI18n } from 'vue-i18n'
import { showToast } from '@/js/dialog-promises'
import * as api from '@/api'

interface SitemapOption {
  name: string
  label?: string
}

const props = defineProps<{
  title?: string
  name?: string
  required?: boolean
  openOnReady?: boolean
  disabled?: boolean
}>()

const model = defineModel<string>()

const { t } = useI18n()

const ready = ref(false)
const sitemaps = ref<SitemapOption[]>([])
const smartSelect = ref<{ $el: HTMLElement } | null>(null)

const smartSelectParams = {
  view: f7.view.main,
  openIn: 'popup',
  searchbar: true,
  searchbarPlaceholder: t('dialogs.search.sitemaps'),
  closeOnSelect: true
}

function select(e: Event) {
  if (smartSelect.value) f7.input.validateInputs(smartSelect.value.$el)
  model.value = (e.target as HTMLSelectElement).value || ''
}

onMounted(async () => {
  try {
    const data = await api.getSitemaps()
    sitemaps.value = data
      .map((s): SitemapOption => ({ name: s.name, label: s.label }))
      .sort((a, b) => (a.label || a.name).localeCompare(b.label || b.name))
    ready.value = true
    if (props.openOnReady) {
      await nextTick()
      const el = smartSelect.value?.$el.children[0] as (Element & { f7SmartSelect?: { open: () => void } }) | undefined
      el?.f7SmartSelect?.open()
    }
  } catch (err) {
    console.error(err)
    showToast('An error occurred while loading sitemaps: ' + ((err as Error)?.message || String(err)))
  }
})
</script>
