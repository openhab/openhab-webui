<template>
  <q-layout view="hHh LpR fFf">
    <q-layout-header>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack()" />
        <q-toolbar-title>
          Card Designer
        </q-toolbar-title>
        <q-btn @click="save()" icon="save" flat label="Save"></q-btn>
      </q-toolbar>
    </q-layout-header>

    <q-layout-footer>
      <q-toolbar>
        <q-btn @click="layout.treepane=!layout.treepane" icon="format_indent_increase" flat label="Tree"></q-btn>
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn @click="layout.toolpane=!layout.toolpane" icon-right="build" flat label="Tools"></q-btn>
      </q-toolbar>
    </q-layout-footer>

    <q-layout-drawer side="left" content-class="bg-grey-2 shadow-1 tree-drawer" v-model="layout.treepane" ref="treeDrawer">
      <div>
        <q-resize-observable @resize="treeViewResized"></q-resize-observable>
        <q-tree ref="tree"
                v-if="treeModel" class="designer-tree"
                :nodes="treeModel" node-key="id" :selected.sync="selectedNodeId" default-expand-all
                :style="{ 'width': layout.treeViewWidth }"></q-tree>
      </div>
    </q-layout-drawer>

    <q-layout-drawer side="right" content-class="bg-grey-2 shadow-9 tools-drawer" v-model="layout.toolpane">
      <div v-if="selectedNode" class="properties">
        <div class="node-header bg-white">
          <q-btn round flat icon="more_vert" size="sm" class="float-right">
            <q-popover anchor="bottom right" self="top right" v-if="this.selectedNode.type === 'component' && this.selectedNode.component.component !== 'HbCard'">
              <q-list link class="no-border">
                <q-item v-close-overlay @click.native="copyCutComponent('cut')">
                  <q-item-main label="Cut" />
                </q-item>
                <q-item v-close-overlay @click.native="copyCutComponent('copy')">
                  <q-item-main label="Copy" />
                </q-item>
                <q-item v-close-overlay @click.native="moveComponent(-1)">
                  <q-item-main label="Move up" />
                </q-item>
                <q-item v-close-overlay @click.native="moveComponent(1)">
                  <q-item-main label="Move down" />
                </q-item>
                <q-item v-close-overlay @click.native="cloneComponent()">
                  <q-item-main label="Clone" />
                </q-item>
                <q-item v-close-overlay @click.native="deleteComponent()">
                  <q-item-main label="Delete" />
                </q-item>
              </q-list>
            </q-popover>
            <q-popover anchor="bottom right" self="top right" v-else-if="this.selectedNode.type === 'slot'">
              <q-list link class="no-border">
                <q-item v-close-overlay @click.native="showJsonEditor = true">
                  <q-item-main label="Edit JSON" />
                </q-item>
                <q-item v-close-overlay @click.native="pasteComponent()" :disabled="!$q.sessionStorage.has('habot.designerClipboard')">
                  <q-item-main :label="'Paste ' + ($q.sessionStorage.has('habot.designerClipboard') ? $q.sessionStorage.get.item('habot.designerClipboard').component : '')" />
                </q-item>
              </q-list>
            </q-popover>
            <q-popover anchor="bottom right" self="top right" v-else-if="this.selectedNode.component.component === 'HbCard'">
              <q-list link class="no-border">
                <!-- <q-item v-close-overlay @click.native="showJsonEditor = true">
                  <q-item-main label="Edit JSON" />
                </q-item> -->
                <q-item v-close-overlay disabled @click.native="saveAsNew()">
                  <q-item-main label="Save as New" />
                </q-item>
              </q-list>
            </q-popover>
          </q-btn>
          <div class="q-title">{{selectedNode.label}}</div>
          <div class="q-caption">{{selectedNode.type}}</div>
          <!-- <div v-if="selectedNode.type === 'component'" class="q-body-2">{{currentComponent.description}}</div> -->
        </div>
        <!-- <div v-if="selectedNode.type === 'slot'">
          <div class="q-body-2">{{currentComponent.slotDescriptions[selectedNode.label].description}}</div>
        </div> -->

        <q-tabs ref="component-config" v-if="selectedNode.type === 'component'" class="properties-tabs" inverted color="grey-7" :two-lines="false" align="center" no-pane-border>
          <q-tab label="Properties" name="config" slot="title" icon="widgets" default />
          <q-tab label="Slots" name="slots" slot="title" icon="view_compact" v-if="currentComponent.slotDescriptions" :alert="currentComponent.slotDescriptions && selectedNode.component.slots && (Object.keys(currentComponent.slotDescriptions).length - Object.keys(selectedNode.component.slots).length > 0)" />

          <q-tab-pane name="config">
            <div class="q-body-2">{{currentComponent.description}}</div>
            <br />

            <!-- Special handling for the root HbCard -->
            <div v-if="selectedNode && selectedNode.id === 'card'">
              <q-field label="title" class="config-field" orientation="vertical"
                      helper="The title of the card">
                <config-text v-model="selectedNode.component.title"></config-text>
              </q-field>
              <q-field label="subtitle" class="config-field" orientation="vertical"
                      helper="The subtitle of the card">
                <config-text v-model="selectedNode.component.subtitle"></config-text>
              </q-field>
              <q-field label="attributes" class="config-field" orientation="vertical"
                      helper="The attributes of the card (objects & locations); used for filtering the Card deck and to override the default generated card during the chat">
                <q-search class="q-body-1 search-tags" color="secondary" v-model="searchAttribute"
                      placeholder="Search on items">
                    <q-autocomplete :static-data="attributesSuggestions" @selected="addAttribute" />
                </q-search>
                <q-chips-input v-model="selectedNode.component.objects" color="secondary"
                      :error="!hasAtLeastOneAttribute" placeholder="Objects">
                </q-chips-input>
                <q-chips-input v-model="selectedNode.component.locations" color="secondary"
                      :error="!hasAtLeastOneAttribute" placeholder="Locations" style="margin-top: 0.5rem">
                </q-chips-input>
              </q-field>
              <q-field label="suggestcriteria" class="config-field" orientation="vertical"
                      helper="The expression to evaluate in order to determine whether the card will be considered as a suggestion. Leave blank if the card is not to be suggested. Example: items.Temperature.state < 16">
                <config-expr v-model="selectedNode.config.suggestcriteria" target-type="boolean" color="secondary"></config-expr>
              </q-field>
              <q-field label="tags" class="config-field" orientation="vertical"
                      helper="The tags attached to the card">
                <!-- <q-search class="q-body-1 search-tags" color="secondary" v-model="searchTag"
                      :error="!hasValidTags"  placeholder="Search from items">
                    <q-autocomplete :static-data="tagSuggestions" @selected="addTag" />
                </q-search> -->
                <q-chips-input v-model="selectedNode.component.tags" color="secondary"
                      placeholder="Add tags">
                </q-chips-input>
              </q-field>
              <q-field label="notReuseableInChat" class="config-field" orientation="vertical"
                      helper="The card will not be considered when chatting with HABot even if the attributes match">
                <config-bool v-model="selectedNode.component.notReuseableInChat" color="secondary"></config-bool>
              </q-field>
            </div>

            <q-field
                v-if="currentComponent && currentComponent.configDescriptions && selectedNode.config"
                v-for="(configDesc, prop) in currentComponent.configDescriptions"
                :label="prop"
                class="config-field"
                orientation="vertical"
                :helper="configDesc.description" :key="prop">
              <div class="hidden">{{selectedNode.config[prop]}}</div>
              <config-bool v-if="configDesc.type === 'boolean'" v-model="selectedNode.config[prop]"></config-bool>
              <config-option-group v-else-if="configDesc.type === 'optiongroup'" v-model="selectedNode.config[prop]" :options="configDesc.options"></config-option-group>
              <config-item v-else-if="configDesc.type === 'item'" v-model="selectedNode.config[prop]" :multiple="configDesc.multiple"></config-item>
              <config-array v-else-if="configDesc.type === 'array'" v-model="selectedNode.config[prop]"></config-array>
              <config-expr v-else-if="configDesc.type === 'expr'" v-model="selectedNode.config[prop]" :target-type="configDesc.targetType"></config-expr>
              <config-text v-else v-model="selectedNode.config[prop]"></config-text>
            </q-field>
          </q-tab-pane>

          <q-tab-pane name="slots">
            <q-list v-if="selectedNode && selectedNode.type === 'component' && currentComponent && currentComponent.slotDescriptions && selectedNode.component.slots" no-border>
              <q-list-header>Add a slot</q-list-header>
              <q-item v-for="(slotDescription, slotName) in currentComponent.slotDescriptions" :key="slotName" inset-separator>
                <q-item-side>
                  <q-btn class="bg-secondary text-white" round icon="add" @click="addSlot(slotName)" :disabled="selectedNode.component.slots[slotName]"></q-btn>
                </q-item-side>
                <q-item-main>
                  <q-item-tile label>{{slotName}}</q-item-tile>
                  <q-item-tile sublabel>{{slotDescription.description}}</q-item-tile>
                </q-item-main>
              </q-item>
            </q-list>
            <div v-else class="q-list-header">No slots available for {{selectedNode.component.component}}</div>
          </q-tab-pane>
        </q-tabs>

        <q-tabs ref="slot-config" v-show="selectedNode.type === 'slot'" class="properties-tabs" inverted color="grey-7" :two-lines="false" align="center" no-pane-border>
          <q-tab ref="componentsTab" label="Components" name="components" slot="title" icon="widgets" default />
          <q-tab-pane name="components">
            <div v-if="selectedNode && selectedNode.type === 'slot'" class="q-body-2">{{currentComponent.slotDescriptions[selectedNode.label].description}}</div>
            <br />

            <q-list v-if="selectedNode && selectedNode.type === 'slot'" no-border>
              <q-list-header>Add a component</q-list-header>
              <q-item v-for="subcomponent in validSubcomponents(selectedNode.label)" :key="subcomponent" inset-separator>
                <q-item-side>
                  <q-btn class="bg-secondary text-white" round icon="add" @click="addComponent(selectedNode.label, subcomponent)"></q-btn>
                </q-item-side>
                <q-item-main>
                  <q-item-tile label>{{subcomponent}}</q-item-tile>
                  <q-item-tile sublabel>{{components[subcomponent].description}}</q-item-tile>
                </q-item-main>
              </q-item>
            </q-list>
          </q-tab-pane>
        </q-tabs>
      </div>

      <div v-if="selectedNode" class="actions">
        <div v-if="selectedNode.type === 'component' && selectedNode.label !== 'HbCard'" class="flex flex-center">
          <q-btn-group push>
            <q-btn push icon="delete" color="red" @click="deleteComponent()"></q-btn>
            <q-btn push icon="keyboard_arrow_up" color="white" text-color="black" @click="moveComponent(-1)"></q-btn>
            <q-btn push icon="keyboard_arrow_down" color="white" text-color="black" @click="moveComponent(1)"></q-btn>
            <q-btn push icon="content_copy" color="secondary" @click="cloneComponent()"></q-btn>
          </q-btn-group>
        </div>
        <!-- <div v-if="selectedNode.type === 'slot'">
          <q-btn-group push>
            <q-btn push icon="delete" color="red"></q-btn>
          </q-btn-group>
        </div> -->
      </div>

    </q-layout-drawer>

    <div class="card-container">
      <hb-card ref="card" v-if="cardModel" :model="cardModel" menu="designer"></hb-card>
    </div>

    <q-modal no-backdrop-dismiss no-esc-dismiss v-model="showJsonEditor" :content-css="{minWidth: '80vw', minHeight: '80vh'}" @hide="showJsonEditor = false">
      <json-editor v-if="showJsonEditor" ref="jsonEditor" v-model="jsonEditorModel" :component="selectedNode.component" :slotName="selectedNode.label" @update="slotJsonUpdated" />
    </q-modal>
  </q-layout>
