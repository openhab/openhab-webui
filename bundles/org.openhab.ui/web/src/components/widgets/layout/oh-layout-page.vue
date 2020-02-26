<template>
  <div class="margin-top">
    <oh-block v-for="(component, idx) in context.component.slots.default"
      :key="idx"
      :context="childContext(component)"
      v-on="$listeners"
      style="z-index: 5000 !important"
    ></oh-block>
    <f7-block v-if="context.editmode">
      <f7-list>
        <f7-list-button color="blue" @click="$emit('add-block', context.component)">Add Block</f7-list-button>
        <f7-list-button v-if="!context.component.slots.masonry || !context.component.slots.masonry.length" color="blue" @click="$emit('add-masonry', context.component)">Add Masonry</f7-list-button>
      </f7-list>
      <!-- <f7-button color="blue" icon-f7="squares_below_rectangle" large round raised text="Add Block" @click="$emit('add-block', context.component)"></f7-button> -->
    </f7-block>
    <f7-block v-if="context.component.slots.masonry && context.component.slots.masonry.length">
      <oh-masonry
        :context="childContext(context.component.slots.masonry[0])"
        v-on="$listeners" />
    </f7-block>
  </div>
</template>

<style lang="stylus">
</style>

<script>
import mixin from '../widget-mixin'
import OhBlock from './oh-block.vue'
import OhMasonry from './oh-masonry.vue'

export default {
  mixins: [mixin],
  components: {
    OhBlock,
    OhMasonry
  }
}
</script>
