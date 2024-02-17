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
                  <f7-list-item v-for="step in instruct.steps" :key="step.title" :link="step.link" :title="step.title">
                    <div class="item-text" v-html="step.text" />
                  </f7-list-item>
                  <f7-list-button v-if="instruct.button" :external="true" :title="instruct.button.title" :href="$store.state.websiteUrl + '/' + instruct.button.link" target="_blank" />
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
            <f7-list-item class="faq-title" accordion-item v-for="faq in faqs" :key="faq.title" :title="faq.title">
              <f7-accordion-content>
                <f7-block>
                  <p v-if="faq.goto">
                    In the left panel go to <f7-link :href="faq.goto.target">
                      {{ faq.goto.text }}
                    </f7-link>
                  </p>
                  <p v-html="faq.text" />
                  <p v-if="faq.doclink">
                    <f7-link external target="_blank" :href="$store.state.websiteUrl + '/' + faq.doclink">
                      Full Help Docs
                    </f7-link>
                  </p>
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
            <f7-list-item v-for="addon in addons" :key="addon.uid" :link="addon.link.replace('https://www.openhab.org', $store.state.websiteUrl)" :external="true" target="_blank" :title="addon.label.replaceAll(/Binding|Transformation|Persistence/gi,'')" :text="addon.type" />
          </f7-list>
        </f7-block>
      </div>

      <div v-else-if="activeHelpTab === 'current'">
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal" medium>
            Page Help
          </f7-block-title>
        </f7-block>

        <!-- script editor docs -->
        <context v-if="/\/settings\/(scripts\/[A-z0-9]+|rules\/[A-z0-9]+\/script)/.test($store.state.pagePath)" path="/settings/script-editor" />
        <!-- /settings/* docs -->
        <context v-else-if="($store.state.pagePath) === '/settings/'" path="/settings/index" />
        <context v-else-if="/\/settings\/[A-z]+/.test($store.state.pagePath)" :path="/(\/[A-z]+\/[A-z]+)/.exec($store.state.pagePath)[0]" />
        <!-- /addons/ docs -->
        <context v-else-if="($store.state.pagePath).indexOf('/addons/') >= 0" path="/addons" />
        <!-- /developer/* docs -->
        <context v-else-if="($store.state.pagePath) === '/developer/'" path="/developer/index" />
        <context v-else-if="($store.state.pagePath).indexOf('/developer/widgets') >= 0" path="/developer/widgets" />
        <!-- /about/ docs -->
        <context v-else-if="($store.state.pagePath).indexOf('/about/') >= 0" path="/about" />
        <!-- default docs -->
        <context v-else path="/index" />

        <f7-block class="no-padding no-margin">
          <f7-block-title class="padding-horizontal" medium>
            More Help
          </f7-block-title>
        </f7-block>
        <f7-block>
          You can find many more details and help at these resources:
          <ul>
            <li><f7-link external target="_blank" href="https://www.openhab.org/" v-t="'about.homePage'" /></li>
            <li><f7-link external target="_blank" :href="`${$store.state.websiteUrl}/link/docs`" v-t="'about.documentation'" /></li>
            <li><f7-link external :href="`${$store.state.websiteUrl}/link/tutorial`" target="_blank" v-t="'home.overview.button.tutorial'" /></li>
            <li><f7-link external target="_blank" href="https://community.openhab.org/" v-t="'about.communityForum'" /></li>
          </ul>
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
  --f7-list-item-text-max-lines 4

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
  color: #2196f3

.link-item-icon
  color: #4cd964

.chevron-icon
  color: #2196f3

.faq-title .item-title
  white-space: normal !important
</style>

<script>
import { loadLocaleMessages } from '@/js/i18n'
import Context from '@/components/developer/help/context.vue'

export default {
  components: {
    Context
  },
  props: ['activeHelpTab'],
  data () {
    return {
      addons: [],
      faqs: require('@/assets/definitions/help/help-faq-defs.json'),
      qstart: require('@/assets/definitions/help/help-qstart-defs.json')
    }
  },
  created () {
    this.$oh.api.get('/rest/addons').then(data => {
      this.addons = data.filter(addon => addon.installed).sort((a, b) => a.label.toUpperCase().localeCompare(b.label.toUpperCase()))
    }).catch((err) => {
      // sometimes we get 502 errors ('Jersey is not ready yet!'), keep trying
      if (err === 'Bad Gateway' || err === 502) {
        console.log('Error while accessing the API, retrying every 5 seconds: ', err)
        setTimeout(this.load, 5000)
      }
    })
  },
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/about'))
  }
}
</script>
