<template>
  <video ref="videoPlayer" class="video-js vjs-fluid" :poster="computedPosterUrl">
    Sorry, your browser doesn't support embedded videos.
  </video>
</template>

<script>
import { markRaw } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

export default {
  name: 'OhVideoVideojs',
  props: {
    src: { type: String },
    type: { type: String },
    config: { type: Object },
    startManually: { type: Boolean },
    startMuted: { type: Boolean },
    hideControls: { type: Boolean },
    posterURL: { type: String }
  },
  data () {
    return {
      player: null
    }
  },
  watch: {
    src (newSrc, oldSrc) {
      if (this.player && newSrc !== oldSrc) {
        this.player.ready(() => {
          this.player.src({ type: this.type, src: newSrc })
          if (!this.startManually) {
            this.player.play().catch((e) => console.error('Play failed:', e))
          }
        })
      }
    }
  },
  computed: {
    computedPosterUrl () {
      if (this.posterURL && this.posterURL.startsWith('data:')) {
        return this.posterURL
      }
      const ts = (new Date()).toISOString()
      return this.posterURL ? this.posterURL.indexOf('?') === -1 ? `${this.posterURL}?_ts=${ts}` : `${this.posterURL}&_ts=${ts}` : this.posterURL
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.createPlayer()
    })
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
        autoplay: this.startManually ? false : (this.startMuted ? 'muted' : 'play'),
        muted: this.startMuted,
        controls: !this.hideControls
      }, this.config || {})
      this.player = markRaw(videojs(this.$refs.videoPlayer, playerOpts))
      this.player.ready(() => {
        if (this.src) {
          this.player.src({ type: this.type, src: this.src })
          if (!this.startManually) {
            this.player.play().catch((e) => console.error('Autoplay failed:', e))
          }
        }
      })
    }
  }
}
</script>
