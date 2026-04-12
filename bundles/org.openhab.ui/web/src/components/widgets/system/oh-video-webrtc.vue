<template>
  <div class="oh-video-wrapper">
    <video
      ref="videoPlayer"
      :autoplay="this.startManually ? false : true"
      :controls="this.hideControls ? false : true"
      :muted="isMuted"
      :poster="computedPosterUrl"
      playsinline
      style="max-width: 100%">
      Sorry, your browser doesn't support embedded videos.
    </video>
    <button
      v-if="sendAudio && micActive === undefined"
      class="oh-video-mic"
      :class="{ active: isMicOn }"
      @click="toggleMic"
      :title="isMicOn ? 'Mute microphone' : 'Send microphone'">
      <i class="material-icons">{{ isMicOn ? 'mic' : 'mic_off' }}</i>
    </button>
  </div>
</template>

<script>
import { f7 } from 'framework7-vue'

import foregroundService from '../widget-foreground-service'

export default {
  mixins: [foregroundService],
  name: 'OhVideoWebRTC',
  props: {
    src: { type: String },
    stunServer: { type: String },
    candidatesTimeout: { type: Number },
    startManually: { type: Boolean },
    startMuted: { type: Boolean },
    hideControls: { type: Boolean },
    posterURL: { type: String },
    sendAudio: { type: Boolean },
    micActive: { type: Boolean, default: undefined },
    muteActive: { type: Boolean, default: undefined }
  },
  data() {
    return {
      webrtc: null,
      localAudioStream: null,
      audioTransceiver: null,
      offerAbortController: null,
      webrtcSendChannel: null,
      popupElement: null,
      isStopping: false,
      isMicOn: false,
      isMuted: false
    }
  },
  watch: {
    src(value) {
      if (!value) {
        this.stopStream()
        return
      }
      this.startStream()
    },
    sendAudio(value) {
      if (value === false && this.isMicOn) {
        this.isMicOn = false
        this.disableMicrophone()
      }
    },
    micActive(value) {
      if (value === true && !this.isMicOn) {
        this.isMicOn = true
        if (this.webrtc) {
          this.enableMicrophone(this.webrtc, this.audioTransceiver)
        } else if (this.inForeground && this.src) {
          this.startStream()
        }
      } else if (value === false && this.isMicOn) {
        this.isMicOn = false
        this.disableMicrophone()
      }
    },
    muteActive(value) {
      if (value === true) {
        this.isMuted = true
      } else if (value === false) {
        this.isMuted = false
      }
    }
  },
  computed: {
    computedPosterUrl() {
      if (this.posterURL && this.posterURL.startsWith('data:')) {
        return this.posterURL
      }
      const ts = new Date().toISOString()
      return this.posterURL
        ? this.posterURL.indexOf('?') === -1
          ? `${this.posterURL}?_ts=${ts}`
          : `${this.posterURL}&_ts=${ts}`
        : this.posterURL
    }
  },
  mounted() {
    this.isMuted = this.startMuted || false
    this.attachPopupLifecycleListeners()
  },
  beforeUnmount() {
    this.detachPopupLifecycleListeners()
    this.stopStream()
  },
  methods: {
    attachPopupLifecycleListeners() {
      const wrapper = this.$el
      if (!wrapper || typeof wrapper.closest !== 'function') {
        return
      }
      const popup = wrapper.closest('.popup')
      if (!popup) {
        return
      }
      this.popupElement = popup
      popup.addEventListener('popup:close', this.onPopupClose)
      popup.addEventListener('popup:opened', this.onPopupOpened)
    },
    detachPopupLifecycleListeners() {
      const popup = this.popupElement
      if (!popup) {
        return
      }
      popup.removeEventListener('popup:close', this.onPopupClose)
      popup.removeEventListener('popup:opened', this.onPopupOpened)
      this.popupElement = null
    },
    onPopupClose() {
      this.stopStream()
    },
    onPopupOpened() {
      if (this.inForeground && this.src && !this.webrtc) {
        this.startStream()
      }
    },
    resetVideoElement() {
      const videoPlayer = this.$refs.videoPlayer
      if (!videoPlayer) {
        return
      }
      try {
        const stream = videoPlayer.srcObject
        if (stream && typeof stream.getTracks === 'function') {
          stream.getTracks().forEach((track) => {
            try {
              track.stop()
            } catch (e) {}
          })
        }
      } catch (e) {}

      try {
        videoPlayer.pause()
      } catch (e) {}
      videoPlayer.srcObject = null
      try {
        videoPlayer.removeAttribute('src')
        videoPlayer.load()
      } catch (e) {}
    },
    stopStream() {
      if (this.isStopping) {
        return
      }
      const hasActiveStream = !!(
        this.offerAbortController ||
        this.webrtc ||
        this.webrtcSendChannel ||
        (this.$refs.videoPlayer && this.$refs.videoPlayer.srcObject)
      )
      if (!hasActiveStream) {
        return
      }
      this.isStopping = true
      console.debug('WebRTC Closing Connection')
      try {
        if (this.offerAbortController) {
          try {
            this.offerAbortController.abort()
          } catch (e) {}
          this.offerAbortController = null
        }
        if (this.webrtcSendChannel) {
          try {
            this.webrtcSendChannel.onclose = null
          } catch (e) {}
          try {
            this.webrtcSendChannel.close()
          } catch (e) {}
          this.webrtcSendChannel = null
        }
        if (this.webrtc) {
          this.webrtc.isClosed = true
          try {
            this.disableMicrophone()
          } catch (e) {}
          try {
            this.webrtc.ontrack = null
            this.webrtc.onnegotiationneeded = null
          } catch (e) {}
          this.webrtc.close()
          // see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/close
          this.audioTransceiver = null
          this.webrtc = null
        }
        this.resetVideoElement()
      } finally {
        this.isStopping = false
      }
    },
    startStream() {
      if (!this.inForeground || !this.src) {
        return
      }
      this.stopStream()
      const self = this
      const webrtc = new RTCPeerConnection({
        iceServers: [
          {
            urls: [self.stunServer || 'stun:stun.l.google.com:19302']
          }
        ],
        sdpSemantics: 'unified-plan'
      })
      webrtc.isClosed = false
      webrtc.ontrack = function (event) {
        console.debug(event.streams.length + ' track is delivered')
        self.$refs.videoPlayer.srcObject = event.streams[0]
      }
      // some cameras require streams to be sendrecv, despite the fact that we don't send video.
      // Since we don't send anything, it does not have any negative effects.
      webrtc.addTransceiver('video', { direction: 'sendrecv' })
      this.audioTransceiver = webrtc.addTransceiver('audio', { direction: 'sendrecv' })

      if (this.isMicOn) {
        // Try to enable microphone before/around negotiation
        this.enableMicrophone(webrtc, this.audioTransceiver)
      }
      webrtc.onnegotiationneeded = function handleNegotiationNeeded() {
        self.offerAbortController = new AbortController()
        // WebRTC lifecycle to create a live stream
        webrtc
          .createOffer()
          .then((offer) => webrtc.setLocalDescription(offer))
          .then(() => waitForCandidates(self.candidatesTimeout))
          .then(() => sendOffer())
          .then((answer) => {
            if (webrtc.isClosed || self.webrtc !== webrtc) {
              return
            }
            return webrtc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer }))
          })
          .catch((e) => console.warn(e))
          .finally(() => {
            if (self.offerAbortController) {
              self.offerAbortController = null
            }
          })

        // waits x amount of time for ICE candidates before resolving
        function waitForCandidates(timeout = 2000) {
          return new Promise((resolve, reject) => {
            let timer = null
            if (timeout > 0) {
              timer = setTimeout(() => {
                resolve()
              }, timeout)
            }
            // ICE is complicated
            // see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/canTrickleIceCandidates
            webrtc.addEventListener('icegatheringstatechange', (e) => {
              if (e.target.iceGatheringState === 'complete') {
                resolve()
                if (timer) {
                  clearTimeout(timer)
                }
              }
            })
          })
        }
        // Sends our SDP offer to the remote server, expects a SDP answer back
        function sendOffer() {
          console.debug('Offer: ', webrtc.localDescription.sdp)
          return new Promise((resolve, reject) => {
            fetch(self.src, {
              method: 'POST',
              signal: self.offerAbortController ? self.offerAbortController.signal : undefined,
              body: new URLSearchParams({
                data: btoa(webrtc.localDescription.sdp)
              })
            })
              .then((response) => response.text())
              .then((data) => {
                if (webrtc.isClosed || self.webrtc !== webrtc) {
                  reject(new Error('WebRTC connection already closed'))
                  return
                }
                const answer = atob(data)
                console.debug('Answer: ', answer)
                resolve(answer)
              })
              .catch((e) => reject(e))
          })
        }
      }
      // creates a channel needed by nest(?) cameras, we also use this to restart streams if closed
      const webrtcSendChannel = webrtc.createDataChannel('dataSendChannel')
      this.webrtcSendChannel = webrtcSendChannel
      webrtcSendChannel.onclose = (_event) => {
        console.debug(`${webrtcSendChannel.label} has closed`)
        // if we did not close this, restart the stream
        if (!webrtc.isClosed && this.webrtc === webrtc && !this.isStopping) {
          console.warn(`${webrtcSendChannel.label} closed prematurely, restarting`)
          self.startStream()
        }
      }
      this.webrtc = webrtc
    },
    toggleMic() {
      this.isMicOn = !this.isMicOn
      if (!this.webrtc) {
        // If no connection yet, start it so microphone state can apply during negotiation
        if (this.inForeground && this.src) {
          this.startStream()
        }
        return
      }
      if (this.isMicOn) {
        this.enableMicrophone(this.webrtc, this.audioTransceiver)
      } else {
        this.disableMicrophone()
      }
    },
    async enableMicrophone(webrtc, audioTransceiver) {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          f7.dialog.alert(
            'To enable the microphone, please make sure that HTTPS is in use and WebRTC is supported by this browser, including microphone access.'
          )
          return
        }
        // If already enabled, do nothing
        if (this.localAudioStream && this.localAudioStream.getAudioTracks().some((t) => t.enabled)
            && audioTransceiver && audioTransceiver.sender && audioTransceiver.sender.track) {
          return
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.localAudioStream = stream
        const [audioTrack] = stream.getAudioTracks()
        if (!audioTrack) return
        if (audioTransceiver && audioTransceiver.sender) {
          await audioTransceiver.sender.replaceTrack(audioTrack)
        } else if (webrtc) {
          webrtc.addTrack(audioTrack, stream)
        }
      } catch (e) {
        console.warn('Failed to enable microphone:', e)
        f7.dialog.alert('Microphone could not be enabled: ' + (e.message || 'Unknown error'))
      }
    },
    disableMicrophone() {
      try {
        if (this.audioTransceiver && this.audioTransceiver.sender) {
          this.audioTransceiver.sender.replaceTrack(null)
        }
        if (this.localAudioStream) {
          this.localAudioStream.getTracks().forEach((t) => {
            try {
              t.stop()
            } catch (e) {}
          })
          this.localAudioStream = null
        }
      } catch (e) {
        console.warn('Failed to disable microphone:', e)
      }
    },
    startForegroundActivity() {
      this.startStream()
    },
    stopForegroundActivity() {
      this.stopStream()
    }
  }
}
</script>

<style lang="stylus" scoped>
.oh-video-wrapper
  position relative

.oh-video-mic
  position absolute
  top 8px
  right 8px
  z-index 2
  display inline-flex
  align-items center
  justify-content center
  width 36px
  height 36px
  border none
  border-radius 18px
  background var(--f7-card-bg-color)
  box-shadow 0 1px 3px rgba(0,0,0,0.2)
  cursor pointer
  opacity 0.8
  transition opacity .15s ease, background-color .15s ease, color .15s ease
  &:hover
    opacity 1
  &.active
    background var(--f7-color-red)
    i.material-icons
      color #fff
  i.material-icons
    font-size 20px
    color var(--f7-text-color)
</style>
