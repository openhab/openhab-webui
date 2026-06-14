<template>
  <f7-page ref="pageRef" name="chat" class="chat-page">
    <f7-navbar>
      <oh-nav-content :title="t('title')" :f7router />
    </f7-navbar>

    <chat-core v-if="conversationId" ref="chatCoreRef" :conversation-id="conversationId" />
  </f7-page>
</template>

<style lang="stylus">
.chat-page
  .page-content
    display flex
    flex-direction column
    overflow hidden
</style>

<script setup lang="ts">
import { type Router } from 'framework7'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ChatCore from '@/components/chat/chat-core.vue'
import { loadLocaleMessages } from '@/js/i18n'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

// Props
defineProps<{
  f7router: Router.Router
}>()

const uiOptionsStore = useUIOptionsStore()
const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })
const conversationId = computed(() => uiOptionsStore.dialogIdentifier)
const chatCoreRef = ref<InstanceType<typeof ChatCore> | null>(null)
const pageRef = ref<any>(null)

// Initialize translations
onMounted(async () => {
  await loadLocaleMessages('chat', mergeLocaleMessage)
})
</script>
