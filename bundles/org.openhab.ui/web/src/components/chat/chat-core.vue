<template>
  <div class="chat-core-wrapper">
    <!-- Loading spinner for initial conversation load -->
    <div v-if="loading" class="chat-loading-container">
      <f7-preloader color="blue" size="40" />
    </div>

    <template v-else>
      <div class="chat-messages-container">
        <!-- Welcome Screen (when no messages exist) -->
        <chat-welcome
          v-if="messages.length === 0"
          :title="t('welcomeTitle')"
          :subtitle="t('welcomeSubtitle')"
          :suggestion-header="t('suggestionHeader')"
          :suggestions="suggestions"
          @select="sendSuggestion" />

        <!-- Messages Feed -->
        <f7-messages v-else ref="messagesList" class="chat-messages-list">
          <template v-for="(msg, idx) in messages" :key="msg.id || idx">
            <!-- User Message -->
            <f7-message
              v-if="msg.role === 'USER'"
              type="sent"
              color="blue"
              :first="isFirst(idx)"
              :last="isLast(idx)"
              :tail="isTail('USER', idx)">
              <template v-if="msg.content" #text>
                <span v-html="msg.content"></span>
              </template>
            </f7-message>

            <!-- openHAB Response -->
            <f7-message
              v-else-if="msg.role === 'OPENHAB'"
              type="received"
              :first="isFirst(idx)"
              :last="isLast(idx)"
              :tail="isTail('OPENHAB', idx)">
              <template v-if="msg.content" #text>
                <span v-html="msg.content"></span>
              </template>
            </f7-message>

            <!-- Tool Call -->
            <chat-tool-call v-else-if="msg.role === 'TOOL_CALL'" :content="msg.content" />

            <!-- Tool Return -->
            <chat-tool-return v-else-if="msg.role === 'TOOL_RETURN'" :content="msg.content" />
          </template>

          <!-- Typing/Thinking Indicator -->
          <f7-message v-if="busy" type="received" :typing="true" :first="true" :last="true" :tail="true" />
        </f7-messages>
      </div>

      <f7-messagebar
        ref="messagebar"
        class="chat-messagebar"
        v-model:value="messageText"
        :placeholder="t('inputPlaceholder')"
        :resize-page="false">
        <template #inner-end>
          <f7-link
            id="chat-settings-button"
            icon-size="22"
            icon-color="gray"
            icon-ios="f7:gear_alt_fill"
            icon-aurora="f7:gear_alt_fill"
            icon-md="material:settings"
            popover-open="#chat-settings-popover">
            <!-- Settings Popover -->
            <f7-popover id="chat-settings-popover" class="chat-settings-popover">
              <f7-list dividers>
                <f7-list-item :title="t('settingsTitle')" />
                <f7-list-item group-title :title="t('llmTools')" />
                <f7-list-item
                  v-for="tool in llmTools"
                  :key="tool.id"
                  checkbox
                  :title="tool.label || tool.id"
                  :subtitle="tool.description"
                  :checked="selectedLlmTools.includes(tool.id)"
                  @change="toggleTool(tool.id)" />
              </f7-list>
            </f7-popover>
          </f7-link>
          <f7-link
            id="chat-send-button"
            :class="{ disabled: !messageText.trim() || busy }"
            icon-size="22"
            icon-ios="f7:arrow_up_circle_fill"
            icon-aurora="f7:arrow_up_circle_fill"
            icon-md="material:send"
            @click="sendMessage" />
        </template>
      </f7-messagebar>
    </template>
  </div>
</template>

<style lang="stylus" scoped>
.chat-core-wrapper
  display flex
  flex-direction column
  flex 1
  min-height 0

  .chat-messagebar
    position relative
    bottom 0
    textarea
      overflow-y hidden
    .link
      height var(--f7-messagebar-height)
      padding 8px 0
      display flex
      flex-direction column
      justify-content flex-end
      flex 1
      &:not(:last-child)
        margin-right 6px

  .chat-messages-container
    display flex
    flex-direction column
    flex 1
    min-height 0

  .chat-messages-list
    flex 1
    overflow-y auto

/* Loading indicator style**/
.chat-loading-container
  display flex
  flex-direction column
  justify-content center
  align-items center
  flex 1

/* Welcome Screen */
.welcome-container
  display flex
  flex-direction column
  align-items center
  justify-content center
  padding 24px
  max-width 600px
  margin 0 auto
  box-sizing border-box
  flex 1

/* Chat Messages */
.chat-messages
  .chat-message
    margin-left 16px

