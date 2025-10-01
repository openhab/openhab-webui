<template>
  <div class="player">
    <oh-video-webrtc
      v-if="config.playerType === 'webrtc'"
      :src="src"
      :stunServer="config.stunServer"
      :candidatesTimeout="config.candidatesTimeout"
      :startManually="config.startManually"
      :startMuted="config.startMuted"
      :hideControls="config.hideControls"
      :posterURL="posterSrc"
      :sendAudio="config.sendAudio" />
    <oh-video-videojs
      v-else
      :src="src"
      :type="config.type"
      :config="config.videoOptions"
      :startMuted="config.startMuted"
      :startManually="config.startManually"
      :hideControls="config.hideControls"
      :posterURL="posterSrc" />
  </div>
</template>

<script>
import mixin from '../widget-mixin'
import { OhVideoDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhVideoDefinition,
  components: {
    'oh-video-videojs': () => import(/* webpackChunkName: "oh-video-videojs" */ './oh-video-videojs.vue'),
    'oh-video-webrtc': () => import(/* webpackChunkName: "oh-video-webrtc" */ './oh-video-webrtc.vue')
  },
  props: {
    sendAudio: { type: Boolean }
  },
  data () {
    return {
      t: this.$utils.id(),
      src: null,
      posterSrc: null
    }
  },
  watch: {
    itemState (value) {
      if (value) {
        this.loadItemURL()
      }
    }
  },
  computed: {
    itemState () {
      if (this.config.item) {
        return (
          this.$utils.id() + '|' + this.context.store[this.config.item].state
        )
      }
      return null
    }
  },
  mounted () {
    if (this.config.item) {
      this.loadItemURL()
    } else {
      this.src = this.config.url
    }
    if (this.config.posterItem) {
      this.loadPosterItemURL()
    } else {
      this.posterSrc = this.config.posterURL
    }
  },
  methods: {
    loadItemURL () {
      this.$oh.api
        .getPlain(`/rest/items/${this.config.item}/state`, 'text/plain')
        .then((data) => {
          this.src = data
        })
    },
    loadPosterItemURL () {
      this.$oh.api
        .getPlain(`/rest/items/${this.config.posterItem}/state`, 'text/plain')
        .then((data) => {
          this.posterSrc = data
        })
    }
  }
}
</script>
