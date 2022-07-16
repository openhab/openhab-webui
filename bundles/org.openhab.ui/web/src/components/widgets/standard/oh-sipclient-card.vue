<template>
  <f7-card ref="card" class="oh-sipclient-card" :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline" @taphold.native="localSettingsPopup">
    <f7-card-header v-if="config.title">
      <div>{{ config.title }}</div>
    </f7-card-header>
    <f7-card-content ref="cardContent" @click.native="onCardClick" class="label-card-content" :style="{ background: config.background, overflow: 'hidden' }" :class="{ 'vertical-arrangement': config.vertical }">
      <img ref="sipIcon" width="100%" height="100%" style="object-fit: contain" src="@/images/phone.svg">
      <div class="sip-status-indicator" :style="{ 'background-color': color }" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{ config.footer }}
    </f7-card-footer>
    <f7-popup class="call-popup" :opened="popupOpened" tablet-fullscreen @click.native="onPopupClick" @popup:closed="onPopupClose">
      <transition name="fade">
        <!-- show door image if caller is door or popup was opened manually -->
        <img v-if="config.doorEnabled && !session || callerIsDoor" style="object-fit: contain" :src="imgSource">
        <!-- else show call information -->
        <div v-else class="call-info">
          <div class="remote-party">
            {{ remoteParty }}
          </div>
          <div class="call-state-description">
            {{ callStateDescription }}
          </div>
        </div>
      </transition>

      <!-- show quick dial fab when there's no call and dial buttons configured -->
      <transition name="fade">
        <f7-fab v-if="config.sipAddress1 && (!session || session.isEnded())" position="right-bottom" @click.stop="resetCloseTimer">
          <f7-icon f7="phone_fill_badge_plus" color="white" size="60" />
          <f7-icon f7="phone_fill_badge_plus" color="white" size="60" />
          <f7-fab-buttons position="top">
            <template v-for="button in 4">
              <f7-fab-button :key="button" v-if="config['sipAddress' + button]" :label="config['sipAlias' + button]" @click.stop="call(config['sipAddress' + button])" fab-close>
                {{ button }}
              </f7-fab-button>
            </template>
          </f7-fab-buttons>
        </f7-fab>
      </transition>
      <!-- show answer button on incoming call -->
      <transition name="fade">
        <f7-fab v-if="session && session.direction === 'incoming' && session.isInProgress()" position="center-bottom" class="fab-green" @click.stop="answer()">
          <f7-icon f7="phone_fill" color="white" size="60" />
        </f7-fab>
      </transition>
      <!-- show hangup button for ongoing calls -->
      <transition name="fade">
        <f7-fab v-if="session && !session.isEnded()" position="right-bottom" color="red" @click.stop="session.terminate()">
          <f7-icon material="call_end" color="white" size="60" />
        </f7-fab>
      </transition>
      <!-- show door open button on ongoing call with door -->
      <transition name="fade">
        <f7-fab v-if="config.doorDTMF && callerIsDoor && session.isEstablished()" position="center-bottom" color="white" @click.stop="session.sendDTMF(config.doorDTMF)">
          <f7-icon material="meeting_room" color="black" size="60" />
        </f7-fab>
      </transition>
    </f7-popup>
  </f7-card>
</template>

<style lang="stylus">
  .fade-enter-active, .fade-leave-active
    transition opacity 0.5s
  .fade-enter, .fade-leave-to
    opacity 0
  .fab-green
    --f7-fab-bg-color #3cb24a
  .popup.call-popup
    background-color black
    >:first-child
      background-color black
      height 100%
      width 100%
    .fab
      --f7-fab-size 100px
      --f7-fab-button-size 80px
      --f7-fab-label-font-size 20px
      font-size: 20px
  .call-info
    display flex
    flex-direction column
    justify-content center
    align-items center
    text-align center
    font-size @css{max(2.5 * (1vw + 1vh), 14px)}
    color white
    .call-state-description
      font-size @css{max(1.5 * (1vw + 1vh), 14px)}
  .sip-status-indicator
    position absolute
    bottom 10px
    right 10px
    width 15px
    height 15px
    max-width 20%
    max-height 20%
    border-radius 7.5px
</style>

<script>
import mixin from '../widget-mixin'
import { OhSIPClientCardDefinition } from '@/assets/definitions/widgets/standard/cards'
import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import { WidgetDefinition, pg, pt } from '@/assets/definitions/widgets/helpers.js'

// Thanks to Joseph Sardin, https://bigsoundbank.com
import ringFile from './oh-sipclient-ringtone.mp3'
import ringBackFile from './oh-sipclient-ringback.mp3'

