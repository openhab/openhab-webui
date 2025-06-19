<template>
  <f7-popup :opened="false" @popup:closed="onClosed" :backdrop="true" :animate="false" :closeOnEscape="true" :push="false" :closeByBackdropClick="true" class="popup-media">
    <f7-view class="view-sheet-modal" url="/mediabrowser/" :animate="false" >
        <f7-page>
          <media-browser  @navigate="onNavigate" />
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
  },
  data () {
    return {
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
