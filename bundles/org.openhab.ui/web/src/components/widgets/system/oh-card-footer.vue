<template>
  <f7-card-footer v-if="texts && !Array.isArray(texts)">
    {{ texts }}
  </f7-card-footer>
  <f7-card-footer v-else-if="texts && Array.isArray(texts)">
    <span v-for="text in texts" :key="text">
      {{ text }}
    </span>
  </f7-card-footer>
</template>

<script>
export default {
  props: ['texts']
}
</script>