export default {
  data () {
    return {
      popupOpened: false,
      session: false,
      color: 'gray',
      remoteParty: '',
      callStateDescription: ''
    }
  },
  mixins: [mixin],
  widget: OhSIPClientCardDefinition,
  computed: {
    imgSource () {
      // for image to lazy load only when popup is shown. check for better practice?
      return (this.popupOpened && (!this.session || this.callerIsDoor)) ? this.config.doorImageURL : ''
    },
    callerIsDoor () {
      return this.session && this.session.remote_identity && this.session.remote_identity.uri.user === this.config.doorUser
    }
  },
  mounted () {
    // prevent long press from opening image-save-as popup on Android
    this.$refs.sipIcon.addEventListener('contextmenu', (event) => event.preventDefault())

    // load device specific configuration
    this.localConfig = JSON.parse(localStorage.getItem('openhab.ui:sipConfig'))

    // start SIP connection
    this.sipStart()
  },
  methods: {
    sipStart () {
      if (this.context.editmode) return // do not connect SIP while editing
      if (this.phone) this.phone.stop() // reconnect to reload config
      this.context.component.config = { ...this.config, ...this.localConfig } // merge local device configuration

      import(/* webpackChunkName: "jssip" */ 'jssip').then((JsSIP) => { // code split / dynamically load jssip
        // SIP user agent setup
        this.remoteAudio = new window.Audio() // audio setup
        const socket = new JsSIP.WebSocketInterface(this.config.websocketUrl)
        const configuration = {
          sockets: socket,
          uri: 'sip:' + (this.config.username) + '@' + this.config.domain,
          password: this.config.password
        }
        this.phone = new JsSIP.UA(configuration);

        // update status indicator on connection changes
        ['connecting', 'connected', 'disconnected', 'registered', 'unregistered'].forEach(event => this.phone.on(event, this.updateStatusIndicator))

        // register event for new call (session)
        this.phone.on('newRTCSession', (data) => {
          this.session = data.session
          if (this.session.direction === 'outgoing') {
            // outgoing call, set ringback tone
            this.audio = new Audio(ringBackFile)
            this.callStateDescription = 'Calling...'
            this.attachAudio()
          } else {
            // incoming call, open popup and set ringtone
            this.popupOpened = true
            this.audio = new Audio(ringFile)
            this.callStateDescription = 'Incoming call'
          }
          // play ring or ringback tone
          this.audio.loop = true
          this.audio.play()

          this.session.on('accepted', () => {
            this.audio.pause() // stop playing ring or ringback tone
            this.callStateDescription = 'Call in progress'
          })
          this.session.on('ended', () => {
            this.audio.pause() // stop playing ring or ringback tone
            this.callStateDescription = 'Call ended'
            this.closeTimer = setTimeout(() => { this.popupOpened = false }, 5000) // auto-close popup when call ended
          })
          this.session.on('failed', (event) => {
            this.audio.pause() // stop playing ring or ringback tone
            this.callStateDescription = 'Call failed. Reason: ' + event.cause
            this.closeTimer = setTimeout(() => { this.popupOpened = false }, 5000) // auto-close popup when call ended
          })
          this.remoteParty = this.getAliasFromSession()
        })
        this.phone.start()

        // stop SIP connection on page change ('beforeDestroy' doesn't work as the previous page is kept in background)
        this.$f7router.once('pageBeforeOut', () => { this.phone.stop() })
      })
    },
    attachAudio () {
      this.session.connection.addEventListener('track', (e) => {
        this.remoteAudio.srcObject = e.streams[0]
        this.remoteAudio.play()
      })
    },
    onCardClick () {
      this.context.editmode ? this.localSettingsPopup() : this.popupOpened = true
    },
    onPopupClick () {
      this.resetCloseTimer()
      this.popupOpened = false
    },
    onPopupClose () {
      if (this.session && !this.session.isEnded()) this.session.terminate()
      this.session = false
    },
    resetCloseTimer () {
      if (this.closeTimer) { clearTimeout(this.closeTimer) } // stop auto-close timer
    },
    localSettingsPopup () {
      if (!this.config.intercomEnabled) return
      const popup = { component: WidgetConfigPopup }
      this.$f7router.navigate({ url: 'local-sip-settings', route: { path: 'local-sip-settings', popup } }, {
        props: {
          component: {
            config: this.localConfig || {}
          },
          widget: new WidgetDefinition('localSipSettings', 'local SIP client settings', '')
            .paramGroup(pg('sipCredentials', 'SIP Credentials'), [
              pt('username', 'Username', 'SIP Username'),
              pt('password', 'Password', 'SIP Password')
            ])
            .paramGroup(pg('sipAddresses', 'Dial Buttons'), [
              pt('sipAddress1', 'Address 1', 'SIP Address to call'),
              pt('sipAlias1', 'Alias 1', 'Alias to display on dial button'),
              pt('sipAddress2', 'Address 2', 'SIP Address to call').v((v, config, c, p) => !!config.sipAddress1),
              pt('sipAlias2', 'Alias 2', 'Alias to display on dial button').v((v, config, c, p) => !!config.sipAddress1),
              pt('sipAddress3', 'Address 3', 'SIP Address to call').v((v, config, c, p) => config.sipAddress1 && config.sipAddress2),
              pt('sipAlias3', 'Alias 3', 'Alias to display on dial button').v((v, config, c, p) => config.sipAddress1 && config.sipAddress2),
              pt('sipAddress4', 'Address 4', 'SIP Address to call').v((v, config, c, p) => config.sipAddress1 && config.sipAddress2 && config.sipAddress3),
              pt('sipAlias4', 'Alias 4', 'Alias to display on dial button').v((v, config, c, p) => config.sipAddress1 && config.sipAddress2 && config.sipAddress3)
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
    call (target) {
      this.phone.call(target, { mediaConstraints: { audio: true, video: false } })
    },
    answer () {
      this.session.answer({ mediaConstraints: { audio: true, video: false } })
      this.attachAudio()
    },
    sendDTMF () {
      if (this.config.doorDTMF) this.session.sendDTMF(this.config.doorDTMF)
    },
    updateStatusIndicator (e) {
      this.color = this.phone.isConnected() ? this.phone.isRegistered() ? 'limegreen' : 'orange' : 'red'
    },
    getAliasFromSession () {
      let foundAddress = [1, 2, 3, 4].find((n) => this.session.remote_identity.uri.user === this.localConfig['sipAddress' + n])
      if (foundAddress) return this.localConfig['sipAlias' + foundAddress]
      else return this.session.remote_identity.uri.user
    }
  }
}
</script>