/* System Tool Messages */
.system-message
  display flex
  align-items flex-start
  gap 10px
  margin 0 16px
  padding 10px 14px
  border-radius 8px
  font-size 13px
  font-family monospace
  border 1px solid var(--f7-list-border-color)
  background-color var(--f7-block-strong-bg-color, rgba(0,0,0,0.02))
  box-shadow 0 1px 3px rgba(0,0,0,0.02)

  &.tool-call
    margin-top var(--f7-message-margin)
    border-left 3px solid var(--f7-theme-color)
    color var(--f7-text-color)
    .icon
      color var(--f7-theme-color)

  &.tool-return
    margin-top calc(0.5 * var(--f7-message-margin))
    border-left 3px solid var(--f7-color-green, #4cd964)
    color var(--f7-text-color)
    .icon
      color var(--f7-color-green, #4cd964)

  .system-details
    display flex
    flex-direction column
    gap 2px

  .system-label
    font-weight 700
    text-transform uppercase
    font-size 10px
    letter-spacing 0.5px
    opacity 0.65

  .system-content
    word-break break-all
    opacity 0.9
    line-height 1.4
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { f7 } from 'framework7-vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import * as api from '@/api'
import { ApiError } from '@/js/hey-api.ts'
import sse, { type KeepaliveEventSource } from '@/js/openhab/sse'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore.ts'

import { showToast, showConfirmDialog } from '@/js/dialog-promises'
import { loadLocaleMessages } from '@/js/i18n'

import ChatToolCall from '@/components/chat/chat-tool-call.vue'
import ChatToolReturn from '@/components/chat/chat-tool-return.vue'
import ChatWelcome from '@/components/chat/chat-welcome.vue'

const uiOptionsStore = useUIOptionsStore()

// Props
const props = defineProps<{
  conversationId: string
}>()

// Composables
const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })

// State
const loading = ref(false)
const busy = ref(false)
const messages = ref<api.Message[]>([])
const messageText = ref('')
const settingsOpened = ref(false)
const llmTools = ref<api.LlmTool[]>([])
const { selectedLlmTools } = storeToRefs(uiOptionsStore)

let sseConnection: KeepaliveEventSource | null = null

// Computed
const suggestions = computed(() => [
  { text: t('suggestion1'), icon: 'lightbulb_fill', color: 'orange' },
  { text: t('suggestion2'), icon: 'thermometer', color: 'blue' },
  { text: t('suggestion3'), icon: 'lightbulb_slash_fill', color: 'red' },
  { text: t('suggestion4'), icon: 'sun_max_fill', color: 'yellow' }
])

// Refs
const messagesListRef = useTemplateRef<any>('messagesList')
const textareaRef = useTemplateRef<any>('messagebar')

// Lifecycle
onMounted(async () => {
  await loadLocaleMessages('chat', mergeLocaleMessage)
  await Promise.all([loadConversation(), loadLlmTools()])
  startSSE()

  if (f7.device.desktop) {
    await nextTick()
    if (textareaRef.value) {
      if (typeof (textareaRef.value as any).focus === 'function') {
        ;(textareaRef.value as any).focus()
      } else if (textareaRef.value.$el?.querySelector) {
        const textarea = textareaRef.value.$el.querySelector('textarea')
        textarea?.focus()
      }
    }
  }
})

