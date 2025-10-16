<template>
  <f7-link
    v-if="iconVisible && runtimeStore.showDeveloperDock"
    icon-f7="question_circle_fill"
    @click="f7.emit('toggleDeveloperDock')" />
  <f7-link
    v-else-if="iconVisible"
    icon-f7="question_circle"
    @click="f7.emit('selectDeveloperDock', { dock: 'help', helpTab: 'current' })" />
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { f7 } from 'framework7-vue'
import { useUserStore } from '@/js/stores/useUserStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

const userStore = useUserStore()
const runtimeStore = useRuntimeStore()

const { proxy } = getCurrentInstance()

const iconVisible = computed(() => {
  return userStore.isAdmin() && proxy.$f7dim.width >= 1280
})
</script>
