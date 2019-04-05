<template>
  <q-page padding class="row justify-center">
    <q-page-sticky position="top" v-if="showPWAPrompt" style="z-index: 2000">
      <q-alert icon="info" color="yellow" text-color="grey-9"
        :actions="[{ label: 'Learn how', handler: openEnhancedFeaturesTutorial }, { label: 'Dismiss', handler () { showPWAPrompt = false } }]">
        Using Chrome on Android? Use a secure origin like myopenhab.org and add HABot to the home screen for the best experience!
      </q-alert>
    </q-page-sticky>

    <div :style="{ 'width': '100%', 'margin-top': (showPWAPrompt) ? '150px' : '100px' }">
      <div class="chat-area" v-for="(chat, idx) in chats" :key="idx" ref="chat">
        <q-resize-observable @resize="onChatAreaResized"></q-resize-observable>
        <q-window-resize-observable @resize="scrollToBottom(false)"></q-window-resize-observable>

        <q-chat-message
          v-for="(msg, msgid) in chat.messages"
          :key="msgid"
          :label="msg.label"
          :sent="msg.sent"
          :text-color="msg.textColor"
          :bg-color="msg.bgColor"
          :name="msg.name"
          :avatar="msg.avatar"
          :text="msg.text"
          :stamp="msg.stamp"
        />
        <q-chat-message v-if="!chat.finished && busy && thinking" avatar="statics/icons/icon-192x192.png">
          <q-spinner-dots size="2rem" />
        </q-chat-message>

        <hb-card v-if="chat.card && chat.card.component === 'HbCard'" :model="chat.card" menu="chat" />

        <hb-create-rule-card v-else-if="chat.card && chat.card.component === 'HbCreateRuleCard'" :model="chat.card" />

        <q-card v-else-if="chat.card && chat.card.component === 'HbDumpIntentCard'">
          <q-card-title>
            Intent: {{chat.intent.name}}
            <span slot="subtitle">Sorry, this intent is currently unsupported :(</span>
          </q-card-title>
          <q-list>
              <q-list-header>Entities</q-list-header>
              <q-item link tag="label" v-for="(slot,value) in chat.intent.entities" :key="slot">
                <q-item-main :label="value" />
                <q-item-side right>
                  <big>{{slot}}</big>
                </q-item-side>
              </q-item>
          </q-list>

        </q-card>

        <div v-if="chat.greetingSuggestions" class="suggestion-chips">
          <q-btn rounded outline no-caps v-if="bookmarksCount" color="secondary" icon="bookmark" @click="$router.push('/cards/bookmarks')">Bookmarks</q-btn>
          <q-btn class="q-ml-sm" rounded outline no-caps v-if="suggestionsCount" color="secondary" icon="star" @click="$router.push('/cards/suggestions')">Suggestions
            <q-chip floating small dense color="red">{{suggestionsCount}}</q-chip>
          </q-btn>
        </div>
      </div>
    </div>

    <q-page-sticky position="bottom" class="chat-input-sticky">
      <q-toolbar class="chat-input-toolbar bg-grey-3 shadow-up-3">
        <q-input :disabled="busy" ref="input" v-model="text" class="full-width" :placeholder="inputPlaceholder" :autofocus="$q.platform.is.desktop" :after="inputAfter"
                  @keyup="keyUp" @focus="scrollToBottom(true)" @blur="stickToBottom = false" />
      </q-toolbar>
    </q-page-sticky>

    <speech-button v-if="!$q.platform.is.mobile || !busy" v-on:start="startSpeech"
                   v-on:end="endSpeech"
                   v-on:result="speechFinalResult"
                   v-on:interimresult="speechInterimResult"
                   v-on:error="resetSpeech"></speech-button>
  </q-page>
</template>

<style lang="stylus">
@import '~variables'

.chat-input-sticky > span
  width 100%
.chat-input-toolbar
  width 100%
  padding 15px

.chat-area
  padding-bottom 64px
  padding-left 10px
  padding-right 10px
  .q-spinner
    width 2rem
    margin 3px
  .q-message-avatar
    min-width 48px !important
  .q-message-sent .q-message-avatar
    display none
  .suggestion-chips
    text-align center
  @media (min-width $breakpoint-xs-min)
    position relative
    max-width 600px
    left 50%
    transform translateX(-50%)
    .hb-card
      width $card-min-width
  @media (max-width $breakpoint-xs-max)
    .hb-card
      width calc(100%)

.chat-input-toolbar
  input
    margin-right 34px
    z-index 2
  .q-icon
    position absolute
    right 0
    width auto
</style>

<script>
import { date } from 'quasar'
import HbCard from 'components/HbCard.vue'
import HbCreateRuleCard from 'components/rules/HbCreateRuleCard.vue'
import SpeechButton from 'components/speech/SpeechButton.vue'

export default {
  components: {
    HbCard,
    HbCreateRuleCard,
    SpeechButton
  },
  data () {
    return {
      busy: false,
      thinking: false,
      text: '',
      chats: [
        {
          messages: [],
          card: false,
          finished: false
        }
      ],
      inputAfter: [{
        icon: 'arrow_send',
        content: true,
        handler: this.send
      }],
      showPWAPrompt: false,
      inputPlaceholder: 'Ask me about your home',
      stickToBottom: false,
      // suggestionsCount: 0,
      bookmarksCount: 0
    }
  },
  created () {
    // this.$http.interceptors.request.use(function (config) {
    //   return config
    // })

    const vm = this

    // this.$q.events.$on('chat-send', this.chatReceived)

    if (this.$route.redirectedFrom && this.$route.redirectedFrom.indexOf('/notification#') === 0) {
      var notificationData = this.$route.redirectedFrom.replace('/notification#', '')
      let notification = decodeURIComponent(atob(notificationData))
      this.pushNotificationReceived({ data: notification })
      return
    }

    this.busy = true
    this.thinking = false
    setTimeout(() => { if (this.busy) this.thinking = true }, 500)
    this.$http.get('/rest/habot/greet').then((response) => {
      vm.$store.commit('setLang', response.data.language)
      if (!vm.language) {
        vm.language = response.data.language || 'en'
      }
      vm.busy = false
      vm.chats[0].messages.push({
        id: new Date(),
        name: '', // 'HABot',
        text: [response.data.answer],
        avatar: 'statics/icons/icon-192x192.png',
        stamp: date.formatDate(new Date(), 'HH:mm')
      })
      vm.chats[0].greetingSuggestions = true
    }).catch((error) => {
      vm.busy = false
      let errormessage = (error.response && error.response.data && error.response.data.error && error.response.data.error.message) ? error.response.data.error.message
        : (error.response && error.response.statusText) ? error.response.statusText : error.message
      vm.chats[0].messages.push({
        id: new Date(),
        name: '', // 'HABot',
        text: [errormessage],
        avatar: 'statics/icons/icon-192x192.png',
        bgColor: 'red',
        textColor: 'white',
        stamp: date.formatDate(new Date(), 'HH:mm')
      })
    })

    if (this.$q.platform.is.chrome && this.$q.platform.is.android &&
        window.matchMedia && !window.matchMedia('(display-mode: standalone)').matches) {
      this.showPWAPrompt = true
    }

    this.bookmarksCount = this.$store.getters['cards/bookmarked'].length
  },
  asyncComputed: {
    suggestionsCount () {
      return this.$store.dispatch('cards/computeSuggestions').then((cards) => {
        return cards.length
      })
    }
  },
  mounted () {
    // if (this.$q.platform.is.iphone) {
    //   (new MutationObserver(this.scrollToBottom)).observe(this.$el, {childList: true, subtree: true})
    //   console.log('enabled the MutationObserver (platform is iPhone)')
    // }
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', this.pushNotificationReceived)
    }
  },
  methods: {
    pushNotificationReceived (ev) {
      var currentChat = this.chats[this.chats.length - 1]
      if (currentChat.finished) {
        this.chats.push({
          messages: [],
          card: null,
          finished: false
        })
        currentChat = this.chats[this.chats.length - 1]
      }

      let notification = JSON.parse(ev.data)
      let notificationDate = (notification.timestamp) ? new Date(notification.timestamp) : new Date()

      let message = {
        id: notificationDate,
        name: 'Notification', // 'HABot',
        text: [notification.body],
        avatar: 'statics/icons/icon-192x192.png',
        stamp: date.formatDate(notificationDate, 'HH:mm')
      }

      // find a suitable card to display with the notification
      if (notification.data && notification.data.cardUID) {
        let card = this.$store.getters['cards/single'](notification.data.cardUID)
        currentChat.finished = true
        currentChat.card = card
      } else if (notification.data && notification.data.tags) {
        let matchingCards = this.$store.getters['cards/tagged'](notification.data.tags)

        // if more than one match, tough luck, just take the first one
        if (matchingCards.length > 0) {
          currentChat.finished = true
          currentChat.card = matchingCards[0]
        }
      }

      if (currentChat.greetingSuggestions) delete currentChat.greetingSuggestions
      currentChat.messages.push(message)
      if (currentChat.finished) {
        this.chats.push({
          messages: [],
          card: null,
          finished: false
        })
      }
    },

    send () {
      var currentChat = this.chats[this.chats.length - 1]
      if (currentChat.greetingSuggestions) delete currentChat.greetingSuggestions
      currentChat.messages.push({
        id: new Date(),
        name: '', // 'You',
        text: [this.text],
        avatar: 'statics/avatar.png',
        sent: true,
        stamp: date.formatDate(new Date(), 'HH:mm')
      })

      this.busy = true
      this.thinking = false
      setTimeout(() => { if (this.busy) this.thinking = true }, 500)
      setTimeout(() => { this.scrollToBottom(true) })

      this.$http.post('/rest/habot/chat', this.text, {
        headers: {
          'Content-Type': 'text/plain',
          'Accept-Language': this.language
        }
      }).then((response) => {
        if (response.data.answer) {
          currentChat.messages.push({
            id: new Date(),
            name: '', // 'HABot',
            text: (response.data.hint) ? [response.data.answer, response.data.hint] : [response.data.answer],
            avatar: 'statics/icons/icon-192x192.png',
            stamp: date.formatDate(new Date(), 'HH:mm')
          })
        }

        if (response.data.card) {
          currentChat.card = response.data.card
        }

        currentChat.finished = true
        this.chats.push({
          messages: [],
          card: null,
          finished: false
        })

        this.busy = false
        this.thinking = false
        if (this.$q.platform.is.mobile) {
          setTimeout(this.$refs.input.blur)
        } else {
          setTimeout(() => { this.stickToBottom = false }, 500)
        }

        currentChat.intent = response.data.intent
      }).catch((error) => {
        let errormessage = (error.response && error.response.data && error.response.data.error && error.response.data.error.message) ? error.response.data.error.message
          : (error.response && error.response.statusText) ? error.response.statusText : error.message

        currentChat.messages.push({
          id: new Date(),
          name: '', // 'HABot',
          text: [errormessage],
          avatar: 'statics/icons/icon-192x192.png',
          bgColor: 'negative',
          textColor: 'white',
          stamp: date.formatDate(new Date(), 'HH:mm'),
          finished: true
        })

        this.busy = false
        this.thinking = false
        if (this.$q.platform.is.mobile) {
          setTimeout(this.$refs.input.blur)
        } else {
          setTimeout(() => { this.stickToBottom = false })
        }
      })

      this.text = ''
      // if (this.$q.platform.is.mobile) {
      //   // force hide the virtual keyboard
      //   setTimeout(this.$refs.input.blur, 300)
      // }
    },

    keyUp (event) {
      if (event.keyCode === 13) {
        this.send()
        // if (this.$q.platform.is.mobile) {
        //   // force hide the virtual keyboard
        //   setTimeout(event.currentTarget.blur()
        // }
      }
    },

    onChatAreaResized (size) {
      this.scrollToBottom()
    },

    scrollToBottom (force) {
      if (force) {
        this.stickToBottom = true
      }
      if (!this.stickToBottom) return
      if (this.$q.platform.is.android) {
        var appEl = document.getElementById('q-app')
        appEl.scrollTop = appEl.scrollHeight
      } else {
        document.body.scrollTop = document.body.scrollHeight
        document.documentElement.scrollTop = document.documentElement.scrollHeight
      }
    },

    startSpeech () {
      this.inputPlaceholder = 'Speak now...'
    },
    endSpeech () {
      this.resetSpeech()
    },
    speechInterimResult (result) {
      if (result) {
        this.inputPlaceholder = result
      }
    },
    speechFinalResult (result) {
      this.text = result
      this.send()
      this.resetSpeech()
    },
    resetSpeech () {
      this.inputPlaceholder = 'Ask me about your home'
    },
    openEnhancedFeaturesTutorial () {
      this.$router.push({ path: '/help', query: { topic: 'enhanced-features' } })
    }
  },
  beforeDestroyed () {
    this.$q.events.$off('chat-send', this.chatReceived)
    if (navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', this.pushNotificationReceived)
    }
  }
}
</script>
