<script setup>
const props = defineProps({
  message: String,
});
</script>
<template>
  <div class="container">
    <span>{{ props.message }}</span>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 86vh;
  background-color: var(--color-internal-background);
  padding: 1rem;
}
.container span {
  background-color: var(--color-alert-text);
}
</style>
