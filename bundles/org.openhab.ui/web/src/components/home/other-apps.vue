<template>
  <f7-block class="block-narrow" v-show="apps && apps.length">
    <f7-row>
      <f7-col>
        <div class="row app-links">
          <div class="app-link col-50" v-for="app in apps" :key="app.url" :href="app.url.replace(/^\.\./, '')" external target="_blank">
            <f7-link class="app-link" :href="app.url.replace(/^\.\./, '')" external target="_blank">
              <f7-card class="app-card">
                <f7-card-content :padding="false" :style="{
                  'height': '200px',
                  'background-image': 'url(' + app.imageUrl.replace(/^\.\./, '') + ')',
                  'background-size': 'cover',
                  'background-repeat': 'no-repeat'
                }">
                </f7-card-content>
                <f7-card-footer>
                  <div class="app-card-name">{{app.name}}</div>
                </f7-card-footer>
              </f7-card>
            </f7-link>
          </div>
        </div>
      </f7-col>
    </f7-row>
  </f7-block>
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
