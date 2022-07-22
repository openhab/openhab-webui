<template>
  <div>
    <!-- Show settings gear for local settings if intercom is enabled and in edit mode -->
    <f7-button v-if="context.editmode && config.intercomEnabled" :style="{ height: config.height }" icon-f7="gear_fill" :icon-size="config.height" @click.stop="localSettingsPopup()" />
    <div v-if="config.enableVideo" class="video-container">
      <video ref="remoteVideo" autoplay playsinline class="remote-video" poster="@/images/openhab-logo.svg" />
      <video v-if="config.enableLocalVideo" ref="localVideo" autoplay playsinline muted="muted" class="local-video" />
    </div>
    <div v-if="!context.editmode">
      <!-- Show yellow dial button if connection is not established -->
      <f7-button v-if="!connected" :style="{ height: config.height }" icon-f7="phone_fill_arrow_up_right" icon-color="yellow" :icon-size="config.height" />
      <!-- Show dial menu when there`s no call -->
      <f7-button v-else-if="(!session || session.isEnded())" :style="{ height: config.height }" icon-f7="phone_fill_arrow_up_right" icon-color="green" :icon-size="config.height" @click.stop="dial()" />
      <!-- Show answer button on incoming call -->
      <f7-segmented v-else-if="session && session.direction === 'incoming' && session.isInProgress()">
        <f7-button :style="{ height: config.height }" icon-f7="phone_fill_arrow_down_left" icon-color="green" :icon-size="config.height" @click.stop="answer()">
          {{ (!config.hideCallerId) ? this.remoteParty : '' }}
        </f7-button>
        <f7-button :style="{ height: config.height }" icon-f7="phone_down_fill" icon-color="red" :icon-size="config.height" @click.stop="session.terminate()" />
      </f7-segmented>
      <f7-segmented v-else>
        <!-- Show hangup button for outgoing call -->
        <f7-button v-if="session && session.isInProgress()" :style="{ height: config.height }" icon-f7="phone_down_fill" icon-color="yellow" :icon-size="config.height" @click.stop="session.terminate()" />
        <!-- Show hangup button for ongoing call -->
        <f7-button v-else-if="session && !session.isEnded()" :style="{ height: config.height }" icon-f7="phone_down_fill" icon-color="red" :icon-size="config.height" @click.stop="session.terminate()" />
        <!-- Show send dtmf button if in a call and feature is enabled-->
        <f7-button v-if="session && !session.isInProgress() && !session.isEnded() && config.dtmfString && config.dtmfString.length > 0" :style="{ height: config.height }" icon-f7="number_square" icon-color="yellow" :icon-size="config.height" @click.stop="sendDTMF()" />
      </f7-segmented>
    </div>
  </div>
</template>

<style lang="stylus">
.video-container
  position relative
  .remote-video
    width 100%
    aspect-ratio: 1
  .local-video
    position absolute
    width 30%
    bottom 0px
    right 0px
</style>

<script>
import mixin from '../widget-mixin'
import { OhSIPClientDefinition } from '@/assets/definitions/widgets/system'
import foregroundService from '../widget-foreground-service'
import { actionsMixin } from '../widget-actions'
import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import { WidgetDefinition, pg, pt } from '@/assets/definitions/widgets/helpers.js'

// Thanks to Joseph Sardin, https://bigsoundbank.com
import ringFile from './oh-sipclient-ringtone.mp3'
import ringBackFile from './oh-sipclient-ringback.mp3'

export default {
  data () {
    return {
      connected: false,
      session: false,
      remoteParty: '',
      phonebook: new Map(),
      loggerPrefix: 'oh-sipclient'
    }
  },
  mixins: [mixin, foregroundService, actionsMixin],
  widget: OhSIPClientDefinition,
  methods: {
    startForegroundActivity () {
      // Load device specific configuration
      this.localConfig = JSON.parse(localStorage.getItem('openhab.ui:sipConfig'))
      // Init phonebook Map
      if (this.config.phonebook) {
        this.config.phonebook.split(',').map((e) => {
          return this.phonebook.set(e.split('=')[0], e.split('=')[1])
        })
      }
      // Start SIP connection
      this.sipStart()
    },
    stopForegroundActivity () {
      if (this.phone) this.phone.stop()
    },
    sipStart () {
      if (this.context.editmode) return // do not connect SIP while editing
      if (this.phone) this.phone.stop() // reconnect to reload config
      this.context.component.config = { ...this.config, ...this.localConfig } // merge local device configuration

      import(/* webpackChunkName: "jssip" */ 'jssip').then((JsSIP) => { // lazy load jssip
        this.config.enableSIPDebug ? JsSIP.debug.enable('JsSIP:*') : JsSIP.debug.disable()
        // SIP user agent setup
        this.remoteAudio = new window.Audio()
        const socket = new JsSIP.WebSocketInterface(this.config.websocketUrl)
        const configuration = {
          sockets: [socket],
          uri: 'sip:' + this.config.username + '@' + this.config.domain,
          password: this.config.password,
          session_timers: false
        }
        this.phone = new JsSIP.UA(configuration)

        // Update connected status on connection changes
        this.phone.on('connected', () => {
          this.connected = true
          console.info(this.loggerPrefix + ': Connected to SIP server')
        })
        this.phone.on('disconnected', () => {
          this.connected = false
          console.info(this.loggerPrefix + ': Disconnected from SIP server')
        })

        // Register event for new incoming or outgoing call event
        this.phone.on('newRTCSession', (data) => {
          this.session = data.session

          this.remoteParty = (this.phonebook.size > 0) ? this.phonebook.get(this.session.remote_identity.uri.user) : this.session.remote_identity.uri.user

          // Handle outgoing call,
          if (this.session.direction === 'outgoing') {
            if (this.config.enableTones === true) {
              // Set ringback tone
              this.audio = new Audio(ringBackFile)
            }
            console.info(this.loggerPrefix + ': Calling ' + this.remoteParty + ' ...')
          } else if (this.session.direction === 'incoming') {
            // Set ring tone
            if (this.config.enableTones === true) this.audio = new Audio(ringFile)
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
            if (this.config.enableVideo) this.$refs.remoteVideo.srcObject = null
            if (this.config.enableLocalVideo) this.$refs.localVideo.srcObject = null
            console.info(this.loggerPrefix + ': Call ended')
          })
          // Handle failed call
          this.session.on('failed', (event) => {
            // Stop playing ringback or ring tone
            if (this.config.enableTones === true) this.audio.pause()
            if (this.config.enableVideo) this.$refs.remoteVideo.srcObject = null
            if (this.config.enableLocalVideo) this.$refs.localVideo.srcObject = null
            console.info(this.loggerPrefix + ': Call failed. Reason: ' + event.cause)
          })
        })
        this.phone.start()
      })
    },
    attachMedia () {
      this.session.connection.addEventListener('addstream', (streamEvent) => {
        this.remoteAudio.srcObject = streamEvent.stream
        this.remoteAudio.play()
        if (this.config.enableVideo) {
          this.$refs.remoteVideo.srcObject = this.session.connection.getRemoteStreams()[0]
          if (this.config.enableLocalVideo) {
            this.$refs.localVideo.srcObject = this.session.connection.getLocalStreams()[0]
          }
        }
      })
    },
    call (target) {
      this.phone.call(target, { mediaConstraints: { audio: true, video: this.config.enableVideo } })
      this.attachMedia()
    },
    answer () {
      this.session.answer({ mediaConstraints: { audio: true, video: this.config.enableVideo } })
      this.attachMedia()
    },
    sendDTMF () {
      const options = {
        'duration': 160,
        'interToneGap': 640
      }
      this.session.sendDTMF(this.config.dtmfString, options)
    },
    localSettingsPopup () {
      console.info(this.loggerPrefix + ': Opening local settings popup.')
      const popup = { component: WidgetConfigPopup }
      this.$f7router.navigate({ url: 'local-sip-settings', route: { path: 'local-sip-settings', popup } }, {
        props: {
          component: {
            config: this.localConfig || {}
          },
          widget: new WidgetDefinition('localSipSettings', 'local SIP client settings', '')
            .paramGroup(pg('sipCredentials', 'SIP Credentials'), [
              pt('username', 'Username', 'SIP Username'),
              pt('password', 'Password', 'SIP Password'),
              pt('ownSipAddress', 'Own SIP Address', 'SIP Address (phone number) of this client. Used by the client to remove itself from the dial popup.')
            ])
        }
      })
      this.$f7.once('widgetConfigUpdate', this.storeLocalConfig)
    },
    storeLocalConfig (config) {
      this.localConfig = config
      localStorage.setItem('openhab.ui:sipConfig', JSON.stringify(this.localConfig))
      this.sipStart() // reload config
    },
    dialPopup () {
      const actionsPromise = new Promise((resolve, reject) => {
        if (this.phonebook.size > 0) {
          resolve(Array.from(this.phonebook.keys()).filter((key) => this.config.ownSipAddress ? this.config.ownSipAddress !== key : true).map((key) => {
            return {
              text: this.phonebook.get(key) || key,
              color: 'blue',
              onClick: () => {
                this.call(key)
              }
            }
          }))
        } else {
          this.$f7.dialog.alert('Please configure phonebook entries')
        }
      })
      actionsPromise.then((actions) => {
        this.$f7.actions.create({
          buttons: [
            actions,
            [{ text: 'Cancel', color: 'red' }]
          ]
        }).open()
      })
    }
  }

}
</script>
