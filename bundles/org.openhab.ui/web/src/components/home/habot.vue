<template>
  <div class="habot-wrapper col">
    <div style="display: block">
      <f7-input type="text"
                :placeholder="greeting"
                class="habot-chatbar searchbar"
                :class="{ highlight: focused || value }"
                clear-button
                @focus="chatboxFocused"
                :value="value"
                @change="chatboxSend"
                @blur="chatboxBlur" />
      <speech-button class="habot-icon"
                     v-show="!focused"
                     :lang="language"
                     @result="speechResult" />
    </div>
    <f7-list v-if="focused && !value" class="chat-suggestions" no-hairlines-md>
      <f7-list-item v-for="suggestion in suggestions"
                    :key="suggestion"
                    @click="chooseSuggestion(suggestion)"
                    link
                    :title="suggestion"
                    :footer="history.length === 0 ? t('habot.example.label') : ''"
                    no-chevron />
      <f7-list-button v-if="history.length > 0"
                      color="red"
                      :title="t('habot.clearHistory')"
                      @click="clearHistory" />
    </f7-list>
    <f7-message v-if="interimSpeechResult"
                type="sent"
                class="habot-query margin-bottom"
                :text="interimSpeechResult"
                color="gray"
                first
                tail />
    <f7-message v-if="query && !focused && !interimSpeechResult"
                type="sent"
                class="habot-query margin-bottom"
                :text="query"
                color="blue"
                first
                tail />
    <f7-message v-if="!interimSpeechResult && (answer || busy) && !focused"
                type="received"
                :typing="busy"
                :text="(!busy) ? answer : null"
                last
                :tail="!hint" />
    <f7-message v-if="hint && !focused && !interimSpeechResult"
                type="received"
                :text="hint"
                last
                tail />
    <generic-widget-component v-if="cardContext && !focused && !interimSpeechResult" :context="cardContext" />
    <div v-if="query && !focused && answer && !busy && !interimSpeechResult"
         class="display-flex justify-content-space-between padding">
      <span />
      <f7-button outline
                 round
                 color="blue"
                 @click="endSession">
        {{ t('habot.dismiss') }}
      </f7-button>
    </div>
  </div>
</template>

<style lang="stylus">
.habot-wrapper
  --f7-searchbar-bg-color: transparent
  padding-left var(--f7-block-padding-horizontal)
  padding-right var(--f7-block-padding-horizontal)
  width calc(100% - 2*var(--f7-block-padding-horizontal))
  .searchbar
    width 100%
    &:after
      display none
    input
      height 48px
      border 1px solid var(--f7-list-border-color)
    &.input-focused:after
      display none
  .message
    max-width initial

.habot-chatbar
  transform none !important
  top 0 !important

.aurora
  .habot-query
    margin-top 2rem

.ios
  .habot-chatbar input
    border-radius 22px !important
  .habot-query
    margin-top 2rem

.md
  .habot-chatbar
    --f7-searchbar-input-font-size 16px
    --f7-searchbar-input-extra-padding-left -16px
    border-radius 22px
    box-shadow none !important
    margin-left -2px !important
    input
      // background #f1f3f4
      transition background-color 300ms
      border-radius 22px !important
    &.highlight input
      // background-color #ffffff !important
      transition background-color 300ms
      box-shadow var(--f7-searchbar-in-page-content-box-shadow)
    &.searchbar:after
      display none
  .chat-suggestions
    margin-top -0.5rem
</style>

<script>
import itemDefaultStandaloneComponent from '@/components/widgets/standard/default-standalone-item'
import itemDefaultListComponent from '@/components/widgets/standard/list/default-list-item'
import SpeechButton from './speech-button.vue'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n'

