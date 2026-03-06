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
import { defineAsyncComponent } from 'vue'
import { f7 } from 'framework7-vue'

import { OhVideoDefinition } from '@/assets/definitions/widgets/system'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'

import OhVideoVideojs from './oh-video-videojs.vue'
import OhVideoWebrtc from './oh-video-webrtc.vue'

export default {
  widget: OhVideoDefinition,
  components: {
    OhVideoVideojs,
    OhVideoWebrtc,
  },
  props: {
    context: Object,
    sendAudio: { type: Boolean }
  },
  setup(props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  },
  data () {
    return {
      t: f7.utils.id(),
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
        return f7.utils.id() + '|' + this.context.store[this.config.item].state
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
