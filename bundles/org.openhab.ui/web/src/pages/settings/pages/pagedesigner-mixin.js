import YAML from 'yaml'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import WidgetCodePopup from '@/components/pagedesigner/widget-code-popup.vue'
import DirtyMixin from '../dirty-mixin'

export default {
  mixins: [DirtyMixin],
  props: ['pageCopy'],
  data () {
    return {
      pageReady: false,
      loading: false,
      savedPage: {},
      pageKey: this.$f7.utils.id(),
      pageYaml: null,
      props: {},
      previewMode: false,
      currentTab: 'design',
      clipboard: null,
      clipboardType: null,
      currentComponent: null,
      currentWidget: null,
      widgetConfigOpened: false,
      widgetCodeOpened: false
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
        props: this.props,
        vars: (this.page && this.page.config && this.page.config.defineVars) ? this.page.config.defineVars : {},
        editmode: (!this.previewMode || this.forceEditMode) ? {
          addWidget: this.addWidget,
          configureWidget: this.configureWidget,
          configureSlot: this.configureSlot,
          editWidgetCode: this.editWidgetCode,
          cutWidget: this.cutWidget,
          copyWidget: this.copyWidget,
          pasteWidget: this.pasteWidget,
          moveWidgetUp: this.moveWidgetUp,
          moveWidgetDown: this.moveWidgetDown,
          sendWidgetToBack: this.sendWidgetToBack,
          bringWidgetToFront: this.bringWidgetToFront,
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
    }
  },
  watch: {
    page: {
      handler: function () {
        if (!this.loading) { // ignore changes during loading
          this.dirty = !fastDeepEqual(this.page, this.savedPage)
        }
      },
      deep: true
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
      if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        switch (ev.keyCode) {
          case 82:
            this.togglePreviewMode()
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 83:
            this.save(!this.createMode)
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    },
    onEditorInput (value) {
      this.pageYaml = value
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.createMode) {
        if (this.pageCopy) {
          this.$set(this, 'page', this.pageCopy)
        }
        this.savedPage = cloneDeep(this.page)
        this.loading = false
        this.pageReady = true
      } else {
        this.$oh.api.get('/rest/ui/components/ui:page/' + this.uid).then((data) => {
          this.$set(this, 'page', data)
          this.savedPage = cloneDeep(this.page)
          this.$nextTick(() => {
            this.pageReady = true
            this.loading = false
          })
        })
      }
    },
    save (stay) {
      if (this.currentTab === 'code' && !this.fromYaml()) return
      if (!this.page.uid) {
        this.$f7.dialog.alert('Please give an ID to the page')
        return
      } else if (!/^[A-Za-z0-9_]+$/.test(this.page.uid)) {
        this.$f7.dialog.alert('Page ID is only allowed to contain A-Z,a-z,0-9,_')
        return
      }
      if (this.createMode) {
        if (this.$store.getters.page(this.page.uid)) {
          this.$f7.dialog.alert('A page with this ID already exists')
          return
        }
      } else if (this.uid !== this.page.uid) {
        this.$f7.dialog.alert('You cannot change the ID of an existing page. Duplicate it with the new ID then delete this one.')
        return
      }
      if (!this.page.config.label) {
        this.$f7.dialog.alert('Please give a label to the page')
        return
      }

      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/ui/components/ui:page', JSON.stringify(this.page), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/ui:page/' + this.page.uid, this.page)
      promise.then((data) => {
        this.dirty = false
        this.savedPage = cloneDeep(this.page)
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Page created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.$f7router.navigate(this.$f7route.url.replace('/add', '/' + this.page.uid), { reloadCurrent: true })
          this.load()
        } else {
          this.$f7.toast.create({
            text: 'Page updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        this.$f7.emit('sidebarRefresh', null)
        // if (!stay) this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving page: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    widgetConfigClosed () {
      this.currentComponent = null
      this.currentWidget = null
      this.widgetConfigOpened = false
    },
    updateWidgetConfig (config) {
      this.$set(this.currentComponent, 'config', config)
      this.forceUpdate()
      this.widgetConfigClosed()
    },
    widgetCodeClosed () {
      this.currentComponent = null
      this.currentWidget = null
      this.widgetCodeOpened = false
    },
    updateWidgetCode (code) {
      const updatedWidget = YAML.parse(code)
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
        // getWidgetDefinition should be defined locally in the page designers SFCs
        widgetDefinition = this.getWidgetDefinition(componentType)
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
        this.currentWidget = widgetDefinition
      }

      this.currentComponent = component
      const popup = {
        component: WidgetConfigPopup,
        componentType: this.type
      }

      this.$f7router.navigate({
        url: 'configure-widget',
        route: {
          path: 'configure-widget',
          popup
        }
      }, {
        props: {
          component: this.currentComponent,
          widget: this.currentWidget
        }
      })

      this.$f7.once('widgetConfigUpdate', this.updateWidgetConfig)
      this.$f7.once('widgetConfigClosed', () => {
        this.$f7.off('widgetConfigUpdate', this.updateWidgetConfig)
        this.widgetConfigClosed()
      })
      // this.widgetConfigOpened = true
    },
    editWidgetCode (component, parentContext, slot) {
      if (slot && !component.slots) component.slots = {}
      if (slot && !component.slots[slot]) component.slots[slot] = []
      this.currentComponent = component
      this.widgetCodeOpened = true
      const popup = {
        component: WidgetCodePopup
      }

      this.$f7router.navigate({
        url: 'widget-code',
        route: {
          path: 'widget-code',
          popup
        }
      }, {
        props: {
          componentType: this.$f7router.currentRoute.params.type,
          component: this.currentComponent
        }
      })

      this.$f7.once('widgetCodeUpdate', this.updateWidgetCode)
      this.$f7.once('widgetCodeClosed', () => {
        this.$f7.off('widgetCodeUpdate', this.updateWidgetCode)
        this.widgetCodeClosed()
      })
    },
    cutWidget (component, parentContext, slot = 'default') {
      this.copyWidget(component, parentContext)
      this.removeWidget(component, parentContext)
    },
    copyWidget (component, parentContext, slot = 'default') {
      let newClipboard = JSON.stringify(component)
      this.$set(this, 'clipboard', newClipboard)
      this.clipboardType = component.component
    },
    pasteWidget (component, parentContext, slot = 'default') {
      if (!this.clipboard) return
      component.slots[slot].push(JSON.parse(this.clipboard))
      this.forceUpdate()
    },
    moveWidgetUp (component, parentContext, slot = 'default') {
      let siblings = parentContext.component.slots[slot]
      return this.moveWidget(component, parentContext, slot, siblings.indexOf(component) - 1)
    },
    moveWidgetDown (component, parentContext, slot = 'default') {
      let siblings = parentContext.component.slots[slot]
      return this.moveWidget(component, parentContext, slot, siblings.indexOf(component) + 1)
    },
    bringWidgetToFront (component, parentContext, slot = 'default') {
      return this.moveWidget(component, parentContext, slot, parentContext.component.slots[slot].length)
    },
    sendWidgetToBack (component, parentContext, slot = 'default') {
      return this.moveWidget(component, parentContext, slot, 0)
    },
    moveWidget (component, parentContext, slot = 'default', newPos) {
      let siblings = parentContext.component.slots[slot]
      let pos = siblings.indexOf(component)
      newPos = Math.max(0, Math.min(siblings.length, newPos))
      if (pos === newPos) return
      siblings.splice(pos, 1)
      siblings.splice(newPos, 0, component)
      this.forceUpdate()
      return Math.min(siblings.length - 1, newPos)
    },
    removeWidget (component, parentContext, slot = 'default') {
      parentContext.component.slots[slot].splice(parentContext.component.slots[slot].indexOf(component), 1)
      this.forceUpdate()
    },
    forceUpdate () {
      this.pageKey = this.$f7.utils.id()
    },
    togglePreviewMode (value) {
      if (value === undefined) value = !this.previewMode
      if (value === true) {
        if (this.currentTab === 'code') {
          if (!this.fromYaml()) return
        }
      }
      this.previewMode = value
      this.forceUpdate()
    }
  }
}
