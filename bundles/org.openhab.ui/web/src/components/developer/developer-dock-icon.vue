<template>
  <f7-link v-if="$store.state.developerDock && $f7.width >= 1280" icon-f7="question_circle_fill" @click="$f7.emit('toggleDeveloperDock')" />
  <f7-link v-else-if="$f7.width >= 1280" icon-f7="question_circle" @click="$f7.emit('selectDeveloperDock',{'dock':'help','helpTab':'current'})" />
</template>

<script>
export default {
}
</script>
