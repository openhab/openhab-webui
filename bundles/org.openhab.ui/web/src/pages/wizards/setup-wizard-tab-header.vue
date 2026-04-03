<template>
  <f7-block class="sticky-header">
    <f7-login-screen-title>
      <div v-if="image" class="compact-padding">
        <img class="intro-logo" :src="image" type="image/svg+xml" />
      </div>
      <div v-else-if="icon" class="compact-padding">
        <f7-icon size="48" color="blue" :f7="icon" />
      </div>
      {{ title }}
    </f7-login-screen-title>
  </f7-block>
  <f7-block v-if="header || link" strong>
    <span class="text" v-html="header" />
    <br v-if="link" />
    <a v-if="link" class="text-color-blue external" target="_blank" :href="link"> {{ t('setupwizard.' + step + '.link') }}</a>
  </f7-block>
</template>

<style lang="stylus">
.setup-wizard
  .compact-padding
    padding-top 0.5rem
    padding-bottom 0.5rem
  .sticky-header
    position sticky
    top 0
    z-index 10
    background var(--f7-page-bg-color)
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n.ts'

const props = defineProps<{
  title: string
  step: string
  icon?: string
  image?: string
  link?: string
}>()

const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })
loadLocaleMessages('setup-wizard', mergeLocaleMessage)

const header = computed(() => {
  if (!props.step) return null

  const baseKey = `setupwizard.${props.step}`
  const keys = [`${baseKey}.header1`, `${baseKey}.header2`, `${baseKey}.header3`]

  const lines = keys.map((key) => t(key)).filter((line) => !line.startsWith(baseKey))

  if (lines.length === 0) return null

  return lines.join('<br>') + '<br />'
})
</script>
