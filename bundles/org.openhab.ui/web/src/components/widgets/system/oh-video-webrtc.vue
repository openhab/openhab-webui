<template>
  <video
    ref="videoPlayer"
    :autoplay="this.startManually ? false : true"
    :controls="this.hideControls ? false : true"
    playsinline
    style="max-width: 100%">
    Sorry, your browser doesn't support embedded videos.
  </video>
</template>

<script>
export default {
  name: 'OhVideoWebRTC',
  props: {
    src: { type: String },
    stunServer: { type: String },
    startManually: { type: Boolean },
    hideControls: { type: Boolean }
  },
  data () {
    return {
      webrtc: null
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
      if (this.webrtc) {
        this.webrtc.isClosed = true
        this.webrtc.close()
        // see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/close
        this.webrtc = null
      }
    },
    startPlay (withTrickleIce = true) {
      this.closeConnection()
      if (!this.src) {
        return
      }
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
      webrtc.onconnectionstatechange = ev => {
        console.debug('onconnectionstatechange: ', webrtc.connectionState)
        // if our connection fails and the server doesn't advertise trickle ICE then restart witout trickle
        if (webrtc.connectionState === 'failed' && !webrtc.canTrickleIceCandidates && withTrickleIce) {
          self.startPlay(false)
        }
      }
      webrtc.ontrack = function (event) {
        console.debug(event.streams.length + ' track is delivered')
        self.$refs.videoPlayer.srcObject = event.streams[0]
      }
      webrtc.addTransceiver('video', { direction: 'sendrecv' })
      webrtc.addTransceiver('audio', { direction: 'sendrecv' })
      webrtc.onnegotiationneeded = function handleNegotiationNeeded () {
        webrtc.createOffer().then(offer => {
          webrtc.setLocalDescription(offer).then(() => {
            if (withTrickleIce) {
              sendOffer()
            } else {
              waitForCandidates()
            }
            function sendOffer () {
              console.debug('Offer: ', webrtc.localDescription.sdp)
              fetch(self.src, {
                method: 'POST',
                body: new URLSearchParams({
                  data: btoa(webrtc.localDescription.sdp)
                })
              })
                .then(response => response.text())
                .then(data => {
                  const answer = atob(data)
                  console.debug('Answer: ', answer)
                  try {
                    webrtc.setRemoteDescription(
                      new RTCSessionDescription({ type: 'answer', sdp: answer })
                    )
                  } catch (e) {
                    console.warn(e)
                  }
                })
            }
            function waitForCandidates () {
              // if the first offer did not support ICE, then wait for candiates to gather before sending offer
              // see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/canTrickleIceCandidates
              webrtc.addEventListener('icegatheringstatechange', (e) => {
                if (e.target.iceGatheringState === 'complete') {
                  sendOffer()
                }
              })
            }
          })
        })
      }
      // creates a channel needed by nest(?) cameras, we also use this to restart streams if closed
      const webrtcSendChannel = webrtc.createDataChannel(
        'dataSendChannel'
      )
      webrtcSendChannel.onclose = _event => {
        console.warn(`${webrtcSendChannel.label} has closed`)
        // if we did not close this, restart the stream
        if (!webrtc.isClosed) {
          self.startPlay()
        }
      }
      this.webrtc = webrtc
    }
  }
}
</script>
