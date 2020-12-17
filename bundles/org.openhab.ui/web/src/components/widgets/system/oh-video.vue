<template>
  <div class="player">
    <oh-video-videojs
      :src="src"
      :type="config.type"
      :config="config.videoOptions"
      :startManually="config.startManually"
      :hideControls="config.hideControls"
    />
  </div>
</template>

<script>
import mixin from '../widget-mixin'
import { OhVideoDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhVideoDefinition,
  components: {
    'oh-video-videojs': () => import(/* webpackChunkName: "oh-video-videojs" */ './oh-video-videojs.vue')
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
