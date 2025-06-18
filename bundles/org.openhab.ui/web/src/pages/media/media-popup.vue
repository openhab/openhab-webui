<template>
  <f7-popup :opened="true" @popup:closed="onClosed" :backdrop="true" :animate="true" :closeOnEscape="true" :push="false" :closeByBackdropClick="true" class="media-popup" >
    <f7-view class="view-sheet-modal" url="/mediabrowser/" animate="false" >
        <f7-page>
          <media-browser :base-url="baseUrl"  @navigate="onNavigate" />
        </f7-page>
        </f7-view>
        </f7-popup>
</template>

<script>
import MediaBrowser from '@/pages/media/media-browser.vue'

export default {
  name: "MediaPopup",
  components: { MediaBrowser },
  props: {
      opened: {
      type: Boolean,
      required: false
    },
    baseUrl: { // base de l'url, par ex. "/media"
      type: String,
      default: "/mediabrowser"
    }
  },
  methods: {
    onClosed() {
      this.$emit('closed')
    },
    onNavigate(path) {
      console.log("Navigating to:", path);
      // Emit the navigate event to the parent component
       this.$emit('navigate', path)
    }
  }
};

</script>
