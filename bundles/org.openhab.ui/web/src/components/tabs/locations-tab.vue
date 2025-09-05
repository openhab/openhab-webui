<template>
  <model-tab type="locations" :page="context" />
</template>

<script>
import ModelTab from '@/pages/home/model-tab.vue'

export default {
  props: {
    context: Object
  },
  components: { ModelTab }
}
</script>
