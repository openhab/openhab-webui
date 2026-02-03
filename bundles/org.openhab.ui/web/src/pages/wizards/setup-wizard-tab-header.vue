<template>
  <f7-block class="sticky-header">
    <div class="tab-header-row">
      <f7-link
        v-if="prev"
        icon-ios="f7:arrow_left"
        icon-aurora="f7:arrow_left"
        icon-md="material:arrow_back"
        color="blue"
        @click="$emit('back')" />
      <span v-else class="tab-header-spacer" aria-hidden="true"></span>
      <f7-link
        icon-ios="f7:xmark"
        icon-aurora="f7:xmark"
        icon-md="material:close"
        color="blue"
        @click="$emit('close')" />
    </div>
    <f7-login-screen-title>
      <div class="compact-padding" v-if="image">
        <img class="intro-logo" :src="image" type="image/svg+xml" />
      </div>
      <div class="compact-padding" v-else-if="icon">
        <f7-icon size="48" color="blue" :f7="icon" />
      </div>
      {{ title }}
    </f7-login-screen-title>
  </f7-block>
  <f7-block v-if="header || link" strong>
      <span class="text" v-html="header" />
      <a v-if="link" class="text-color-blue external" target="_blank" :href="link">
          {{ t('setupwizard.' + step + '.link') }}</a
      >
  </f7-block>
</template>

<style lang="stylus">
.setup-wizard
  .tab-header-row
    display flex
    align-items center
    justify-content space-between
  .tab-header-spacer
    width 24px
    height 24px
  .compact-padding
    padding-top 0.1rem
    padding-bottom 0.5rem
  .sticky-header
    position sticky
    top 0
    z-index 10
    background var(--f7-page-bg-color)
</style>

<script>
export default {
  props: {
    icon: String,
    image: String,
    title: String,
    prev: Object,
    step: String,
    link: String,
    t: Function
  },
  emits: ['back', 'close'],
  computed: {
    header () {
      if (!this.step) return null
      const line1 = this.t('setupwizard.' + this.step + '.header1')
      const line2 = this.t('setupwizard.' + this.step + '.header2')
      const line3 = this.t('setupwizard.' + this.step + '.header3')
      const hasLine1 = line1 !== 'setupwizard.' + this.step + '.header1'
      const hasLine2 = line2 !== 'setupwizard.' + this.step + '.header2'
      const hasLine3 = line3 !== 'setupwizard.' + this.step + '.header3'
      if (!hasLine1 && !hasLine2 && !hasLine3) return null
      return (hasLine1 ? line1 : '') + (hasLine2 ? '<br>' + line2 : '') + (hasLine3 ? '<br>' + line3 : '') + '<br /><br />'
    },
  }
}
</script>
