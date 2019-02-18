<template>
  <q-item-separator :inset="this.model.config.inset" :class="{'highlight-and-fade': this.model.highlight}" />
</template>

<script>
export default {
  name: 'HbListSeparator',
  props: ['model']
}
</script>
