<script setup>
import ErrorText from "../components/ErrorText.vue";
</script>

<template>
  <main>
    <ErrorText
      :message="'Audio capabilities are not supported, ensure you are accessing the page over https and that your browser have access to your audio devices.'"
    />
  </main>
</template>
