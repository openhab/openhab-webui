<template>
  <f7-page class="other-apps">
    <f7-navbar color="blue" :title="$t('home.otherApps')" />
    <f7-link v-for="app in apps" class="app-link" :key="app.url" :href="app.url" external target="_blank">
      <f7-card class="app-card">
        <f7-card-content :padding="false">
          <img :src="app.imageUrl" width="100%" />
        </f7-card-content>
        <f7-card-footer>
          <div class="app-card-name">
            {{ app.name }}
          </div>
        </f7-card-footer>
      </f7-card>
    </f7-link>
  </f7-page>
</template>

<style lang="stylus">
.other-apps
  background-color #333 !important
  .navbar-inner.navbar-inner-centered-title
    .title
      max-width none
  .app-link
    display block
  .app-card
    &:hover
      background-color rgba(255, 255, 255, 0.12) !important

    // background-color #333 !important
    .app-card-name
      width 100%
      text-align center
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as api from '@/api'

const apps = ref<api.Tile[]>([])

onMounted(async () => {
  try {
    const data = await api.getUiTiles()
    apps.value = data!
  } catch (error) {
    console.error('Failed to fetch apps:', error)
  }
})
</script>
