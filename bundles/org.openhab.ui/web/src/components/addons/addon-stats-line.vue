<template>
  <span v-if="addon.properties" class="addon-stats-line">
    <span v-if="addon.properties.like_count >= 0">
      <f7-icon f7="heart_fill" :size="iconSize" />
      {{ addon.properties.like_count }}
    </span>
    <span v-if="addon.properties.views >= 0">
      <f7-icon f7="eye_fill" :size="iconSize" />
      {{ addon.properties.views }}
    </span>
    <span v-if="addon.properties.posts_count >= 0">
      <f7-icon f7="chat_bubble_fill" :size="iconSize" />
      {{ addon.properties.posts_count }}
    </span>
  </span>
</template>

<style lang="stylus">
.addon-stats-line
  white-space nowrap
  & > span
    margin-right 4px
</style>

<script>
export default {
  props: {
    addon: Object,
    iconSize: [String, Number]
  }
}
</script>
