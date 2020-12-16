<template>
  <div class="player">
    <video ref="videoPlayer" class="video-js vjs-fluid">
      Sorry, your browser doesn't support embedded videos.
    </video>
  </div>
</template>

<style lang="stylus"></style>

<script>
import videojs from "video.js";
import "video.js/dist/video-js.css";
import mixin from "../widget-mixin";
import { OhVideoDefinition } from "@/assets/definitions/widgets/system";

export default {
  mixins: [mixin],
  widget: OhVideoDefinition,
  data() {
    return {
      t: this.$utils.id(),
      src: null,
      player: null,
    };
  },
  watch: {
    itemState(value) {
      if (value) {
        this.loadItemURL();
      }
    },
  },
  computed: {
    itemState() {
      if (this.config.item)
        return (
          this.$utils.id() + "|" + this.context.store[this.config.item].state
        );
      return null;
    },
  },
  mounted() {
    console.log("Mounted oh-video");
    if (this.config.item) {
      this.loadItemURL();
    } else {
      this.src = this.config.url;
      this.createPlayer()
    }
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
  methods: {
    createPlayer() {
      console.log("Creating player for source: " + this.src )
      if (this.player) {
        this.player.dispose();
      }
      const playerOpts = {
        liveui: true,
        autoplay: this.config.startManually ? false : "muted",
        controls: !this.config.hideControls,
        sources: [
          {
            src: this.src,
            type: this.config.type,
          },
        ],
      }
      this.player = videojs(
        this.$refs.videoPlayer,
        playerOpts,
        function onPlayerReady() {
          console.log("onPlayerReady", this);
        }
      );
    },
    loadItemURL() {
      this.$oh.api
        .getPlain(`/rest/items/${this.config.item}/state`, "text/plain")
        .then((data) => {
          this.src = data;
          this.createPlayer()
        });
    },
  },
};
</script>
