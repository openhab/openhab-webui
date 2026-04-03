<template>
  <setup-wizard-tab-header :title="t('setupwizard.' + step + '.title')" :step="step" :icon="icon" />
  <f7-login-screen-title>
    <div class="padding">
      <img style="width: 85%" :src="image" />
    </div>
  </f7-login-screen-title>
  <f7-block>
    {{ body }}
    <br /><br />
    <a class="text-color-blue external" target="_blank" :href="link"> {{ t('setupwizard.documentationLink') }}</a>
    <br /><br />
    {{ t('setupwizard.' + step + '.nextDescription') }}
  </f7-block>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n.ts'
import SetupWizardTabHeader from '@/pages/wizards/setup-wizard-tab-header.vue'

const props = defineProps<{
  step: string
  icon?: string
  image?: string
  link?: string
}>()

const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })
loadLocaleMessages('setup-wizard', mergeLocaleMessage)

const body = computed(() => {
  if (!props.step) return null

  const lines: string[] = []
  let index = 1

  while (true) {
    const key = `setupwizard.${props.step}.body${index}`
    const translated = t(key)

    if (translated === key) break

    lines.push(translated)
    index++
  }

  return lines.length > 0 ? lines.join(' ') : null
})
</script>
