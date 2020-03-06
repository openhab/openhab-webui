<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="tabs-editor">
    <f7-navbar :title="(!ready) ? '' : (createMode) ? 'Create tabbed page' : page.config.label" back-link="Back" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span></f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'design'; fromYaml()" :tab-link-active="currentTab === 'design'" class="tab-link">Design</f7-link>
      <!-- <f7-link @click="currentTab = 'preview'" :tab-link-active="currentTab === 'preview'" class="tab-link">Preview</f7-link> -->
      <f7-link @click="currentTab = 'code'; toYaml()" :tab-link-active="currentTab === 'code'" class="tab-link">Code</f7-link>
    </f7-toolbar>
    <f7-toolbar bottom class="toolbar-details" v-show="currentTab === 'design'">
      <!-- <div style="margin-left: auto">
        <f7-toggle :checked="previewMode" @toggle:change="(value) => previewMode = value"></f7-toggle> Run mode<span v-if="$device.desktop">&nbsp;(Ctrl-R)</span>
      </div> -->
    </f7-toolbar>
    <f7-tabs class="tabs-editor-tabs">
      <f7-tab id="design" class="tabs-editor-design-tab" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader></f7-preloader>
          <div>Loading...</div>
        </f7-block>
        <f7-block class="block-narrow" v-if="ready && !previewMode">
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

        <f7-block class="block-narrow" style="padding-bottom: 8rem" v-if="ready">
          <f7-col>
            <f7-block-title>Tabs</f7-block-title>
            <f7-menu v-if="clipboardType === 'oh-tab'">
              <f7-menu-item style="margin-left: auto" icon-f7="squares_below_rectangle" dropdown>
                <f7-menu-dropdown right>
                  <f7-menu-dropdown-item @click="pasteWidget(page, null)" href="#" text="Paste"></f7-menu-dropdown-item>
                </f7-menu-dropdown>
              </f7-menu-item>
            </f7-menu>

            <f7-list media-list>
              <f7-list-item media-item v-for="(tab, idx) in page.slots.default" :key="idx"
                :title="tab.config.title" :subtitle="tab.config.page">
                <f7-icon slot="media" :ios="tab.config.icon" :md="tab.config.icon" :aurora="tab.config.icon" color="gray" />
                <f7-menu slot="content-start">
                  <f7-menu-item icon-f7="list_bullet" dropdown>
                    <f7-menu-dropdown>
                      <f7-menu-dropdown-item @click="configureWidget(tab,  { component: page })" href="#" text="Configure Tab"></f7-menu-dropdown-item>
                      <f7-menu-dropdown-item @click="editWidgetCode(tab, { component: page })" href="#" text="Edit YAML"></f7-menu-dropdown-item>
                      <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
                      <f7-menu-dropdown-item @click="cutWidget(tab, { component: page })" href="#" text="Cut"></f7-menu-dropdown-item>
                      <f7-menu-dropdown-item @click="copyWidget(tab, { component: page })" href="#" text="Copy"></f7-menu-dropdown-item>
                      <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
                      <f7-menu-dropdown-item @click="moveWidgetUp(tab, { component: page })" href="#" text="Move Up"></f7-menu-dropdown-item>
                      <f7-menu-dropdown-item @click="moveWidgetDown(tab, { component: page })" href="#" text="Move Down"></f7-menu-dropdown-item>
                      <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
                      <f7-menu-dropdown-item @click="removeWidget(tab, { component: page })" href="#" text="Remove Tab"></f7-menu-dropdown-item>
                    </f7-menu-dropdown>
                  </f7-menu-item>
                </f7-menu>
              </f7-list-item>
              <f7-list-button color="blue" title="Add tab" @click="addWidget(page, 'oh-tab')" />
            </f7-list>
          </f7-col>
        </f7-block>

      </f7-tab>

      <f7-tab id="preview" class="tabs-editor-preview-tab" @tab:show="() => this.currentTab = 'preview'" :tab-active="currentTab === 'preview'">

      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'" class="page-code-editor" mode="text/x-yaml" :value="pageYaml" @input="(value) => pageYaml = value" />
        <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre>
      </f7-tab>

    </f7-tabs>

    <f7-popup ref="widgetConfig" class="widgetconfig-popup" close-on-escape :opened="widgetConfigOpened" @popup:closed="widgetConfigClosed">
      <f7-page v-if="currentComponent && currentWidget">
        <f7-navbar>
          <f7-nav-left>
            <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
          </f7-nav-left>
          <f7-nav-title>Edit {{currentWidget.label || currentWidget.uid}}</f7-nav-title>
          <f7-nav-right>
            <f7-link @click="updateWidgetConfig">Done</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <f7-block v-if="currentWidget.props">
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

    <f7-popup ref="widgetCode" class="widgetcode-popup" close-on-escape :opened="widgetCodeOpened" @popup:closed="widgetCodeClosed">
      <f7-page v-if="currentComponent && widgetCodeOpened">
        <f7-navbar>
          <f7-nav-left>
            <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
          </f7-nav-left>
          <f7-nav-title>Edit Widget Code</f7-nav-title>
          <f7-nav-right>
            <f7-link @click="updateWidgetCode">Done</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <editor class="page-code-editor" mode="text/x-yaml" :value="widgetYaml" @input="(value) => widgetYaml = value" />
        <pre class="yaml-message padding-horizontal" :class="[widgetYamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{widgetYamlError}}</pre>
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
import YAML from 'yaml'

