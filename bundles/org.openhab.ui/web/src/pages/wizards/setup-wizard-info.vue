<template>
  <tab-header :icon="icon" :title="t('setupwizard.' + step + '.title')" :step="step" :t="t" />
  <f7-login-screen-title>
    <div class="padding">
      <img style="width: 85%" :src="image" />
    </div>
  </f7-login-screen-title>
  <f7-block>
    {{ body }}
    <br /><br />
    <a class="text-color-blue external" target="_blank" :href="link"> {{ t('setupwizard.documentationLink') }}</a>
    <br /><br />
    {{ t('setupwizard.' + step + '.nextDescription') }}
  </f7-block>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  props: {
    step: String,
    icon: String,
    image: String,
    link: String,
    t: Function
  },
  components: {
    'tab-header': defineAsyncComponent(() => import('./setup-wizard-tab-header.vue'))
  },
  computed: {
    body () {
      if (!this.step) return null
      let body = ''
      let index = 1
      while (true) {
        const line = this.t('setupwizard.' + this.step + '.body' + index)
        const hasLine = line !== 'setupwizard.' + this.step + '.body' + index
        if (!hasLine) break
        body += line
        index++
      }
      return body
    },
  }
}
</script>