</template>

<style lang="stylus">
@import '~variables'
.search-tags.q-if
  padding 0
  margin-bottom 8px
.tree-drawer, .tools-drawer
  width 320px
.designer-tree
  font-size 10pt
  .q-tree-children
    padding-left 10px
  .q-tree-node
    padding-bottom 0
  .q-tree-node:after
    display none
  .q-tree-node-header:before
    display none
.properties
  padding 1rem
  .node-header
    margin -16px -16px 10px -16px
    padding 15px
  .properties-tabs
    margin -16px -16px 10px -16px
    background inherit
.actions
  padding 1rem
.config-field
  padding-bottom 8px
.card-container
  position absolute
  top 80px
  margin-bottom 100px
  left 50%
  transform translateX(-50%)
  .q-card
    width 100%
@media (max-width $breakpoint-xs-max)
  .card-container
    width calc(100% - 20px)
@media (min-width $breakpoint-xs-min)
  .card-container
    min-width $card-min-width
</style>

<script>
import HbCard from 'components/HbCard.vue'
import ConfigText from 'components/designer/ConfigText.vue'
import ConfigBool from 'components/designer/ConfigBool.vue'
import ConfigOptionGroup from 'components/designer/ConfigOptionGroup.vue'
import ConfigItem from 'components/designer/ConfigItem.vue'
import ConfigExpr from 'components/designer/ConfigExpr.vue'
import ConfigArray from 'components/designer/ConfigArray.vue'
import JsonEditor from 'layouts/designer/JsonEditor.vue'

