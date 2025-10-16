<template>
  <f7-link v-if="iconVisible && runtimeStore.showDeveloperDock" icon-f7="question_circle_fill" @click="f7.emit('toggleDeveloperDock')" />
  <f7-link v-else-if="iconVisible" icon-f7="question_circle" @click="f7.emit('selectDeveloperDock', { dock: 'help', helpTab: 'current' })" />
</template>

<script>
import { f7 } from 'framework7-vue'
import { useUserStore } from '@/js/stores/useUserStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { mapStores } from 'pinia'

export default {
  setup () {
    return {
      f7
    }
  },
  computed: {
    iconVisible () {
      return useUserStore().isAdmin() && this.$f7dim.width >= 1280
    },
    ...mapStores(useRuntimeStore)
  }
}
</script>
