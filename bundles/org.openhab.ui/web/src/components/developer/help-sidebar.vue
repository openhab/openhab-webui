<template>
  <f7-block class="help-sidebar">
    <div class="help-sidebar-content">
      <div v-if="activeHelpTab === 'quick'">
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal" medium>
            Quick Start
          </f7-block-title>
        </f7-block>
        <f7-block class="no-margin no-padding">
          <f7-list accordion-list>
            <f7-list-item v-for="instruct in qstart" :key="instruct.title" accordion-item :accordion-item-opened="instruct.opened" :title="instruct.title">
              <f7-accordion-content>
                <f7-list media-list>
                  <f7-list-item v-for="step in instruct.steps" :key="step.title" :link="step.link" :title="step.title" :text="step.text"></f7-list-item>
                  <f7-list-button v-if="instruct.button" :external="true" :title="instruct.button.title" :href="instruct.button.link" target="_blank"></f7-list-button>
                </f7-list>
              </f7-accordion-content>
            </f7-list-item>
          </f7-list>
        </f7-block>
      </div>

      <div v-else-if="activeHelpTab === 'faq'">
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal display-flex" medium>
            <span>How do I...</span>
          </f7-block-title>
        </f7-block>
        <f7-block class="no-margin no-padding">
          <f7-list accordion-list>
            <f7-list-item  accordion-item v-for="faq in faqs" :key="faq.title" :title="faq.title">
              <f7-accordion-content>
                <f7-block>
                  <p v-if="faq.goto">
                    In the left panel go to <f7-link :href="faq.goto.target">{{ faq.goto.text }}</f7-link>
                  </p>
                  <p v-html="faq.text"></p>
                  <p v-if="faq.doclink"><f7-link external target="_blank" :href="faq.doclink">Full Help Docs</f7-link></p>
                </f7-block>
              </f7-accordion-content>
            </f7-list-item>
          </f7-list>
        </f7-block>
      </div>

      <div v-else-if="activeHelpTab === 'binding'">
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal" medium>
            Add-on Docs
          </f7-block-title>
        </f7-block>
        <f7-block class="no-margin no-padding">
          <f7-list media-list>
            <f7-list-item v-for="addon in addons" :key="addon.uid" :link="addon.link" :external="true" target="_blank" :title="addon.label.replaceAll(/Binding|Transformation|Persistence/gi,'')" :text="addon.type"></f7-list-item>
          </f7-list>
        </f7-block>
      </div>

      <div v-else-if="activeHelpTab === 'current'">
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal" medium>
            Page Help
          </f7-block-title>
        </f7-block>
        <f7-block class="no-margin no-padding">
          <thing-context v-if="($store.state.pagePath).indexOf('things')>=0"/>
          <item-context v-if="($store.state.pagePath).indexOf('items')>=0"/>
          <model-context v-if="($store.state.pagePath).indexOf('model')>=0"/>
          <page-context v-if="($store.state.pagePath).indexOf('pages')>=0"/>
          <rule-context v-if="($store.state.pagePath).indexOf('rules')>=0 || ($store.state.pagePath).indexOf('scenes')>=0 || ($store.state.pagePath).indexOf('scripts')>=0 || ($store.state.pagePath).indexOf('schedule')>=0"/>
          <widget-context v-if="($store.state.pagePath).indexOf('widgets')>=0"/>
          <addon-context v-if="($store.state.pagePath).indexOf('addons')>=0"/>
          <default-context v-else/>
        </f7-block>
        <f7-block>
          <f7-block-title class="padding-horizontal" medium>
            More Help
          </f7-block-title>
          <p>You can find many more details and help at these resources</p>
          <p><f7-link external target="_blank" href="https://www.openhab.org/" v-t="'about.homePage'" /></p>
          <p><f7-link external target="_blank" href="https://www.openhab.org/docs/" v-t="'about.documentation'" /></p>
          <p><f7-link external target="_blank" href="https://community.openhab.org/" v-t="'about.communityForum'" /></p>
        </f7-block>
      </div>
    </div>

  </f7-block>
</template>

<style lang="stylus">
.help-sidebar
  scrollbar-width none /* Firefox */
  -ms-overflow-style none  /* IE 10+ */
  margin 0 !important
  padding 0
  width 100%

  .help-sidebar-content
    padding-top 0.3rem

  &.page
    background #e7e7e7 !important

  .page-content
    overflow-x hidden
.md .help-sidebar-content
  margin-top 0
.theme-dark
  .help-sidebar
    &.page
      background #232323 !important

.add-button-icon
  color: blue
</style>

<script>
import { loadLocaleMessages } from '@/js/i18n'
import ThingContext from './help/thing-context.vue'
import ItemContext from './help/item-context.vue'
import ModelContext from './help/model-context.vue'
import PageContext from './help/page-context.vue'
import RuleContext from './help/rule-context.vue'
import WidgetContext from './help/widget-context.vue'
import AddonContext from './help/addon-context.vue'
import DefaultContext from './help/default-context.vue'

export default {
  components: {
    ThingContext,
    ItemContext,
    ModelContext,
    PageContext,
    RuleContext,
    WidgetContext,
    AddonContext,
    DefaultContext
  },
  props: ['activeHelpTab'],
  data () {
    return {
      addons: []
    }
  },
  created () {
    this.faqs = require('./help/help-faq-defs.json')
    this.qstart = require('./help/help-qstart-defs.json')
    this.$oh.api.get('/rest/addons').then(data => {
      this.addons = data.filter(addon => addon.installed).sort((a, b) => a.label.toUpperCase().localeCompare(b.label.toUpperCase()))
    }).catch((err) => {
      // sometimes we get 502 errors ('Jersey is not ready yet!'), keep trying
      console.log('Error while accessing the API, retrying every 5 seconds: ', err)
      setTimeout(this.load, 5000)
    })
  },
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/about'))
  }
}
</script>
