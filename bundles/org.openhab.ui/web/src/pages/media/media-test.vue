<template>
  <f7-page class="media-test">
    
    <f7-button color="blue"   @click.stop="mediaChange()"   :href="mediaBrowserUri">
      Open Media Browser
    </f7-button>
 </f7-page>
</template>


<script>
export default {
  computed: {
    mediaBrowserUri () {
        return "/mediapopup/";
      }
    }
  }
</script>
