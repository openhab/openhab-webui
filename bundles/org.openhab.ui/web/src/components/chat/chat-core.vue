<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

import * as api from '@/api'
import { ApiError } from '@/js/hey-api.ts'
import sse from '@/js/openhab/sse'

import { showToast, showConfirmDialog } from '@/js/dialog-promises'
import { loadLocaleMessages } from '@/js/i18n'

// Props
const props = defineProps<{
  conversationId: string
}>()

// State
const loading = ref(false)
const busy = ref(false)
const messages = ref<api.Message[]>([])
const messageText = ref('')

// Refs
const messagesListRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Settings state
const settingsOpened = ref(false)
const hliList = ref<api.HumanLanguageInterpreter[]>([])
const selectedHli = ref('default')

const sseConnection = ref<any>(null)

const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })

// Lifecycle
onMounted(async () => {
  await loadLocaleMessages('chat', mergeLocaleMessage)
  await loadConversation()
  await loadHLIs()
  startSSE()
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
  sseConnection.value = sse.connect(
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
  if (sseConnection.value) {
    console.debug('Closing chat SSE connection')
    sse.close(sseConnection.value)
    sseConnection.value = null
  }
}

/**
 * Open the settings modal.
 */
function openSettings() {
  settingsOpened.value = true
  void loadHLIs()
}

/**
 * Load available Human Language Interpreters.
 */
async function loadHLIs() {
  try {
    const list = await api.getVoiceInterpreters()
    hliList.value = list ?? []
  } catch (err) {
    console.error('Failed to load human language interpreters:', err)
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

  // TODO: Retrieve available tools and make them selectable
  const toolsParam = ['get-date-time', 'item-get-state', 'item-send-command']

  try {
    // TODO: Check why/whether we need parseAs: text
    if (selectedHli.value === 'default') {
      // Send the message to the default voice interpreter
      await api.interpretTextByDefaultInterpreter(
        {
          body: text,
          conversation: props.conversationId,
          llmTools: toolsParam
        },
        { parseAs: 'text' }
      )
    } else {
      // Send the message to the selected voice interpreter
      await api.interpretText(
        {
          ids: [selectedHli.value],
          body: text,
          conversation: props.conversationId,
          llmTools: toolsParam
        },
        { parseAs: 'text' }
      )
    }

    // Tool calls/returns and openHAB response are received through the event bus
  } catch (err) {
    void showToast(t('errorMessage'))
    console.error('Failed to send text to interpreter:', err)
    // Reload on error to ensure the state is in sync with the server
    await loadConversation()
  } finally {
    busy.value = false
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
  // TODO
}

// Exposes
defineExpose({
  clearConversation,
  openSettings
})
</script>
