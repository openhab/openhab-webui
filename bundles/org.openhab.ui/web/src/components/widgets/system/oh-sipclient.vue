<template>
  <div class="main-container">
    <!-- Show settings gear for local settings if intercom is enabled and in edit mode -->
    <f7-button v-if="context.editmode"
               icon-f7="gear_fill"
               @click.stop="localSettingsPopup()"
               class="text-align-right">
      Local SIP Account Settings
    </f7-button>
    <div v-if="config.enableVideo"
         class="video-container"
         :style="{ 'aspect-ratio': config.defaultVideoAspectRatio || '4/3' }">
      <video ref="remoteVideo"
             autoplay
             playsinline
             class="remote-video"
             poster="@/images/openhab-logo.svg" />
      <!-- Conditionally show local video when ready to prevent ugly video placeholder on Android -->
      <video v-show="showLocalVideo"
             ref="localVideo"
             autoplay
             playsinline
             muted="muted"
             class="local-video" />
    </div>
    <!-- Show yellow dial button if connection is not established -->
    <f7-button v-if="!connected"
               :style="computedButtonStyle"
               icon-f7="phone_fill_arrow_up_right"
               icon-color="yellow"
               :icon-size="config.iconSize" />
    <!-- Show dial menu when there`s no call -->
    <f7-button v-else-if="(!session || session.isEnded())"
               :style="computedButtonStyle"
               icon-f7="phone_fill_arrow_up_right"
               icon-color="green"
               :icon-size="config.iconSize"
               @click.stop="dial()" />
    <!-- Show answer button on incoming call -->
    <f7-segmented v-else-if="session && session.direction === 'incoming' && session.isInProgress()"
                  style="width: 100%; height: 100%">
      <f7-button :style="computedButtonStyle"
                 icon-f7="phone_fill_arrow_down_left"
                 icon-color="green"
                 :icon-size="config.iconSize"
                 @click.stop="answer()">
        {{ (!config.hideCallerId) ? remoteParty : '' }}
      </f7-button>
      <f7-button :style="computedButtonStyle"
                 icon-f7="phone_down_fill"
                 icon-color="red"
                 :icon-size="config.iconSize"
                 @click.stop="session.terminate()" />
    </f7-segmented>
    <!-- Show hangup button and DTM button (if configured) for ongoing call -->
    <f7-segmented v-else style="width: 100%; height: 100%">
      <!-- Show hangup button for outgoing call -->
      <f7-button v-if="session && session.isInProgress()"
                 :style="computedButtonStyle"
                 icon-f7="phone_down_fill"
                 icon-color="yellow"
                 :icon-size="config.iconSize"
                 @click.stop="session.terminate()" />
      <!-- Show hangup button for ongoing call -->
      <f7-button v-else-if="session && !session.isEnded()"
                 :style="computedButtonStyle"
                 icon-f7="phone_down_fill"
                 icon-color="red"
                 :icon-size="config.iconSize"
                 @click.stop="session.terminate()" />
      <!-- Show send DTMF button if in a call if DTMF string is configured -->
      <f7-button v-if="session && !session.isInProgress() && !session.isEnded() && config.dtmfString && config.dtmfString.length > 0"
                 :style="computedButtonStyle"
                 icon-f7="number_square"
                 icon-color="orange"
                 :icon-size="config.iconSize"
                 @click.stop="sendDTMF()" />
    </f7-segmented>
  </div>
</template>

<style lang="stylus">
.main-container
  width: 100%
  height: 100%
  .video-container
    position relative
    .remote-video
      width: 100%
      height: 100%
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
import { WidgetDefinition, pg, pt, pi } from '@/assets/definitions/widgets/helpers.js'

// Thanks to Joseph Sardin, https://bigsoundbank.com
// ringFile source: https://bigsoundbank.com/detail-0375-phone-ring-5.html
import ringFile from './oh-sipclient-ringtone.mp3'
import ringBackFile from './oh-sipclient-ringback.mp3'

export default {
  data () {
    return {
      connected: false,
      session: null,
      remoteParty: '',
      phonebook: new Map(),
      showLocalVideo: false,
      stream: null
    }
  },
  mixins: [mixin, foregroundService, actionsMixin],
  widget: OhSIPClientDefinition,
  computed: {
    computedButtonStyle () {
      return {
        'min-height': this.config.iconSize + 'px',
        height: '100%',
        display: 'flex'
      }
    }
  },
  methods: {
    startForegroundActivity () {
      // Load device specific configuration
      this.localConfig = JSON.parse(localStorage.getItem('openhab.ui:sipConfig'))
      // Init phonebook Map
      if (this.config.phonebook) {
        if (this.config.phonebook.includes('=')) {
          this.config.phonebook.split(',').map((e) => {
            return this.phonebook.set(e.split('=')[0], e.split('=')[1])
          })
        }
      }

      if (this.context.editmode) return // Do not connect SIP while editing

      // Make sure we have Mic/Camera permissions
      if (!navigator.mediaDevices) {
        this.$f7.dialog.alert('To use the SIP widget, please make sure that HTTPS is in use and WebRTC is supported by this browser.')
      } else {
        navigator.mediaDevices.getUserMedia({ audio: true, video: this.config.enableVideo })
          .then((stream) => {
            // Store MediaDevices access here to stop it when foreground is left
            // Do NOT stop MediaDevices access here (keep Mic/Camera access) to improve call startup time
            this.stream = stream
            // Start SIP connection
            this.sipStart()
          })
          .catch((err) => {
            console.log('Could not access microphone/camera', err)
            this.$f7.dialog.alert('To use the SIP widget you must allow microphone/camera access in your browser and reload this page.')
          })
      }
    },
    stopForegroundActivity () {
      // Stop MediaDevices access here, otherwise Mic/Camera access will stay active on iOS
      if (this.stream) this.stream.getTracks().forEach((track) => track.stop())
      if (this.phone) this.phone.stop()
      this.remoteAudio = null
    },
    /**
     * Starts the JsSIP UserAgent and connects to the SIP server.
     */
    sipStart () {
      if (this.phone) this.phone.stop() // Reconnect to reload config
      this.context.component.config = { ...this.config, ...this.localConfig } // Merge local device configuration

      import(/* webpackChunkName: "jssip" */ 'jssip').then((JsSIP) => { // Lazy load jssip
        if (this.config.enableSIPDebug) { JsSIP.debug.enable('JsSIP:*') } else { JsSIP.debug.disable() }
        // SIP user agent setup
        this.remoteAudio = new window.Audio()
        const url = new URL(this.config.websocketUrl, window.location.origin)
        if (url.protocol.indexOf('http') === 0) {
          url.protocol = url.protocol.replace('http', 'ws')
        }
        const socket = new JsSIP.WebSocketInterface(url.toString())
        const configuration = {
          sockets: [socket],
          uri: 'sip:' + this.config.username + '@' + this.config.domain,
          authorization_user: this.config.authorizationUser ?? undefined,
          password: this.config.password,
          session_timers: false,
          register: (this.config.disableRegister !== true)
        }
        this.phone = new JsSIP.UA(configuration)

        // Update connected status on connection changes
        this.phone.on('connected', () => {
          this.connected = true
          this.updateStateItem('connected')
          console.info(this.LOGGER_PREFIX + ': Connected to SIP server')
          if (this.config.autoDial && this.config.disableRegister === true) {
            this.autoDial()
          }
        })
        this.phone.on('disconnected', () => {
          this.connected = false
          this.updateStateItem('disconnected')
          console.info(this.LOGGER_PREFIX + ': Disconnected from SIP server')
        })
        this.phone.on('registered', () => {
          this.updateStateItem('registered')
          console.info(this.LOGGER_PREFIX + ': SIP registration successful')
          if (this.config.autoDial) {
            // give a little time to account for an incoming call after registration before calling
            setTimeout(() => this.autoDial(), 1000)
          }
        })

        // Register event for new incoming or outgoing call event
        this.phone.on('newRTCSession', (data) => {
          this.session = data.session
          const remoteParty = this.session.remote_identity.uri.user
          const remotePartyWithHost = `${this.session.remote_identity.uri.user}@${this.session.remote_identity.uri.host}`

          this.remoteParty = (this.phonebook.size > 0) ? this.phonebook.get(this.session.remote_identity.uri.user) : this.session.remote_identity.uri.user

          if (this.session.direction === 'outgoing') {
            this.updateStateItem('outgoing:' + remotePartyWithHost)
            // Handle accepted call
            this.session.on('accepted', () => {
              this.stopTones()
              this.updateStateItem('outgoing-accepted:' + remotePartyWithHost)
              console.info(this.LOGGER_PREFIX + ': Outgoing call in progress')
            })
          } else if (this.session.direction === 'incoming') {
            console.info(this.LOGGER_PREFIX + ': Incoming call from ' + this.remoteParty)
            this.playTone(ringFile)
            this.updateStateItem('incoming:' + remotePartyWithHost)
            // Handle accepted call
            this.session.on('accepted', () => {
              this.updateStateItem('incoming-accepted:' + remotePartyWithHost)
              console.info(this.LOGGER_PREFIX + ': Incoming call in progress')
            })
            if (this.config.autoAnswer) {
              const autoAnswer = this.config.autoAnswer.toString()
              if (autoAnswer.trim() === '*') {
                this.answer()
              } else {
                const parts = autoAnswer.split(',')
                parts.forEach((part) => {
                  if ((part.indexOf('@') > 0 && part === remotePartyWithHost) || part === remoteParty) {
                    this.answer()
                  }
                })
              }
            }
          }
          // Handle ended call
          this.session.on('ended', () => {
            this.stopMedia()
            this.updateStateItem('ended:' + remotePartyWithHost)
            console.info(this.LOGGER_PREFIX + ': Call ended')
          })
          // Handle failed call
          this.session.on('failed', (event) => {
            this.stopTones()
            this.stopMedia()
            this.updateStateItem('failed:' + remotePartyWithHost)
            console.info(this.LOGGER_PREFIX + ': Call failed. Reason: ' + event.cause)
          })
        })
        this.phone.start()
      })
    },
    /**
     * Plays a given tone. Might not properly work on all browsers and devices.
     * @param {*} file file to be played
     */
    playTone (file) {
      if (this.config.enableTones === true) {
        console.info(this.LOGGER_PREFIX + ': Starting to play tone')
        this.audio = new Audio(file)
        // Play tone
        this.audio.loop = true
        this.audio.load()
        this.audio.play().catch((error) => {
          console.debug(this.LOGGER_PREFIX + ': Play tone: ' + error)
        })
      }
    },
    /**
     * Stops all played tones.
     */
    stopTones () {
      if (this.config.enableTones === true) {
        console.info(this.LOGGER_PREFIX + ': Stop playing tone')
        this.audio.pause()
      }
    },
    /**
     * Attaches MediaStreams (remote audio, remote & eventually local video) for the SIP call.
     */
    attachMedia () {
      this.session.connection.addEventListener('track', (track) => {
        if (this.config.enableVideo) {
          this.$refs.remoteVideo.srcObject = track.streams[0]
          if (this.config.enableLocalVideo) {
            this.showLocalVideo = true
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
              .then((stream) => {
                this.$refs.localVideo.srcObject = stream
              })
          }
        } else {
          this.remoteAudio.srcObject = track.streams[0]
          this.remoteAudio.play()
        }
      })
    },
    /**
     * Stops all MediaStreams (remote audio, remote & eventually local video) of the SIP call.
     */
    stopMedia () {
      if (this.config.enableVideo) {
        this.$refs.remoteVideo.srcObject = null
        if (this.config.enableLocalVideo) {
          // Make sure all tracks are stopped
          this.$refs.localVideo.srcObject.getTracks().forEach((track) => track.stop())
          this.$refs.localVideo.srcObject = null
          this.showLocalVideo = false
        }
      } else {
        this.remoteAudio.srcObject = null
        this.remoteAudio.pause()
      }
    },
    call (target) {
      console.info(this.LOGGER_PREFIX + ': Calling ' + this.remoteParty + ' ...')
      this.phone.call(target, { mediaConstraints: { audio: true, video: this.config.enableVideo } })
      this.attachMedia()
      this.playTone(ringBackFile)
    },
    answer () {
      this.stopTones()
      this.session.answer({ mediaConstraints: { audio: true, video: this.config.enableVideo } })
      this.attachMedia()
    },
    sendDTMF () {
      const options = {
        duration: 160,
        interToneGap: 640
      }
      this.session.sendDTMF(this.config.dtmfString, options)
    },
    localSettingsPopup () {
      console.info(this.LOGGER_PREFIX + ': Opening local settings popup.')
      const popup = { component: WidgetConfigPopup }
      this.$f7router.navigate({ url: 'local-sip-settings', route: { path: 'local-sip-settings', popup } }, {
        props: {
          component: {
            config: this.localConfig || {}
          },
          widget: new WidgetDefinition('localSipSettings', 'local SIP client settings', '')
            .paramGroup(pg('sipCredentials', 'SIP Credentials', 'These are not stored on the openHAB server, but instead locally in your browser. ' +
              'Local settings allow each UI client to have its own SIP account and therefore to establish an intercom between multiple UI clients. ' +
              'Note: You still need to configure the SIP domain and other options in the widget settings!'), [
              pt('username', 'Local SIP Username', 'Used instead of the username from widget settings and stored on the openHAB server.'),
              pt('password', 'Local SIP Password', 'Used instead of the password from the widget settings and stored on the openHAB server.'),
              pt('ownSipAddress', 'Local SIP Address', 'SIP Address (phone number) of this local client. Used by the client to remove itself from the dial ' +
                'popup, which is configured with the phonebook option in the widget settings.'),
              pi('sipStateItem', 'State Item', 'Used instead of the SIP connection state Item from the widget settings and stored on the openHAB server.').a()
            ])
        }
      })
      this.$f7.on('widgetConfigUpdate', this.storeLocalConfig)
      this.$f7.once('widgetConfigClosed', () => this.$f7.off('widgetConfigUpdate', this.storeLocalConfig))
    },
    storeLocalConfig (config) {
      this.localConfig = config
      localStorage.setItem('openhab.ui:sipConfig', JSON.stringify(this.localConfig))
      this.sipStart() // reload config
    },
    dial () {
      if (this.config.phonebook !== undefined && this.phonebook.size <= 1) {
        this.call(this.config.phonebook.split('=')[0])
      } else if (this.phonebook.size > 1) {
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
      } else {
        this.$f7.dialog.alert('Please configure phonebook entries')
      }
    },
    autoDial () {
      const session = this.session
      if (!session || !(session.isInProgress() || session.isEstablished())) {
        this.call(this.config.autoDial.toString())
      }
    },
    updateStateItem (newStatus) {
      if (!this.config.sipStateItem) return
      this.$store.dispatch('sendCommand', { itemName: this.config.sipStateItem, cmd: newStatus })
    }
  },
  created () {
    this.LOGGER_PREFIX = 'oh-sipclient'
  }
}
</script>
