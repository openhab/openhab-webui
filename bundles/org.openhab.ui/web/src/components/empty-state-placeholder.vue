<template>
  <f7-block class="empty-state-placeholder text-color-gray">
    <f7-row>
      <f7-col>
        <f7-icon :f7="icon" size="64" color="gray" />
        <h1>{{ t(title) || title }}</h1>
        <p v-html="t(text) || text" />
      </f7-col>
    </f7-row>
  </f7-block>
</template>

<style lang="stylus">
.empty-state-placeholder
  margin-top 10vh !important
  text-align center
</style>

<script>
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n'

export default {
  props: {
    icon: String,
    title: String,
    text: String
  },
  setup () {
    const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })
    loadLocaleMessages('empty-states', mergeLocaleMessage)
    return {
      t,
      mergeLocaleMessage
    }
  }
}
</script>
