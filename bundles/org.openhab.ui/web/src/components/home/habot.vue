<template>
  <div class="habot-wrapper col">
    <!-- Chat with HABot
    <f7-list>
      <f7-list-input placeholder="Hello">
      </f7-list-input>
    </f7-list>
    <br /> -->
    <f7-input type="text" :placeholder="greeting" class="habot-chatbar searchbar" :class="{ highlight: focused || value }" clear-button @focus="chatboxFocused" :value="value" @change="chatboxSend" @blur="chatboxBlur">
    </f7-input>
    <f7-icon class="habot-icon" md="material:chat"></f7-icon>
    <f7-list v-if="focused && !value" class="chat-suggestions" no-hairlines-md>
      <f7-list-item v-for="suggestion in ['What\'s the temperature in the kitchen?', 'Set the thermostat to 21 degrees', 'Turn off the lights on the first floor']"
        :key="suggestion" @click="chooseSuggestion(suggestion)" link :title="suggestion"></f7-list-item>
    </f7-list>
    <f7-message v-if="query && !focused" type="sent" :text="query" color="blue" first tail></f7-message>
    <f7-message v-if="(answer || busy) && !focused" type="received" :typing="busy" :text="answer" last tail></f7-message>
    <!-- <f7-searchbar placeholder="Hello" clear-button></f7-searchbar> -->
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

.ios .habot-chatbar input
  border-radius 22px !important

.md
  .habot-chatbar
    --f7-searchbar-input-font-size: 16px
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
    margin-top -2.2rem

.habot-icon
  // position absolute !important
  top -3.6rem
  padding 16px
  height 0
  // margin-top 12px
  z-index 10000
  color #5f6368
</style>

<script>
export default {
  data () {
    return {
      greeting: 'Hi, what can I do for you?',
      value: '',
      query: '',
      answer: '',
      busy: false,
      focused: false
    }
  },
  methods: {
    chatboxFocused () {
      this.focused = true
    },
    chatboxBlur (ev) {
      // delay in order to give a chance to choose a suggestion...
      setTimeout(() => this.focused = false, 200)
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
    sendQuery () {
      this.answer = ''
      if (!this.query) {
        return
      }
      this.busy = true
      new Promise((resolve, reject) => {
        // this.value = ''
        setTimeout(resolve, 1000)
      }).then((resp) => {
        this.answer = 'HABot is not integrated yet!'
        this.busy = false
      })
    }
  }
}
</script>

