<template>
  <video
    ref="videoPlayer"
    :autoplay="this.startManually ? false : true"
    :controls="this.hideControls ? false : true"
    :poster="computedPosterUrl"
    playsinline
    style="max-width: 100%">
    Sorry, your browser doesn't support embedded videos.
  </video>
</template>

<script>
import foregroundService from '../widget-foreground-service'

export default {
  mixins: [foregroundService],
  name: 'OhVideoWebRTC',
  props: {
    src: { type: String },
    stunServer: { type: String },
    candidatesTimeout: { type: Number },
    startManually: { type: Boolean },
    hideControls: { type: Boolean },
    posterURL: { type: String }
  },
  data () {
    return {
      webrtc: null
    }
  },
  watch: {
    src (value) {
      this.startStream()
    }
  },
  computed: {
    computedPosterUrl () {
      const ts = (new Date()).toISOString()
      return this.posterURL ? this.posterURL.indexOf('?') === -1 ? `${this.posterURL}?_ts=${ts}` : `${this.posterURL}&_ts=${ts}` : this.posterURL
    }
  },
  methods: {
    stopStream () {
      console.debug('WebRTC Closing Connection')
      if (this.webrtc) {
        this.webrtc.isClosed = true
        this.webrtc.close()
        // see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/close
        this.webrtc = null
      }
    },
    startStream () {
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
      webrtc.addTransceiver('video', { direction: 'sendrecv' })
      webrtc.addTransceiver('audio', { direction: 'sendrecv' })
      webrtc.onnegotiationneeded = function handleNegotiationNeeded () {
        // WebRTC lifecycle to create a live stream
        webrtc.createOffer()
          .then((offer) => webrtc.setLocalDescription(offer))
          .then(() => waitForCandidates(self.candidatesTimeout))
          .then(() => sendOffer())
          .then((answer) => webrtc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer })))
          .catch((e) => console.warn(e))

        // waits x amount of time for ICE candidates before resolving
        function waitForCandidates (timeout = 2000) {
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
        function sendOffer () {
          console.debug('Offer: ', webrtc.localDescription.sdp)
          return new Promise((resolve, reject) => {
            fetch(self.src, {
              method: 'POST',
              body: new URLSearchParams({
                data: btoa(webrtc.localDescription.sdp)
              })
            })
              .then((response) => response.text())
              .then((data) => {
                const answer = atob(data)
                console.debug('Answer: ', answer)
                resolve(answer)
              }).catch((e) => reject(e))
          })
        }
      }
      // creates a channel needed by nest(?) cameras, we also use this to restart streams if closed
      const webrtcSendChannel = webrtc.createDataChannel(
        'dataSendChannel'
      )
      webrtcSendChannel.onclose = (_event) => {
        console.debug(`${webrtcSendChannel.label} has closed`)
        // if we did not close this, restart the stream
        if (!webrtc.isClosed) {
          console.warn(`${webrtcSendChannel.label} closed prematurely, restarting`)
          self.startStream()
        }
      }
      this.webrtc = webrtc
    },
    startForegroundActivity () {
      this.startStream()
    },
    stopForegroundActivity () {
      this.stopStream()
    }
  }
}
</script>
