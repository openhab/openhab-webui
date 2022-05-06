<template>
  <video
    ref="videoPlayer"
    :autoplay="this.startManually ? false : true"
    :controls="this.hideControls ? false : true"
    playsinline
    style="max-width: 100%; max-height: 100%;"
  >
    Sorry, your browser doesn't support embedded videos.
  </video>
</template>

<script>

export default {
  name: 'OhVideoWebRTC',
  props: {
    src: { type: String },
    config: { type: Object },
    startManually: { type: Boolean },
    hideControls: { type: Boolean }
  },
  data () {
    return {
      webrtc: null,
      isClosed: false //if we closed the webrtc stream
    }
  },
  watch: {
    src (value) {
      this.startPlay();
    }
  },
  mounted () {
    if (this.src) {
      this.startPlay();
    }
  },
  beforeDestroy () {
    this.closeConnection();
  },
  methods: {
    closeConnection () {
      this.isClosed = true;
      if (this.webrtc) {
        this.webrtc.close();
      }
    },
    startPlay () {
      this.closeConnection();
      this.isClosed = false;
      const self = this;
      if (!self.src) {
        return;
      }
      self.webrtc = new RTCPeerConnection({
        iceServers: [{
          urls: ['stun:stun.l.google.com:19302']
        }],
        sdpSemantics: 'unified-plan'
      })
      self.webrtc.ontrack = function (event) {
        console.log(event.streams.length + ' track is delivered')
        self.$refs.videoPlayer.srcObject = event.streams[0]
        self.$refs.videoPlayer.play();
      }
      self.webrtc.addTransceiver('video', { direction: 'sendrecv' })
      self.webrtc.onnegotiationneeded = function handleNegotiationNeeded () {
        self.webrtc.createOffer().then(offer => {
          self.webrtc.setLocalDescription(offer).then(() => {
            console.log("Offer: ", self.webrtc.localDescription.sdp)
            fetch(self.src, {
              method: 'POST',
              body: new URLSearchParams({ data: btoa(self.webrtc.localDescription.sdp) })
            })
              .then(response => response.text())
              .then(data => {
                const answer = atob(data);
                console.log("Answer: ", answer);
                try {
                  self.webrtc.setRemoteDescription(
                    new RTCSessionDescription({ type: 'answer', sdp: answer })
                  )
                } catch (e) {
                  console.warn(e)
                }
              })
          })
        })
      }

      const webrtcSendChannel = this.webrtc.createDataChannel('rtsptowebSendChannel')
      webrtcSendChannel.onopen = (event) => {
        console.log(`${webrtcSendChannel.label} has opened`)
        webrtcSendChannel.send('ping')
      }
      webrtcSendChannel.onclose = (_event) => {
        console.log(`${webrtcSendChannel.label} has closed`)
        //if we did not close this, restart the stream
        if(!self.isClosed){
          startPlay()
        }
      }
      webrtcSendChannel.onmessage = event => console.log(event.data)
    }
  }
}
</script>
