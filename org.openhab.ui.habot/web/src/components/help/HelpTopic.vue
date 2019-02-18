<template>
  <q-card class="help-topic">
    <q-card-title>
      {{title}}
      <span slot="subtitle">{{subtitle}}</span>
    </q-card-title>
    <q-card-actions>
      <q-btn flat color="secondary" icon="play_arrow" @click="$emit('launch', topic)" label="View" />
    </q-card-actions>
  </q-card>
</template>

<style lang="stylus" scoped>
.help-topic
  margin 10px
  max-width 480px
  // height 100px
</style>

<script>
export default {
  props: ['title', 'subtitle', 'topic']
}
</script>
