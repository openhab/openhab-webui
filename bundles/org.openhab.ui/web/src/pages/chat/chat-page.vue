<template>
  <f7-page ref="pageRef" name="chat" class="chat-page">
    <f7-navbar>
      <oh-nav-content :title="t('chat.title')" :f7router />
    </f7-navbar>

    <div v-if="checkingInterpreters" class="chat-loading-container">
      <f7-preloader color="blue" size="40" />
    </div>

    <div v-else-if="showSplash" class="chat-splash-container">
      <div class="chat-splash-content">
        <div class="chat-splash-icon">
          <f7-icon f7="chat_bubble_2_fill" size="64" color="blue" />
        </div>
        <h1 class="chat-splash-title">{{ t('chat.noLlmInterpreterTitle') }}</h1>
        <p class="chat-splash-text primary">{{ t('chat.noLlmInterpreterText') }}</p>
        <div class="chat-splash-divider"></div>
        <p class="chat-splash-text secondary">{{ t('chat.noLlmInterpreterHint') }}</p>
        <f7-button fill large round class="chat-splash-button" href="/addons/binding/binding-gemini">
          {{ t('chat.installGeminiBinding') }}
        </f7-button>
      </div>
    </div>

    <chat-core v-else-if="conversationId" ref="chatCoreRef" :conversation-id="conversationId" />
  </f7-page>
</template>

<style lang="stylus">
.chat-page
  .page-content
    display flex
    flex-direction column
    overflow hidden

  .chat-loading-container
    display flex
    justify-content center
    align-items center
    flex 1

  .chat-splash-container
    display flex
    justify-content center
    align-items center
    flex 1
    padding 24px
    text-align center
    box-sizing border-box

  .chat-splash-content
    max-width 450px
    display flex
    flex-direction column
    align-items center
    gap 16px

  .chat-splash-icon
    margin-bottom 8px

  .chat-splash-title
    font-size 24px
    font-weight 700
    margin 0
    color var(--f7-theme-color)

  .chat-splash-text
    font-size 15px
    line-height 1.5
    margin 0
    &.primary
      font-weight 500
      color var(--f7-text-color)
    &.secondary
      color var(--f7-text-color-placeholder, #858585)

  .chat-splash-divider
    width 80px
    height 1px
    background-color var(--f7-list-border-color, rgba(0,0,0,0.15))
    margin 8px 0

  .chat-splash-button
    margin-top 16px
    min-width 200px
</style>

<script setup lang="ts">
import { type Router } from 'framework7'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import * as api from '@/api'
import ChatCore from '@/components/chat/chat-core.vue'
import { loadLocaleMessages } from '@/js/i18n'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

const uiOptionsStore = useUIOptionsStore()
const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })

// Props
defineProps<{
  f7router: Router.Router
}>()

// State
const chatCoreRef = ref<InstanceType<typeof ChatCore> | null>(null)
const pageRef = ref<any>(null)
const checkingInterpreters = ref(true)
const showSplash = ref(false)

// Computed
const conversationId = computed(() => uiOptionsStore.dialogIdentifier)

// Lifecycle
onMounted(async () => {
  await loadLocaleMessages('chat', mergeLocaleMessage)
  try {
    const interpreters = await api.getVoiceInterpreters()
    if (interpreters && interpreters.length > 0) {
      showSplash.value = interpreters.every((interpreter) => interpreter.id === 'rulehli' || interpreter.id === 'system')
    } else {
      showSplash.value = true
    }
  } catch (err) {
    console.error('Failed to load voice interpreters:', err)
  } finally {
    checkingInterpreters.value = false
  }
})
</script>
