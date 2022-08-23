<template>
  <div class="player">
    <oh-video-webrtc
      v-if="config.playerType === 'webrtc'"
      :src="src"
      :stunServer="config.stunServer"
      :candidatesTimeout="config.candidatesTimeout"
      :startManually="config.startManually"
      :hideControls="config.hideControls"
      :posterURL="config.posterURL" />
    <oh-video-videojs
      v-else
      :src="src"
      :type="config.type"
      :config="config.videoOptions"
      :startManually="config.startManually"
      :hideControls="config.hideControls"
      :posterURL="config.posterURL" />
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
  data () {
    return {
      t: this.$utils.id(),
      src: null
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
  },
  methods: {
    loadItemURL () {
      this.$oh.api
        .getPlain(`/rest/items/${this.config.item}/state`, 'text/plain')
        .then((data) => {
          this.src = data
        })
    }
  }
}
</script>
