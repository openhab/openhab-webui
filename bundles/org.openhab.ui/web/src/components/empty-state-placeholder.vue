<template>
  <f7-block class="empty-state-placeholder text-color-gray">
    <f7-row>
      <f7-col>
        <f7-icon :f7="icon" size="64" color="gray"  />
        <h1>{{texts[title] || title}}</h1>
        <p v-html="texts[text] || text"></p>
      </f7-col>
    </f7-row>
  </f7-block>
</template>

<style lang="stylus">
.empty-state-placeholder
  margin-top 10vh !important
  text-align center
</style>

<script>
// TODO: i18n
import texts from '@/assets/i18n/en/empty-states.json'

export default {
  props: ['icon', 'title', 'text'],
  data () {
    return {
      texts
    }
  }
}
</script>
