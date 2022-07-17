<template>
  <!-- Show yellow dial button if connection is not established -->
  <f7-button v-if="!connected" :style="{ height: config.height }" icon-f7="phone_fill_arrow_up_right" icon-color="yellow" :icon-size="config.height"></f7-button>
  <!-- Show dial button when there`s no call -->
  <f7-button v-else-if="!session || session.isEnded()" :style="{ height: config.height }" icon-f7="phone_fill_arrow_up_right" icon-color="green" :icon-size="config.height" @click.stop="call(config['sipAddress'])"></f7-button>
  <!-- Show answer button on incoming call -->
  <f7-segmented v-else-if="session && session.direction === 'incoming' && session.isInProgress()">
    <f7-button :style="{ height: config.height }" icon-f7="phone_fill_arrow_down_left" icon-color="green" :icon-size="config.height" @click.stop="answer()">{{this.remoteParty}}</f7-button>
    <f7-button :style="{ height: config.height }" icon-f7="phone_down_fill" icon-color="red" :icon-size="config.height" @click.stop="session.terminate()"></f7-button>
  </f7-segmented>
  <!-- Show hangup button for outgoing call -->
  <f7-button v-else-if="session && session.isInProgress()" :style="{ height: config.height }" icon-f7="phone_down_fill" icon-color="yellow" :icon-size="config.height" @click.stop="session.terminate()"></f7-button>
  <!-- Show hangup button for ongoing call -->
  <f7-button v-else-if="session && !session.isEnded()" :style="{ height: config.height }" icon-f7="phone_down_fill" icon-color="red" :icon-size="config.height" @click.stop="session.terminate()"></f7-button>
  <!-- Show -->    
</template>

<script>
import mixin from '../widget-mixin'
import { OhSIPClientDefinition } from '@/assets/definitions/widgets/system'

// Thanks to Joseph Sardin, https://bigsoundbank.com
import ringFile from './oh-sipclient-ringtone.mp3'
import ringBackFile from './oh-sipclient-ringback.mp3'

export default {
  data () {
    return {
      connected: false,
      session: false,
      remoteParty: '',
      loggerPrefix: 'oh-sipclient'
    }
  },
  mixins: [mixin],
  widget: OhSIPClientDefinition,
  mounted () {
    // Start SIP connection
    this.sipStart()
  },
  methods: {
    sipStart () {
      if (this.context.editmode) return // do not connect SIP while editing
      if (this.phone) this.phone.stop() // reconnect to reload config

      import(/* webpackChunkName: "jssip" */ 'jssip').then((JsSIP) => { // lazy load jssip
        // SIP user agent setup
        this.remoteAudio = new window.Audio()
        const socket = new JsSIP.WebSocketInterface(this.config.websocketUrl)
        const configuration = {
          sockets: [socket],
          uri: 'sip:' + this.config.username + '@' + this.config.domain,
          password: this.config.password
        }
        this.phone = new JsSIP.UA(configuration)

        // Update connected status on connection changes
        this.phone.on('connected', () => { this.connected = true })
        this.phone.on('disconnected', () => { this.connected = false })
        
        // Register event for new incoming or outgoing call event
        this.phone.on('newRTCSession', (data) => {
          this.session = data.session
          this.remoteParty = this.session.remote_identity.uri.user
          // Handle outgoing call,
          if (this.session.direction === 'outgoing') {
            // Set ringback tone
            this.audio = new Audio(ringBackFile)
            this.attachAudio()
            console.info(this.loggerPrefix + ': Calling ' + this.remoteParty + ' ...')
          } else if (this.session.direction === 'incoming') {
            // Set ring tone
            this.audio = new Audio(ringFile)
            console.info(this.loggerPrefix + ': Incoming call from ' + this.remoteParty)
          }
          if (this.config.enableTones === true) {
            // Play ringback or ring tone
            this.audio.loop = true
            this.audio.play()
          }

          // Handle accepted call
          this.session.on('accepted', () => {
            // Stop playing ringback or ring tone
            if (this.config.enableTones === true) this.audio.pause()
            console.info(this.loggerPrefix + ': Call in progress')
          })
          // Handle ended call
          this.session.on('ended', () => {
            // Stop playing ringback or ring tone
            if (this.config.enableTones === true) this.audio.pause()
            console.info(this.loggerPrefix + ': Call ended')
          })
          // Handle failed call
          this.session.on('failed', (event) => {
            // Stop playing ringback or ring tone
            if (this.config.enableTones === true) this.audio.pause()
            console.info(this.loggerPrefix + ': Call failed. Reason: ' + event.cause)
          })
        })
        this.phone.start()

        // stop SIP connection on page change ('beforeDestroy' doesn't work as the previous page is kept in background)
        this.$f7router.once('pageBeforeOut', () => { this.phone.stop() })
      })
    },
    attachAudio () {
      this.session.connection.addEventListener('track', (data) => {
        this.remoteAudio.srcObject = data.streams[0]
        this.remoteAudio.play()
      })
    },
    call (target) {
      this.phone.call(target, { mediaConstraints: { audio: true, video: false } })
    },
    answer () {
      this.session.answer({ mediaConstraints: { audio: true, video: false } })
    }
  }
}
</script>