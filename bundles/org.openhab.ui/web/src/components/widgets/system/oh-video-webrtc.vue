<template>
  <video
    ref="videoPlayer"
    :autoplay="this.startManually ? false : true"
    :controls="this.hideControls ? false : true"
    playsinline
    style="max-width: 100%; max-height: 100%;">
    Sorry, your browser doesn't support embedded videos.
  </video>
</template>

<script>
export default {
  name: 'OhVideoWebRTC',
  props: {
    src: { type: String },
    stunServer: { type: String },
    enableTrickleIce: { type: Boolean },
    startManually: { type: Boolean },
    hideControls: { type: Boolean }
  },
  data () {
    return {
      webrtc: null,
      isClosed: false // if we closed the webrtc stream
    }
  },
  watch: {
    src (value) {
      this.startPlay()
    }
  },
  mounted () {
    if (this.src) {
      this.startPlay()
    }
  },
  beforeDestroy () {
    this.closeConnection()
  },
  methods: {
    closeConnection () {
      this.isClosed = true
      if (this.webrtc) {
        this.webrtc.close()
      }
    },
    startPlay () {
      this.closeConnection()
      this.isClosed = false
      if (!this.src) {
        return
      }
      const self = this
      self.webrtc = new RTCPeerConnection({
        iceServers: [
          {
            urls: [self.stunServer || 'stun:stun.l.google.com:19302']
          }
        ],
        sdpSemantics: 'unified-plan'
      })
      self.webrtc.ontrack = function (event) {
        console.log(event.streams.length + ' track is delivered')
        self.$refs.videoPlayer.srcObject = event.streams[0]
        self.$refs.videoPlayer.play()
      }
      self.webrtc.addTransceiver('video', { direction: 'sendrecv' })
      self.webrtc.onnegotiationneeded = function handleNegotiationNeeded () {
        self.webrtc.createOffer().then(offer => {
          self.webrtc.setLocalDescription(offer).then(() => {
            if (self.enableTrickleIce) {
              postOffer()
            } else {
              let candidates = ''
              // theres not a good way to detect trickle ice support before we send our offer, so collect candiates manually
              // see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/canTrickleIceCandidates
              self.webrtc.addEventListener('icecandidate', (event) => {
                if (!event.candidate) {
                  postOffer(candidates)
                  return
                }
                candidates += `a=${event.candidate['candidate']} + \r\n`
              })
            }
          })
        })
      }

      function postOffer (candidates) {
        console.log('Offer: ', self.webrtc.localDescription.sdp)
        fetch(self.src, {
          method: 'POST',
          body: new URLSearchParams({
            data: btoa(self.webrtc.localDescription.sdp + (candidates || ''))
          })
        })
          .then(response => response.text())
          .then(data => {
            const answer = atob(data)
            console.log('Answer: ', answer)
            try {
              self.webrtc.setRemoteDescription(
                new RTCSessionDescription({ type: 'answer', sdp: answer })
              )
            } catch (e) {
              console.warn(e)
            }
          })
      }
      // creates a dummy channel to detect stream interuptions on media
      const webrtcSendChannel = this.webrtc.createDataChannel(
        'heartbeatchannel'
      )
      webrtcSendChannel.onopen = event => {
        console.log(`${webrtcSendChannel.label} has opened`)
        webrtcSendChannel.send('ping')
      }
      webrtcSendChannel.onclose = _event => {
        console.log(`${webrtcSendChannel.label} has closed`)
        // if we did not close this, restart the stream
        if (!self.isClosed) {
          this.startPlay()
        }
      }
    }
  }
}
</script>
