<template>
  <div class="row app-links">
    <f7-link class="app-link col-50 medium-33 large-33 xlarge-25" v-for="app in apps" :key="app.url" :href="app.url.replace(/^\.\./, '')" external target="_blank">
      <f7-card class="app-card">
        <f7-card-content :padding="false">
          <!-- <img :src="'res/img/dashboard-tiles-tmp/basicui.png'" width="100%"> -->
          <img :src="app.imageUrl.replace(/^\.\./, '')" width="100%">
        </f7-card-content>
        <f7-card-footer>
          <div class="app-card-name">{{app.name}}</div>
        </f7-card-footer>
      </f7-card>
    </f7-link>
  </div>
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
.app-links
  width 100% !important
  .app-link
    display block
  .app-card
    &:hover
      background-color #f5f5f5
    .app-card-name
      width 100%
      text-align center
.theme-dark
  .app-links
    .app-link
      .app-card
        &:hover
          background-color #343434
</style>
