<template>
  <f7-page class="other-apps">
    <f7-navbar color="blue" :title="$t('home.otherApps')" />
    <f7-link v-for="app in apps"
             class="app-link"
             :key="app.url"
             :href="app.url"
             external
             target="_blank">
      <f7-card class="app-card">
        <f7-card-content :padding="false">
          <img :src="app.imageUrl" width="100%">
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

<script>
export default {
  data () {
    return {
      apps: []
    }
  },
  created () {
    this.$oh.api.get('/rest/ui/tiles').then((data) => {
      this.apps = data
    })
  }
}
</script>

<style lang="stylus">
.other-apps {
  background-color: #333 !important;
  .app-link {
    display block
  }
  .app-card {
    &:hover {
      background-color: rgba(255, 255, 255, 0.12) !important;
    }

    // background-color #333 !important
    .app-card-name {
      width: 100%;
      text-align: center;
    }
  }
}
</style>