onKeyStroke(
  'Enter',
  (event) => {
    if (!event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  },
  { target: textareaRef }
)

onBeforeUnmount(() => {
  stopSSE()
})

// Watch conversationId changes
watch(
  () => props.conversationId,
  () => {
    void loadConversation()
    startSSE()
  }
)

function handleSSEMessage(payload: { messageId: number; role: string; text: string }) {
  const { messageId, role, text } = payload
  const validRoles: api.Message['role'][] = ['USER', 'OPENHAB', 'THINKING', 'TOOL_CALL', 'TOOL_RETURN']
  if (!validRoles.includes(role as any)) {
    console.warn('Received message with unknown role:', role)
    return
  }

  const typedRole = role as api.Message['role']

  // Update existing message if the id already exists
  const existingIndex = messages.value.findIndex((m) => m.id === messageId)
  if (existingIndex !== -1) {
    // Update existing message
    messages.value[existingIndex].content = text
    messages.value[existingIndex].role = typedRole
    nextTick(() => scrollToBottom())
    return
  }

  // Otherwise, append the new message
  messages.value.push({
    id: messageId,
    role: typedRole,
    content: text
  })

  // Set busy to false as we've received a HLI response
  if (typedRole === 'OPENHAB') {
    busy.value = false
  }

  nextTick(() => scrollToBottom())
}

function startSSE() {
  stopSSE()
  if (!props.conversationId) return

  const topic = `openhab/conversations/${props.conversationId}/messageadded`
  const path = `/rest/events?topics=${topic}`

  console.debug(`Connecting to SSE topic: ${topic}`)
  sseConnection = sse.connect(
    path,
    [],
    (event: any) => {
      try {
        console.debug('Received chat SSE event:', event)
        if (event && event.payload) {
          const payload = JSON.parse(event.payload)
          if (payload && typeof payload.messageId === 'number') {
            handleSSEMessage({
              messageId: payload.messageId,
              role: payload.role,
              text: payload.text
            })
          }
        }
      } catch (err) {
        console.error('Error handling chat SSE event:', err)
      }
    },
    () => {
      console.warn('SSE connection error for chat')
    }
  )
}

function stopSSE() {
  if (sseConnection) {
    console.debug('Closing chat SSE connection')
    sse.close(sseConnection)
    sseConnection = null
  }
}

/**
 * Open the settings modal.
 */
function openSettings() {
  settingsOpened.value = true
}

/**
 * Load available LLM tools.
 */
async function loadLlmTools() {
  try {
    const list = await api.getLlmTools()
    llmTools.value = list ?? []

    if (selectedLlmTools.value === null) {
      selectedLlmTools.value = list?.map((t) => t.id) ?? []
    }
  } catch (err) {
    console.error('Failed to load LLM tools:', err)
  }
}

/**
 * Load the conversation (message history) as specified by the `conversationId` prop.
 */
async function loadConversation() {
  if (!props.conversationId) return
  loading.value = true
  try {
    const res = await api.getConversationById({ id: props.conversationId })
    if (res && res.messages) {
      messages.value = res.messages
    } else {
      messages.value = []
    }
  } catch (err: any) {
    // A 404 error is expected if no messages have been sent to this conversation yet
    if (err instanceof ApiError && err.response.status === 404) {
      messages.value = []
    } else {
      void showToast(t('loadError'))
      console.error('Failed to load conversation:', err)
    }
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function toggleTool(id: string) {
  if (selectedLlmTools.value === null) selectedLlmTools.value = []
  const idx = selectedLlmTools.value.indexOf(id)
  if (idx >= 0) {
    selectedLlmTools.value.splice(idx, 1)
  } else {
    selectedLlmTools.value.push(id)
  }
}

/**
 * Sends a message to the server for human language interpretation.
 */
async function sendMessage() {
  const text = messageText.value.trim()
  if (!text || busy.value) return

  // Clear input field
  messageText.value = ''

  // Don't add the message to the messages state, we'll immediately receive it through the event bus

  await nextTick()
  scrollToBottom()
  busy.value = true

  // Use selected LLM tools (default all selected)
  const toolsParam = selectedLlmTools.value ?? []

  try {
    await api.interpretTextByDefaultInterpreter(
      {
        body: text,
        conversation: props.conversationId,
        llmTools: toolsParam
      },
      { parseAs: 'text' }
    )
  } catch (err) {
    void showToast(t('errorMessage'))
    console.error('Failed to send text to interpreter:', err)
    await loadConversation()
  } finally {
    await nextTick()
    scrollToBottom()
  }
}

/**
 * Clears the conversation.
 */
async function clearConversation() {
  const confirmed = await showConfirmDialog(t('clearConfirm'), t('clearChat'))
  if (!confirmed) return

  try {
    await api.deleteConversationById({ id: props.conversationId })
    messages.value = []
    settingsOpened.value = false
    void showToast(t('clearSuccess'))
  } catch (err) {
    void showToast(t('deleteError'))
    console.error('Failed to clear conversation:', err)
  }
}

/**
 * Sends a message suggestion to the server.
 * @param text
 */
function sendSuggestion(text: string) {
  messageText.value = text
  void sendMessage()
}

/**
 * Scroll the chat messages list to its bottom.
 */
function scrollToBottom() {
  const el = messagesListRef.value?.$el || messagesListRef.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

// Contiguous grouping helpers
type RoleGroup = 'OPENHAB' | 'USER'

function getRoleGroup(role: api.Message['role']): RoleGroup {
  if (role === 'OPENHAB' || role === 'TOOL_CALL' || role === 'TOOL_RETURN') {
    return 'OPENHAB'
  }
  return 'USER'
}

function isFirst(idx: number): boolean {
  if (idx === 0) return true
  const roleGroup = getRoleGroup(messages.value[idx].role)
  const prevRoleGroup = getRoleGroup(messages.value[idx - 1].role)
  return roleGroup !== prevRoleGroup
}

function isLast(idx: number): boolean {
  if (idx === messages.value.length - 1) return true
  const roleGroup = getRoleGroup(messages.value[idx].role)
  const nextRoleGroup = getRoleGroup(messages.value[idx + 1].role)
  return roleGroup !== nextRoleGroup
}

function isTail(roleGroup: RoleGroup, idx: number) {
  if (idx === messages.value.length - 1) return true
  const msgIdOfRoleGroups = messages.value.filter((m) => m.role === roleGroup).map((m) => m.id)
  return idx === msgIdOfRoleGroups[msgIdOfRoleGroups.length - 1]
}

// Exposes
defineExpose({
  clearConversation,
  openSettings
})
</script>
