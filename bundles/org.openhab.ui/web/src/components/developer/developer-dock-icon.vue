<template>
  <span v-if="developerIconVisible || logIconVisible" class="dev-dock-icons">
    <!-- Developer dock icon: follows width + admin rules -->
    <f7-link
      v-if="developerIconVisible && runtimeStore.showDeveloperDock"
      icon-f7="question_circle_fill"
      @click="f7.emit('toggleDeveloperDock' as Framework7Events)"
      tooltip="Developer dock (Shift+Alt+D)" />
    <f7-link
      v-else-if="developerIconVisible"
      icon-f7="question_circle"
      @click="f7.emit('selectDeveloperDock' as Framework7Events, { dock: 'help', helpTab: 'current' })"
      tooltip="Developer dock (Shift+Alt+D)" />

    <!-- Log viewer dock toggle (admin-only, hidden on the log-viewer page) -->
    <f7-link
      v-if="logIconVisible && runtimeStore.showLogDock"
      icon-f7="square_list_fill"
      @click="f7.emit('toggleLogDock' as Framework7Events)"
      tooltip="Log viewer (Shift+Alt+L)" />
    <f7-link
      v-else-if="logIconVisible"
      icon-f7="square_list"
      @click="f7.emit('toggleLogDock' as Framework7Events)"
      tooltip="Log viewer (Shift+Alt+L)" />
  </span>
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

const developerIconVisible = computed(() => {
  return userStore.isAdmin() && proxy.$f7dim.width >= 1280
})

const logIconVisible = computed(() => {
  return userStore.isAdmin() && !isOnLogViewerPage.value
})

const isOnLogViewerPage = computed(() => {
  const p = (runtimeStore.pagePath || '').replace(/\?.*$/, '')
  return p.startsWith('/developer/log-viewer')
})
</script>

<style scoped>
.dev-dock-icons {
  display: inline-flex;
  margin-right: 8px;
}
</style>
