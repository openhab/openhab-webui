<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="(!ready) ? '' : (createMode) ? 'Create layout page' : page.config.label" back-link="Back" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'design'; fromYaml()" :tab-link-active="currentTab === 'design'" class="tab-link">Design</f7-link>
      <f7-link @click="currentTab = 'code'; toYaml()" :tab-link-active="currentTab === 'code'" class="tab-link">Code</f7-link>
    </f7-toolbar>
    <f7-toolbar bottom class="toolbar-details" v-show="currentTab === 'design'">
      <div style="margin-left: auto">
        <f7-toggle :value="previewMode" @toggle:change="(value) => previewMode = value.toString()"></f7-toggle> Preview
      </div>
    </f7-toolbar>
    <f7-tabs class="layout-editor-tabs">
      <f7-tab id="design" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader></f7-preloader>
          <div>Loading...</div>
        </f7-block>
        <f7-block class="block-narrow" v-if="ready && previewMode === 'false'">
          <f7-col>
            <f7-list inline-labels>
              <f7-list-input label="ID" type="text" placeholder="ID" :value="page.uid" @input="page.uid = $event.target.value"
                required validate pattern="[A-Za-z0-9_]+" error-message="Required. Alphanumeric &amp; underscores only" :disabled="!createMode">
              </f7-list-input>
              <f7-list-input label="Label" type="text" placeholder="Label" :value="page.config.label" @input="page.config.label = $event.target.value" clear-button>
              </f7-list-input>
              <f7-list-item title="Show on sidebar">
                <f7-toggle slot="after" :checked="page.config.sidebar" @toggle:change="page.config.sidebar = $event"></f7-toggle>
              </f7-list-item>
              <f7-list-input label="Sidebar order" type="number" placeholder="Assign order index to rearrange pages on sidebar" :value="page.config.order" @input="page.config.order = $event.target.value" clear-button>
              </f7-list-input>
            </f7-list>
          </f7-col>
        </f7-block>

        <oh-layout-page v-if="ready" :context="context" :key="pageKey"
          @add-block="addBlock"
          @add-masonry="addMasonry"
          @add-widget="addWidget"
          @configure-widget="configureWidget"
          @cut-widget="cutWidget"
          @copy-widget="copyWidget"
          @paste-widget="pasteWidget"
          @move-widget-up="moveWidgetUp"
          @move-widget-down="moveWidgetDown"
          @remove-widget="removeWidget"
          @command="onCommand"
        />

        <!-- <f7-actions ref="widgetTypeSelection" id="widget-type-selection" :grid="true">
          <f7-actions-group>
            <f7-actions-button v-for="widgetType in widgetTypes" :key="widgetType.type" @click="addWidget(widgetType.type)">
              <f7-icon :f7="widgetType.icon" slot="media" />
              <span>{{widgetType.type}}</span>
            </f7-actions-button>
          </f7-actions-group>
        </f7-actions> -->
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'" class="page-code-editor" mode="text/x-yaml" :value="pageYaml" @input="(value) => pageYaml = value" />
        <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre>
      </f7-tab>

    </f7-tabs>

    <f7-popup ref="widgetConfig" class="widgetconfig-popup" :opened="widgetConfigOpened" @popup:closed="widgetConfigClosed">
      <f7-page v-if="currentComponent && currentWidget">
        <f7-navbar>
          <f7-nav-left>
            <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
          </f7-nav-left>
          <f7-nav-title>Edit {{currentWidget.label}}</f7-nav-title>
          <f7-nav-right>
            <f7-link @click="updateWidgetConfig">Done</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <f7-block v-if="currentWidget.props">
          <f7-block-title style="margin-bottom: calc(var(--f7-block-title-margin-bottom) - var(--f7-list-margin-vertical))">Configuration</f7-block-title>
          <f7-col>
            <config-sheet
              :parameterGroups="currentWidget.props.parameterGroups || []"
              :parameters="currentWidget.props.parameters || []"
              :configuration="currentComponentConfig"
              @updated="dirty = true"
            />
          </f7-col>
        </f7-block>
      </f7-page>
    </f7-popup>

  </f7-page>
</template>

<style lang="stylus">
.sitemap-editor-tabs
  --f7-grid-gap 0px
  height calc(100% - var(--f7-toolbar-height))
  .tab
    height 100%
.page-code-editor.vue-codemirror
  display block
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(80% - 2*var(--f7-navbar-height))
  width 100%
.yaml-message
  display block
  position absolute
  top 80%
  white-space pre-wrap
</style>

<script>
import stateTracking from '@/js/openhab/stateTracking'
import YAML from 'yaml'

import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'
import * as StandardWidgets from '@/components/widgets/standard/index'
import * as LayoutWidgets from '@/components/widgets/layout/index'

import ConfigSheet from '@/components/config/config-sheet.vue'

