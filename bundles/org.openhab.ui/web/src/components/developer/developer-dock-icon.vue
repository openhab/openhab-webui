<template>
  <f7-link
    v-if="iconVisible && runtimeStore.showDeveloperDock"
    icon-f7="question_circle_fill"
    @click="f7.emit('toggleDeveloperDock' as Framework7Events)" />
  <f7-link
    v-else-if="iconVisible"
    icon-f7="question_circle"
    @click="f7.emit('selectDeveloperDock' as Framework7Events, { dock: 'help', helpTab: 'current' })" />
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { f7 } from 'framework7-vue'
import { useUserStore } from '@/js/stores/useUserStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import type { Framework7Events } from '@/types/framework7-extensions'

const userStore = useUserStore()
const runtimeStore = useRuntimeStore()

const { proxy } = getCurrentInstance() as any

const iconVisible = computed(() => {
  return userStore.isAdmin() && proxy.$f7dim.width >= 1280
})
</script>
