<template>
  <f7-link class="habot-speech-icon"
           v-if="supported"
           :icon-f7="(listening && activity) ? 'mic_fill' : 'mic'"
           :icon-size="24"
           :icon-color="listening ? 'red' : 'gray'"
           @click="toggleSpeech" />
</template>

<style lang="stylus">
.habot-speech-icon
  // position absolute !important
  line-height 2.5rem
  padding 16px
  height 0
  // margin-top 12px
  z-index 10000
  cursor pointer

.ios .habot-speech-icon
  top calc(-0.85 * var(--f7-searchbar-height))
  float right
.md .habot-speech-icon
  top calc(-1 * var(--f7-searchbar-height))
  float right
.aurora .habot-speech-icon
  top calc(-0.80 * var(--f7-searchbar-height))
  float right

</style>

<script>
export default {
  props: ['lang'],
  data () {
    return {
      supported: this.$oh.speech.isRecognitionSupported(),
      listening: false,
      activity: false
    }
  },
  methods: {
    toggleSpeech () {
      const self = this
      if (!this.supported) return
      if (!this.listening) {
        // FIXME
        const locale = (this.lang === 'en') ? 'en-US' : this.lang + '-' + this.lang.toUpperCase()

        this.$oh.speech.startRecognition(locale,
          // start
          (ev) => {
            this.listening = true
          },
          // error
          (ev) => {
            self.$f7.toast.create({
              icon: '<i class="f7-icons">mic_slash_fill</i>',
              text: ev.error,
              position: 'center',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          },
          // activity
          (ev) => {
            if (ev.type === 'soundstart') self.activity = true
            if (ev.type === 'soundend') self.activity = false
          },
          // result
          (result) => {
            self.$emit('result', result)
          },
          // end
          (ev) => {
            self.listening = false
            self.activity = false
            this.$oh.speech.stopRecognition()
          }
        )
      } else {
        this.$oh.speech.stopRecognition()
      }
    }
  }
}
</script>