function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export default {
  mixins: [stateTracking],
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue'),
    OhLayoutPage,
    ConfigSheet
  },
  props: ['createMode', 'uid'],
  data () {
    return {
      ready: false,
      loading: false,
      page: {
        uid: 'page_' + uuidv4().split('-')[0],
        component: 'oh-layout-page',
        config: {},
        slots: { default: [] }
      },
      pageKey: uuidv4(),
      pageYaml: null,
      previewMode: 'false',
      currentTab: 'design',
      clipboard: null,
      clipboardType: null,
      currentComponent: null,
      currentComponentConfig: null,
      currentWidget: null,
      widgetConfigOpened: false
    }
  },
  created () {

  },
  mounted () {
    this.widgetDefinition = YAML.stringify(this.page)
  },
  computed: {
    context () {
      return {
        component: this.page,
        store: this.stateTracking.store,
        // states: this.stateTracking.store,
        editmode: this.previewMode === 'false',
        clipboardtype: this.clipboardType
      }
    },
    yamlError () {
      if (this.currentTab !== 'code') return null
      try {
        YAML.parse(this.pageYaml, { prettyErrors: true })
        return 'OK'
      } catch (e) {
        return e
      }
    }
  },
  watch: {
    states () {
      if (!this.stateTrackerConnectionId) return
      this.$oh.api.postPlain('/rest/events/states/' + this.stateTrackerConnectionId, JSON.stringify(this.store._keys), 'text/plain', 'application/json')
    }
  },
  methods: {
    onPageAfterIn () {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.startStateTracking()
      this.load()
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
      this.stopStateTracking()
    },
    keyDown (ev) {
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey)) {
        if (this.createMode) return // not supported!
        this.save(true)
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.createMode) {
        this.loading = false
        this.ready = true
      } else {
        this.$oh.api.get('/rest/ui/components/ui:page/' + this.uid).then((data) => {
          this.$set(this, 'page', data)
          this.ready = true
          this.loading = false
        })
      }
    },
    save (stay) {
      if (!this.page.uid) {
        this.$f7.dialog.alert('Please give an ID to the page')
        return
      }
      if (!this.page.config.label) {
        this.$f7.dialog.alert('Please give an label to the page')
        return
      }
      if (!this.createMode && this.uid !== this.page.uid) {
        this.$f7.dialog.alert('You cannot change the ID of an existing page. Duplicate it with the new ID then delete this one.')
        return
      }

      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/ui/components/ui:page', JSON.stringify(this.page), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/ui:page/' + this.page.uid, this.page)
      promise.then((data) => {
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Page created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.load()
        } else {
          this.$f7.toast.create({
            text: 'Page updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        this.$f7.emit('sidebarRefresh', null)
        if (!stay) this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving page: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    addWidget (component, widgetType, parentContext) {
      if (widgetType) {
        component.slots.default.push({
          component: widgetType,
          config: {},
          slots: { default: [] }
        })
      } else {
        let actions
        var doAddWidget = (choice) => {
          component.slots.default.push({
            component: choice,
            config: (choice === 'oh-test-card') ? { height: 300 } : {}
          })
          this.$nextTick(() => actions.destroy())
        }
        const standardWidgetOptions = Object.keys(StandardWidgets).map((k) => {
          return {
            text: StandardWidgets[k].widget.label,
            onClick: () => doAddWidget(StandardWidgets[k].widget.name)
          }
        })
        actions = this.$f7.actions.create({
          grid: true,
          buttons: [
            standardWidgetOptions
          ]
        }).open()
      }
    },
    widgetConfigClosed () {
      this.currentComponent = null
      this.currentWidget = null
      this.widgetConfigOpened = false
    },
    updateWidgetConfig () {
      this.$set(this.currentComponent, 'config', this.currentComponentConfig)
      this.forceUpdate()
      this.widgetConfigClosed()
    },
    addBlock (component) {
      component.slots.default.push({
        component: 'oh-block',
        config: {},
        slots: { default: [] }
      })
    },
    addMasonry (component) {
      if (!component.slots.masonry) {
        this.$set(this.page.slots, 'masonry', [{
          component: 'oh-masonry',
          config: { nbTestCards: 10 },
          slots: { default: [] }
        }])
      }
    },
    configureWidget (component, parentContext) {
      this.currentComponent = null
      this.currentWidget = null
      let widgetDefinition
      widgetDefinition = Object.values(StandardWidgets).find((w) => w.widget.name === component.component)
      if (!widgetDefinition) {
        widgetDefinition = Object.values(LayoutWidgets).find((w) => w.widget.name === component.component)
        if (!widgetDefinition) {
          console.warn('Widget not found')
          return
        }
      }
      this.currentComponent = component
      this.currentWidget = widgetDefinition.widget
      this.currentComponentConfig = JSON.parse(JSON.stringify(this.currentComponent.config))
      this.widgetConfigOpened = true
    },
    cutWidget (component, parentContext) {
      this.copyWidget(component, parentContext)
      this.removeWidget(component, parentContext)
    },
    copyWidget (component, parentContext) {
      let newClipboard = JSON.stringify(component)
      this.$set(this, 'clipboard', newClipboard)
      this.clipboardType = component.component
    },
    pasteWidget (component, parentContext) {
      if (!this.clipboard) return
      component.slots.default.push(JSON.parse(this.clipboard))
    },
    moveWidgetUp (component, parentContext) {
      let siblings = parentContext.component.slots.default
      let pos = siblings.indexOf(component)
      if (pos <= 0) return
      siblings.splice(pos, 1)
      siblings.splice(pos - 1, 0, component)
      this.forceUpdate()
    },
    moveWidgetDown (component, parentContext) {
      let siblings = parentContext.component.slots.default
      let pos = siblings.indexOf(component)
      if (pos >= siblings.length - 1) return
      siblings.splice(pos, 1)
      siblings.splice(pos + 1, 0, component)
      this.forceUpdate()
    },
    removeWidget (component, parentContext) {
      parentContext.component.slots.default.splice(parentContext.component.slots.default.indexOf(component), 1)
      this.forceUpdate()
    },
    forceUpdate () {
      this.pageKey = uuidv4()
    },
    toYaml () {
      this.pageYaml = YAML.stringify({
        blocks: this.page.slots.default,
        masonry: this.page.slots.masonry
      })
    },
    fromYaml () {
      try {
        const updatedSlots = YAML.parse(this.pageYaml)
        this.$set(this.page.slots, 'default', updatedSlots.blocks)
        this.$set(this.page.slots, 'masonry', updatedSlots.masonry)
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
