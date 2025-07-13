import { nextTick } from 'vue'
import { utils } from 'framework7'
import { f7 } from 'framework7-vue'

import YAML from 'yaml'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import WidgetCodePopup from '@/components/pagedesigner/widget-code-popup.vue'
import DirtyMixin from '../dirty-mixin'

import { useStatesStore } from '@/js/stores/useStatesStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'

export default {
  mixins: [DirtyMixin],
  props: {
    pageCopy: Object,
    f7router: Object,
    f7route: Object
  },
  data () {
    return {
      pageReady: false,
      loading: false,
      savedPage: {},
      pageKey: utils.id(),
      pageYaml: null,
      props: {},
      previewMode: false,
      currentTab: 'design',
      clipboard: null,
      clipboardType: null,
      currentComponent: null,
      currentWidget: null
    }
  },
  computed: {
    ready () {
      return this.pageReady && useComponentsStore().widgets != null
    },
    context () {
      return {
        component: this.page,
        store: useStatesStore().trackedItems,
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
      useStatesStore().startTrackingStates()
      this.load()
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
      useStatesStore().stopTrackingStates()
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
          this.page = this.pageCopy
        }
        this.savedPage = cloneDeep(this.page)
        this.loading = false
        this.pageReady = true
      } else {
        this.$oh.api.get('/rest/ui/components/ui:page/' + this.uid).then((data) => {
          this.page = data
          this.savedPage = cloneDeep(this.page)
          nextTick(() => {
            this.pageReady = true
            this.loading = false
          })
        })
      }
    },
    save (stay) {
      if (this.currentTab === 'code' && !this.fromYaml()) return
      if (!this.page.uid) {
        f7.dialog.alert('Please give an ID to the page')
        return
      } else if (!/^[A-Za-z0-9_]+$/.test(this.page.uid)) {
        f7.dialog.alert('Page ID is only allowed to contain A-Z,a-z,0-9,_')
        return
      }
      if (this.createMode) {
        if (useComponentsStore().page(this.page.uid)) {
          f7.dialog.alert('A page with this ID already exists')
          return
        }
      } else if (this.uid !== this.page.uid) {
        f7.dialog.alert('You cannot change the ID of an existing page. Duplicate it with the new ID then delete this one.')
        return
      }
      if (!this.page.config.label) {
        f7.dialog.alert('Please give a label to the page')
        return
      }

      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/ui/components/ui:page', JSON.stringify(this.page), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/ui:page/' + this.page.uid, this.page)
      promise.then((data) => {
        this.dirty = false
        this.savedPage = cloneDeep(this.page)
        if (this.createMode) {
          f7.toast.create({
            text: 'Page created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.f7router.navigate(this.f7route.url.replace('/add', '/' + this.page.uid), { reloadCurrent: true })
          this.load()
        } else {
          f7.toast.create({
            text: 'Page updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        f7.emit('sidebarRefresh', null)
        // if (!stay) this.f7router.back()
      }).catch((err) => {
        f7.toast.create({
          text: 'Error while saving page: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    widgetConfigClosed () {
      this.currentComponent = null
      this.currentWidget = null
    },
    updateWidgetConfig (config) {
      this.currentComponent.config = config
      this.forceUpdate()
    },
    widgetCodeClosed () {
      this.currentComponent = null
      this.currentWidget = null
    },
    updateWidgetCode (code) {
      const updatedWidget = YAML.parse(code)
      this.currentComponent.config = updatedWidget.config
      this.currentComponent.slots = updatedWidget.slots
      this.forceUpdate()
    },
    configureWidget (component, parentContext, forceComponentType) {
      const componentType = forceComponentType || component.component
      this.currentComponent = null
      this.currentWidget = null
      let widgetDefinition
      if (componentType.indexOf('widget:') === 0) {
        this.currentWidget = useComponentsStore().widget(componentType.substring(7))
      } else {
        // getWidgetDefinition should be defined locally in the page designers SFCs
        widgetDefinition = this.getWidgetDefinition(componentType)
        if (!widgetDefinition) {
          console.warn('Widget not found: ' + componentType)
          f7.toast.create({
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

      this.f7router.navigate({
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

      f7.on('widgetConfigUpdate', this.updateWidgetConfig)
      f7.once('widgetConfigClosed', () => {
        f7.off('widgetConfigUpdate', this.updateWidgetConfig)
        this.widgetConfigClosed()
      })
    },
    configureSlot () {
      // This needs to be defined here, otherwise vue will complain about it in the computed context() method above.
      // it will get overridden by the component that includes this mixin.
    },
    editWidgetCode (component, parentContext, slot) {
      if (slot && !component.slots) component.slots = {}
      if (slot && !component.slots[slot]) component.slots[slot] = []
      this.currentComponent = component
      const popup = {
        component: WidgetCodePopup
      }

      this.f7router.navigate({
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

      f7.on('widgetCodeUpdate', this.updateWidgetCode)
      f7.once('widgetCodeClosed', () => {
        f7.off('widgetCodeUpdate', this.updateWidgetCode)
        this.widgetCodeClosed()
      })
    },
    cutWidget (component, parentContext, slot = 'default') {
      this.copyWidget(component, parentContext)
      this.removeWidget(component, parentContext)
    },
    copyWidget (component, parentContext, slot = 'default') {
      let newClipboard = JSON.stringify(component)
      this.clipboard = newClipboard
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
      this.pageKey = f7.utils.id()
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
