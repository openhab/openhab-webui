<script setup>
import ErrorText from "../components/ErrorText.vue";
</script>

<template>
  <main>
    <ErrorText
      :message="'There was an unexpected error please check your logs and open an issue if needed.'"
    />
  </main>
</template>