// import OhMapPage from '@/components/widgets/map/oh-map-page.vue'
import OhTab from './oh-tab'
import ConfigSheet from '@/components/config/config-sheet.vue'

const ConfigurableWidgets = { OhTab }

function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export default {
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue'),
    ConfigSheet
  },
  props: ['createMode', 'uid'],
  data () {
    return {
      pageReady: false,
      loading: false,
      page: {
        uid: 'page_' + uuidv4().split('-')[0],
        component: 'oh-tabs-page',
        config: {},
        slots: { default: [] }
      },
      pageKey: uuidv4(),
      pageYaml: null,
      previewMode: false,
      currentTab: 'design',
      clipboard: null,
      clipboardType: null,
      currentComponent: null,
      currentComponentConfig: null,
      currentWidget: null,
      widgetConfigOpened: false,
      widgetCodeOpened: false,
      widgetYaml: null
    }
  },
  computed: {
    ready () {
      return this.pageReady && this.$store.state.components.widgets != null
    },
    context () {
      return {
        component: this.page,
        store: this.$store.getters.trackedItems,
        // states: this.stateTracking.store,
        editmode: (!this.previewMode) ? {
          addWidget: this.addWidget,
          configureWidget: this.configureWidget,
          editWidgetCode: this.editWidgetCode,
          cutWidget: this.cutWidget,
          copyWidget: this.copyWidget,
          pasteWidget: this.pasteWidget,
          moveWidgetUp: this.moveWidgetUp,
          moveWidgetDown: this.moveWidgetDown,
          removeWidget: this.removeWidget
        } : null,
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
    },
    widgetYamlError () {
      if (!this.widgetCodeOpened) return null
      try {
        YAML.parse(this.widgetYaml, { prettyErrors: true })
        return 'OK'
      } catch (e) {
        return e
      }
    }
  },
  methods: {
    onPageAfterIn () {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.$store.dispatch('startTrackingStates')
      this.load()
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
      this.$store.dispatch('stopTrackingStates')
    },
    keyDown (ev) {
      if (ev.ctrlKey || ev.metakKey) {
        switch (ev.keyCode) {
          // case 82:
          //   this.previewMode = !this.previewMode
          //   ev.stopPropagation()
          //   ev.preventDefault()
          //   break
          case 83:
            this.save(!this.createMode)
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.createMode) {
        this.loading = false
        this.pageReady = true
      } else {
        this.$oh.api.get('/rest/ui/components/ui:page/' + this.uid).then((data) => {
          this.$set(this, 'page', data)
          this.pageReady = true
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
    addWidget (component, widgetType, parentContext, slot) {
      if (!slot) slot = 'default'
      if (!component.slots) component.slots = {}
      if (!component.slots[slot]) component.slots[slot] = []
      if (widgetType) {
        component.slots[slot].push({
          component: widgetType,
          config: {},
          slots: { default: [] }
        })
        this.forceUpdate()
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
    widgetCodeClosed () {
      this.currentComponent = null
      this.currentWidget = null
      this.widgetCodeOpened = false
    },
    updateWidgetCode () {
      const updatedWidget = YAML.parse(this.widgetYaml)
      this.$set(this.currentComponent, 'config', updatedWidget.config)
      this.$set(this.currentComponent, 'slots', updatedWidget.slots)
      this.forceUpdate()
      this.widgetCodeClosed()
    },
    configureWidget (component, parentContext, forceComponentType) {
      const componentType = forceComponentType || component.component
      this.currentComponent = null
      this.currentWidget = null
      let widgetDefinition
      if (componentType.indexOf('widget:') === 0) {
        this.currentWidget = this.$store.getters.widget(componentType.substring(7))
      } else {
        widgetDefinition = Object.values(ConfigurableWidgets).find((w) => w.widget && w.widget.name === componentType)
        if (!widgetDefinition) {
          // widgetDefinition = Object.values(LayoutWidgets).find((w) => w.widget.name === component.component)
          if (!widgetDefinition) {
            console.warn('Widget not found: ' + componentType)
            this.$f7.toast.create({
              text: `This type of component cannot be configured: ${componentType}.`,
              destroyOnClose: true,
              closeTimeout: 3000,
              closeButton: true,
              closeButtonText: 'Edit YAML',
              on: {
                closeButtonClick: () => {
                  this.editWidgetCode(component, parentContext)
                }
              }
            }).open()
            return
          }
        }
        this.currentWidget = widgetDefinition.widget
      }
      this.currentComponent = component
      this.currentComponentConfig = JSON.parse(JSON.stringify(this.currentComponent.config))
      this.widgetConfigOpened = true
    },
    editWidgetCode (component, parentContext, slot) {
      if (slot && !component.slots) component.slots = {}
      if (slot && !component.slots[slot]) component.slots[slot] = []
      this.currentComponent = component
      this.widgetYaml = YAML.stringify(component)
      this.widgetCodeOpened = true
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
      this.forceUpdate()
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
        tabs: this.page.slots.default
      })
    },
    fromYaml () {
      try {
        const updatedTabs = YAML.parse(this.pageYaml)
        this.$set(this.page.slots, 'default', updatedTabs.tabs)
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