import Vue from 'vue'
import { extend } from 'quasar'

import Components from 'assets/components.json'

function componentToTreeNode (c, prefix) {
  let node = {
    id: prefix,
    type: 'component',
    component: c,
    icon: 'widgets',
    label: c.component
  }
  // Vue.set(c, 'highlight', false)
  if (c.title) node.title = c.title
  if (c.subtitle) node.subtitle = c.subtitle
  if (!c.config) c.config = {}
  node.config = c.config

  if (c.slots) {
    node.children = []
    for (let slot in c.slots) {
      let slotPrefix = prefix + '-' + slot
      let slotNode = {
        id: slotPrefix,
        label: slot,
        component: c,
        type: 'slot',
        icon: 'view_compact',
        tickable: false,
        children: [],
        parentNode: node
      }
      let idx = 0
      for (let subcomponent of c.slots[slot]) {
        let subnode = componentToTreeNode(subcomponent, slotPrefix + '-' + idx++)
        subnode.parentNode = slotNode
        subnode.parentSlotName = slot
        subnode.parentSlot = c.slots[slot]
        slotNode.children.push(subnode)
      }
      node.children.push(slotNode)
    }
  }

  return node
}

export default {
  name: 'CardDesigner',
  props: [
    'uid'
  ],
  components: {
    HbCard,
    ConfigText,
    ConfigBool,
    ConfigOptionGroup,
    ConfigItem,
    ConfigExpr,
    ConfigArray,
    JsonEditor
  },
  data () {
    return {
      components: Components,
      layout: {
        treepane: true,
        toolpane: true,
        treeViewWidth: null
      },
      cardModel: null,
      treeModel: null,
      selectedNodeId: 'card',
      newCard: false,
      searchAttribute: null,
      showJsonEditor: false,
      attributesSuggestions: {
        field: 'value',
        list: []
      },
      objectSuggestions: {
        field: 'value',
        list: []
      },
      locationSuggestions: {
        field: 'value',
        list: []
      }
    }
  },
  methods: {
    goBack () {
      // this.$router.push('/cards/deck')
      this.$router.back()
    },
    save () {
      if (!this.hasAtLeastOneAttribute) {
        this.$q.dialog({ title: 'Object and/or location required', message: 'The card must have at least one object or one location attribute' })
        return
      }
      this.card.uid = this.uid
      // let request = (this.newCard) ? this.$http.post('/rest/habot/cards/', this.card) : this.$http.put('/rest/habot/cards/' + this.uid, this.card)
      let action = (this.newCard) ? this.$store.dispatch('cards/create', this.card) : this.$store.dispatch('cards/update', this.card)
      action.then(() => {
        this.originalCard = JSON.stringify(this.card)
        if (this.newCard) {
          this.$q.notify({ type: 'positive', message: 'Card created' })
          this.newCard = false
        } else {
          this.$q.notify({ type: 'positive', message: 'Card saved' })
        }
      }).catch((err) => {
        this.$q.notify(err.message)
      })
    },
    redrawCard () {
      this.$refs.card.$forceUpdate()
    },
    buildTree () {
      this.flattenedComponents = {}
      this.treeModel = null
      this.cardModel = null
      Vue.nextTick(() => {
        this.cardModel = this.card
        this.treeModel = [componentToTreeNode(this.card, 'card')]
      })
    },
    addSlot (name) {
      let component = this.selectedNode.component
      if (!component.slots) component.slots = {}
      component.slots[name] = []
      this.buildTree()
      this.selectedNodeId = this.selectedNodeId + '-' + name
    },
    addComponent (slot, type) {
      let component = this.selectedNode.component
      let newComponent = {
        component: type,
        config: {}
      }
      if (!component.slots[slot]) component.slots[slot] = []
      if (this.components[type].slotDescriptions) newComponent.slots = {}
      component.slots[slot].push(newComponent)
      this.buildTree()
    },
    cloneComponent () {
      let component = this.selectedNode.component
      let newComponent = extend(true, {}, component)
      let idx = this.selectedNode.parentSlot.indexOf(component)
      this.selectedNode.parentSlot.splice(idx, 0, newComponent)
      this.buildTree()
    },
    deleteComponent () {
      if (!this.selectedNode || !this.selectedNode.type === 'component') return
      let parentNode = this.selectedNode.parentNode
      let parentSlot = this.selectedNode.parentSlot
      let parentSlotName = this.selectedNode.parentSlotName
      let componentIdx = parentSlot.indexOf(this.selectedNode.component)
      if (componentIdx < 0) return
      if (parentSlot.length === 1 && componentIdx === 0) {
        // Remove the slot if it has no components left
        delete parentNode.component.slots[parentSlotName]
      } else {
        parentSlot.splice(componentIdx, 1)
      }
      this.buildTree()
    },
    moveComponent (delta) {
      let slot = this.selectedNode.parentSlot
      let component = this.selectedNode.component
      let parentNodeId = this.selectedNode.parentNode.id
      var index = slot.indexOf(component)
      var newIndex = index + delta
      if (newIndex < 0 || newIndex === slot.length) return
      var indexes = [index, newIndex].sort()
      slot.splice(indexes[0], 2, slot[indexes[1]], slot[indexes[0]])
      // We have to deselect because the ids change (could compute the new id but nah)
      this.selectedNodeId = parentNodeId + '-' + newIndex
      this.buildTree()
    },
    validSubcomponents (slot) {
      let allcomponents = Object.keys(this.components).filter((c) => this.components[c].availableByDefault !== false).sort()
      if (!this.currentComponent || !this.currentComponent.slotDescriptions || !this.currentComponent.slotDescriptions[slot]) return allcomponents
      if (this.currentComponent.slotDescriptions[slot].allowedComponents) {
        return this.currentComponent.slotDescriptions[slot].allowedComponents
      } else if (this.currentComponent.slotDescriptions[slot].deniedComponents) {
        return allcomponents.filter((c) => this.currentComponent.slotDescriptions[slot].deniedComponents.indexOf(c) < 0)
      } else {
        return allcomponents
      }
    },
    addTag (tag) {
      this.searchTag = null
      this.card.tags.push(tag.value)
    },
    addAttribute (attribute, keyboard) {
      if (keyboard) return
      this.searchAttribute = null
      if (attribute.type === 'LOCATION') {
        this.card.locations.push(attribute.value)
      } else {
        this.card.objects.push(attribute.value)
      }
    },
    copyCutComponent (type) {
      if (!this.selectedNode) return
      if (this.selectedNode.type === 'slot') {
        this.$q.notify('Cannot copy an entire slot')
        return
      }
      if (this.selectedNode.component.component === 'HbCard') {
        this.$q.notify('Cannot copy the root HbCard')
        return
      }
      this.$q.sessionStorage.set('habot.designerClipboard', this.selectedNode.component)
      switch (type) {
        case 'cut':
          this.$q.notify({ type: 'info', message: 'Cut ' + this.selectedNode.component.component })
          this.deleteComponent()
          break
        case 'copy':
          this.$q.notify({ type: 'info', message: 'Copied ' + this.selectedNode.component.component })
          break
      }
    },
    pasteComponent () {
      if (!this.selectedNode) return
      if (this.selectedNode.type !== 'slot') {
        this.$q.notify('Select a slot to paste the copied component to')
        return
      }
      let parentComponent = this.selectedNode.component
      let slotName = this.selectedNode.label
      let component = extend({}, this.$q.sessionStorage.get.item('habot.designerClipboard'))
      if (component.component.indexOf('Hb') !== 0) return
      if (!this.currentComponent ||
        (this.currentComponent.slotDescriptions[slotName].allowedComponents &&
        this.currentComponent.slotDescriptions[slotName].allowedComponents.indexOf(component.component) === -1) ||
        (this.currentComponent.slotDescriptions[slotName].deniedComponents &&
        this.currentComponent.slotDescriptions[slotName].deniedComponents.indexOf(component.component) !== -1)) {
        this.$q.notify(`Cannot paste ${component.component} here`)
        return
      }

      parentComponent.slots[slotName].push(component)
      this.buildTree()
    },
    copyCutEvent (evt) {
      console.log(evt)
      if (evt.target.nodeName === 'INPUT' || evt.target.nodeName === 'TEXTAREA') return
      this.copyCutComponent(evt.type)
    },
    pasteEvent (evt) {
      console.log(evt)
      if (evt.target.nodeName === 'INPUT' || evt.target.nodeName === 'TEXTAREA') return
      this.pasteComponent()
    },
    treeViewResized (size) {
      let aside = this.$refs.treeDrawer.$el.getElementsByTagName('aside')
      if (!aside.length) return
      this.layout.treeViewWidth = (aside[0].scrollWidth > aside[0].clientWidth) ? aside[0].scrollWidth + 'px' : '100%'
    },
    slotJsonUpdated (newSlot) {
      this.selectedNode.component.slots[this.selectedNode.label] = newSlot
      this.showJsonEditor = false
      this.buildTree()
    }
  },
  computed: {
    selectedNode () {
      let findInTree = (node, id) => {
        if (!node || !id) return
        if (node.id === id) return node
        if (node.children) {
          for (let child of node.children) {
            let found = findInTree(child, id)
            if (found) {
              return found
            }
          }
          return null
        }
      }

      if (!this.treeModel || !this.selectedNodeId) return
      return findInTree(this.treeModel[0], this.selectedNodeId)
    },
    currentComponent () {
      if (!this.selectedNode) return null
      return this.components[this.selectedNode.component.component]
    },
    hasAtLeastOneAttribute () {
      return this.card.objects.length > 0 || this.card.locations.length > 0
    },
    jsonEditorModel () {
      // if (this.selectedNode.label === 'HbCard') return this.selectedNode.component
      if (this.selectedNode.type === 'slot') return this.selectedNode.component.slots[this.selectedNode.label]
      return null
    }
  },
  created () {
    let vm = this
    let card = vm.$store.getters['cards/copy'](this.uid)

    if (card) {
      vm.card = card
      if (!vm.card.tags) vm.card.tags = [] // temp
      vm.buildTree()
    } else {
      vm.newCard = true
      vm.card = {
        title: 'New Card',
        subtitle: 'Subtitle',
        component: 'HbCard',
        objects: (vm.$route.query.objects) ? vm.$route.query.objects.split(',') : [],
        locations: (vm.$route.query.locations) ? vm.$route.query.locations.split(',') : [],
        tags: [],
        bookmarked: false,
        config: {},
        slots: {}
      }

      // adds a list skeleton if the designer was invoked with a 'type' query string
      if (vm.$route.query.type === 'list') {
        vm.card.title = 'New List Card'
        vm.card.slots = {
          list: [
            {
              component: 'HbList',
              config: {},
              slots: {
                items: []
              }
            }
          ]
        }
      } else if (vm.$route.query.type === 'tabs') {
        vm.card.title = 'New Tabbed Card'
        vm.card.slots = {
          tabs: [
            {
              component: 'HbTabs',
              config: { inverted: true },
              slots: {
                tabs: [
                  {
                    component: 'HbTab',
                    config: {
                      name: 'tab1',
                      label: 'Tab 1'
                    }
                  },
                  {
                    component: 'HbTab',
                    config: {
                      name: 'tab2',
                      label: 'Tab 2'
                    }
                  }
                ],
                tabpanes: [
                  {
                    component: 'HbTabPane',
                    config: {
                      name: 'tab1'
                    },
                    slots: {
                      main: []
                    }
                  },
                  {
                    component: 'HbTabPane',
                    config: {
                      name: 'tab2'
                    },
                    slots: {
                      main: []
                    }
                  }
                ]
              }
            }
          ]
        }
      } else {
        vm.card.slots = {
          main: []
        }
      }

      vm.buildTree()
    }

    vm.originalCard = JSON.stringify(vm.card)

    // document.addEventListener('keyup', this.keyPressed)
    document.addEventListener('cut', this.copyCutEvent)
    document.addEventListener('copy', this.copyCutEvent)
    document.addEventListener('paste', this.pasteEvent)
  },
  mounted () {
    const vm = this
    // Populate the attribute suggestions
    this.$http.get('/rest/habot/attributes').then((resp) => {
      for (let item of Object.values(resp.data)) {
        for (let attr of item) {
          let suggestion = {
            type: attr.type,
            label: attr.value,
            value: attr.value,
            icon: attr.type === 'LOCATION' ? 'mdi-map-marker-outline' : 'mdi-cube-outline'
          }
          if (!vm.attributesSuggestions.list.some((a) => a.value === suggestion.value)) {
            vm.attributesSuggestions.list.push(suggestion)
          }
        }
      }
    }).catch((err) => {
      this.$q.notify('Cannot get the attribute suggestions: ' + err)
    })
  },
  destroyed () {
    // document.removeEventListener('keyup', this.keyPressed)
    document.removeEventListener('cut', this.copyCutEvent)
    document.removeEventListener('copy', this.copyCutEvent)
    document.removeEventListener('paste', this.pasteEvent)
  },
  watch: {
    selectedNode (val, old) {
      if (!val || !val.component) return
      if (val.type === 'slot' && this.$refs.componentsTab) {
        this.$refs.componentsTab.select()
      }
      if (val.component.component === 'HbCard') return // don't highlight the whole card
      let component = val.component
      Vue.set(component, 'highlight', true)
      window.setTimeout(() => {
        Vue.delete(component, 'highlight')
      }, 1000)
    }
  },
  beforeRouteLeave (to, from, next) {
    if (JSON.stringify(this.cardModel) === this.originalCard) {
      next()
    } else {
      const answer = window.confirm('Do you really want to leave the Card Designer? You have unsaved changes!')
      if (answer) {
        next()
      } else {
        next(false)
      }
    }
  }
}
</script>
