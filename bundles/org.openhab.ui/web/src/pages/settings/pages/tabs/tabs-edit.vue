<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="tabs-editor">
    <f7-navbar :title="!ready ? '' : ((createMode ? 'Create tabbed page' : page.config.label) + dirtyIndicator)" back-link="Back" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-tabs class="tabs-editor-tabs">
      <f7-tab id="design" class="tabs-editor-design-tab" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <f7-block class="block-narrow" v-if="ready && !previewMode">
          <page-settings :page="page" :createMode="createMode" />
        </f7-block>

        <f7-block class="block-narrow" style="padding-bottom: 8rem" v-if="ready">
          <f7-col>
            <f7-block-title>Tabs</f7-block-title>
            <f7-menu v-if="clipboardType === 'oh-tab'">
              <f7-menu-item style="margin-left: auto" icon-f7="squares_below_rectangle" dropdown>
                <f7-menu-dropdown right>
                  <f7-menu-dropdown-item @click="pasteWidget(page, null)" href="#" text="Paste" />
                </f7-menu-dropdown>
              </f7-menu-item>
            </f7-menu>

            <f7-list media-list class="tabs-list">
              <f7-list-item media-item v-for="(tab, idx) in page.slots.default" :key="idx"
                            :title="tabEvaluateExpression(tab, idx, 'title')" :subtitle="tab.config.page"
                            link="#" @click.native="(ev) => configureTab(ev, tab, context)">
                <oh-icon slot="media" :icon="tabEvaluateExpression(tab, idx, 'icon')" :color="'gray'" :width="32" :height="32" />
                <f7-menu slot="content-start" class="configure-layout-menu">
                  <f7-menu-item icon-f7="list_bullet" dropdown>
                    <f7-menu-dropdown>
                      <f7-menu-dropdown-item @click="configureWidget(tab, { component: page })" href="#" text="Configure Tab" />
                      <f7-menu-dropdown-item @click="editWidgetCode(tab, { component: page })" href="#" text="Edit YAML" />
                      <f7-menu-dropdown-item divider />
                      <f7-menu-dropdown-item @click="cutWidget(tab, { component: page })" href="#" text="Cut" />
                      <f7-menu-dropdown-item @click="copyWidget(tab, { component: page })" href="#" text="Copy" />
                      <f7-menu-dropdown-item divider />
                      <f7-menu-dropdown-item @click="moveWidgetUp(tab, { component: page })" href="#" text="Move Up" />
                      <f7-menu-dropdown-item @click="moveWidgetDown(tab, { component: page })" href="#" text="Move Down" />
                      <f7-menu-dropdown-item divider />
                      <f7-menu-dropdown-item @click="removeWidget(tab, { component: page })" href="#" text="Remove Tab" />
                    </f7-menu-dropdown>
                  </f7-menu-item>
                </f7-menu>
              </f7-list-item>
              <f7-list-button color="blue" title="Add tab" @click="addWidget(page, 'oh-tab')" />
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>

      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'" class="page-code-editor" mode="application/vnd.openhab.uicomponent+yaml;type=tabs" :value="pageYaml" @input="onEditorInput" />
        <!-- <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.tabs-editor
  .page-code-editor.vue-codemirror
    display block
    top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
    height calc(100% - 2*var(--f7-navbar-height))
    width 100%
  .tabs-list
    .item-link
      overflow inherit
      z-index inherit !important
  .yaml-message
    display block
    position absolute
    top 80%
    white-space pre-wrap
</style>

<script>
import PageDesignerMixin from '@/pages/settings/pages/pagedesigner-mixin'
import WidgetExpressionMixin from '@/components/widgets/widget-expression-mixin'

import YAML from 'yaml'

import { OhTabDefinition } from '@/assets/definitions/widgets/tabs'

import PageSettings from '@/components/pagedesigner/page-settings.vue'

const ConfigurableWidgets = { OhTabDefinition }

export default {
  mixins: [PageDesignerMixin, WidgetExpressionMixin],
  components: {
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'),
    PageSettings
  },
  props: ['createMode', 'uid'],
  data () {
    return {
      page: {
        uid: 'page_' + this.$f7.utils.id(),
        component: 'oh-tabs-page',
        config: {},
        tags: [],
        slots: { default: [] }
      }
    }
  },
  methods: {
    addWidget (component, widgetType, parentContext, slot) {
      if (!slot) slot = 'default'
      if (!component.slots) component.slots = {}
      if (!component.slots[slot]) component.slots[slot] = []
      if (widgetType) {
        component.slots[slot].push({
          component: widgetType,
          config: {
            title: 'New Tab',
            icon: 'f7:squares_below_rectangle'
          },
          slots: { default: [] }
        })
        this.forceUpdate()
      }
    },
    getWidgetDefinition (componentType) {
      const definition = Object.values(ConfigurableWidgets).find((wd) => typeof wd === 'function' && wd().name === componentType)
      if (!definition) return null
      return definition()
    },
    configureTab (ev, tab, context) {
      let el = ev.target
      ev.cancelBubble = true
      while (!el.classList.contains('media-item')) {
        if (el && el.classList.contains('menu')) return
        el = el.parentElement
      }
      this.context.editmode.configureWidget(tab, context)
    },
    tabEvaluateExpression (tab, idx, key) {
      return this.evaluateExpression('tab-' + idx + '-' + key, tab.config[key], this.context, tab.config.pageConfig)
    },
    toYaml () {
      this.pageYaml = YAML.stringify({
        config: this.page.config,
        tabs: this.page.slots.default
      })
    },
    fromYaml () {
      try {
        const updatedPage = YAML.parse(this.pageYaml)
        this.$set(this.page, 'config', updatedPage.config)
        this.$set(this.page.slots, 'default', updatedPage.tabs)
        this.forceUpdate()
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
