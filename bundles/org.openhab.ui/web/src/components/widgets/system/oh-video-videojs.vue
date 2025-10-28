<template>
  <video
    ref="videoPlayer"
    class="video-js vjs-fluid"
    :poster="computedPosterUrl">
    Sorry, your browser doesn't support embedded videos.
  </video>
</template>

<script>
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

export default {
  name: 'OhVideoVideojs',
  props: {
    src: { type: String },
    type: { type: String },
    config: { type: Object },
    startManually: { type: Boolean },
    hideControls: { type: Boolean },
    posterURL: { type: String }
  },
  data () {
    return {
      player: null
    }
  },
  watch: {
    src (value) {
      if (this.player) {
        this.player.src({ type: this.type, src: this.src })
      }
    }
  },
  computed: {
    computedPosterUrl () {
      const ts = (new Date()).toISOString()
      return this.posterURL ? this.posterURL.indexOf('?') === -1 ? `${this.posterURL}?_ts=${ts}` : `${this.posterURL}&_ts=${ts}` : this.posterURL
    }
  },
  mounted () {
    this.createPlayer()
  },
  beforeUnmount () {
    if (this.player) {
      this.player.dispose()
    }
  },
  methods: {
    createPlayer () {
      if (this.player) {
        this.player.dispose()
      }
      const playerOpts = Object.assign({}, {
        liveui: true,
        autoplay: this.startManually ? false : 'muted',
        controls: !this.hideControls
      }, this.config || {})
      this.player = videojs(
        this.$refs.videoPlayer,
        playerOpts
      )
      if (this.src) {
        this.player.src({ type: this.type, src: this.src })
      }
    }
  }
}
</script>