import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
  props: {
    f7router: Object
  },
  components: {
    SpeechButton
  },
  emits: ['session-started', 'session-end'],
  setup () {
    const { t, setLocaleMessage } = useI18n({ useScope: 'local' })

    loadLocaleMessages('habot', setLocaleMessage)

    return {
      t
    }
  },
  data () {
    return {
      greeting: null,
      value: '',
      query: '',
      answer: '',
      hint: '',
      card: null,
      language: 'en',
      interimSpeechResult: null,
      history: [],
      busy: false,
      focused: false
    }
  },
  mounted () {
    this.greet()
    const savedHistory = localStorage.getItem('openhab.ui:chat.history')
    this.history = (savedHistory) ? savedHistory.split('|') : []
  },
  computed: {
    cardContext () {
      if (!this.card) return null
      return {
        store: useStatesStore().trackedItems,
        component: this.card
      }
    },
    suggestions () {
      return (this.history.length > 0) ? this.history : [this.t('habot.example1'), this.t('habot.example2'), this.t('habot.example3')]
    }
  },
  methods: {
    greet () {
      this.$oh.api.get('/rest/habot/greet').then((resp) => {
        this.greeting = resp.answer
        this.language = resp.language
      })
    },
    chatboxFocused () {
      this.focused = true
      this.$emit('session-started')
    },
    chatboxBlur (ev) {
      // delay in order to give a chance to choose a suggestion...
      setTimeout(() => {
        this.focused = false
        if (!this.query && !this.busy) this.$emit('session-end')
      }, 200)
    },
    endSession () {
      this.query = ''
      this.answer = ''
      this.hint = ''
      this.card = null
      this.greet()
      this.$emit('session-end')
    },
    chatboxSend (ev) {
      this.query = this.value = ev.target.value
      ev.target.blur()
      this.sendQuery()
    },
    chooseSuggestion (suggestion) {
      this.query = this.value = suggestion
      this.sendQuery()
    },
    clearHistory () {
      this.focused = false
      localStorage.setItem('openhab.ui:chat.history', '')
      this.history = []
      this.endSession()
    },
    speechResult (result) {
      if (result.final) {
        this.query = result.text
        this.sendQuery(true)
      } else {
        if (!this.interimSpeechResult) this.$emit('session-started')
        this.interimSpeechResult = result.text
      }
    },
    sendQuery (fromSpeech) {
      this.answer = ''
      this.hint = ''
      this.interimSpeechResult = null
      this.card = null
      this.focused = false
      if (!this.query) {
        return
      }
      this.busy = true

      // store in history
      if (this.history.indexOf(this.query) < 0) {
        this.history.unshift(this.query)
        this.history = this.history.splice(0, 5)
        localStorage.setItem('openhab.ui:chat.history', this.history.join('|'))
      }

      this.$oh.api.postPlain('/rest/habot/chat?useCardRegistry=false', this.query, 'application/json', 'text/plain').then((resp) => {
        const reply = JSON.parse(resp)
        this.answer = reply.answer
        this.hint = reply.hint
        this.value = ''
        if (reply.card) {
          this.convertHABotCard(reply.card)
        } else {
          this.busy = false
        }
        this.greeting = this.t('habot.anythingElse')
      })
    },
    convertHABotCard (habotCard) {
      if (!habotCard.ephemeral) {
        this.busy = false
        this.card = {
          component: 'f7-card',
          config: {
            title: habotCard.title,
            footer: this.t('habot.cardDeckIsIncompatible')
          }
        }
        return
      }
      if (habotCard.component !== 'HbCard') {
        this.busy = false
        this.card = {
          component: 'f7-card',
          config: {
            title: habotCard.title,
            footer: this.t('habot.cardIsIncompatible')
          }
        }
        return
      }
      if (habotCard.slots.media && habotCard.slots.media[0].component === 'HbChartImage') {
        // there's a chart to display - image widgets are not implemented yet so simply open the analyzer
        const items = habotCard.slots.media[0].config.items.join(',')
        const period = habotCard.slots.media[0].config.period
        this.f7router.navigate(`/analyzer/?items=${items}&period=${period}`)
        this.card = {
          component: 'f7-card',
          config: {
            title: habotCard.title,
            footer: habotCard.subtitle
          },
          slots: {
            default: [
              {
                component: 'f7-card-content',
                config: {
                  class: ['display-flex', 'justify-content-center']
                },
                slots: {
                  default: [
                    {
                      component: 'f7-button',
                      config: {
                        text: 'Open Analyzer',
                        large: true,
                        raised: true,
                        fill: true,
                        iconF7: 'graph_circle',
                        link: true,
                        href: `/analyzer/?items=${items}&period=${period}`
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
        this.busy = false
      } else if (!habotCard.slots.list) {
        // a single item was returned
        let item = null
        if (habotCard.slots.right && habotCard.slots.right.length > 0) {
          item = habotCard.slots.right[0].config.item
        } else if (habotCard.slots.main && habotCard.slots.main.length > 0) {
          item = habotCard.slots.main[0].config.item
        }

        if (item) {
          return this.$oh.api.get(`/rest/items/${item}?metadata=semantics,widget`).then((item) => {
            this.card = Object.assign({}, itemDefaultStandaloneComponent(item))
            if (!this.card.config.title) this.card.config.title = habotCard.title
            if (!this.card.config.footer) this.card.config.footer = habotCard.subtitle
            this.busy = false
          })
        }
      } else {
        // there's a list to display
        let items = habotCard.slots.list[0].slots.items.map((c) => c.config.item).filter((i) => i)
        return Promise.all(items.map((i) => this.$oh.api.get(`/rest/items/${i}?metadata=semantics,widget`))).then((items) => {
          this.card = {
            component: 'oh-list-card',
            config: {
              title: habotCard.title,
              footer: habotCard.subtitle,
              mediaList: true
            },
            slots: {
              default: items.map((i) => itemDefaultListComponent(i, { contextLabelSource: 'itemName' }))
            }
          }
          this.busy = false
        })
      }
    }
  }
}
</script>
