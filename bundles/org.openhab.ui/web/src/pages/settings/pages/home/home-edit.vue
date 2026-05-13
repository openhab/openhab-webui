<template>
  <f7-page ref="home-edit-page" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="home-editor">
    <f7-navbar no-hairline>
      <oh-nav-content
        :title="'Edit Home Page' + dirtyIndicator"
        :editable="isEditable"
        :save-link="`Save${$device.desktop ? ' (Ctrl-S)' : ''}`"
        @save="save()"
        :f7router />
    </f7-navbar>
    <f7-toolbar v-if="!previewMode" tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" tab-link="#design"> Design </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" tab-link="#code"> Code </f7-link>
    </f7-toolbar>
    <f7-toolbar v-else tabbar position="top">
      <!-- prettier-ignore  -->
      <f7-link
        v-for="tab in modelTabs"
        :key="tab.value"
        @click="showCardControls = false; currentModelTab = tab.value"
        :tab-link-active="currentModelTab === tab.value"
        :tab-link="'#' + tab.value">
        {{ tab.label }}
      </f7-link>
    </f7-toolbar>
    <f7-toolbar bottom class="toolbar-details">
      <div style="margin-left: auto">
        <f7-toggle :checked="previewMode ? true : null" @toggle:change="(value) => togglePreviewMode(value)" />
        Run mode<span v-if="$device.desktop">&nbsp;(Ctrl-R)</span>
      </div>
    </f7-toolbar>
    <f7-tabs class="tabs-editor-tabs">
      <f7-tab id="design" class="tabs-editor-design-tab" :tab-active="currentTab === 'design'">
        <f7-block v-if="!ready || !modelReady" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>

        <div v-else-if="!previewMode">
          <f7-block class="block-narrow no-padding">
            <not-editable-notice v-if="!isEditable" />
            <f7-col>
              <f7-block-title>Page Configuration</f7-block-title>
              <config-sheet
                :parameterGroups="pageWidgetDefinition.props.parameterGroups || []"
                :parameters="pageWidgetDefinition.props.parameters || []"
                :configuration="page.config"
                :f7router
                :read-only="!isEditable"
                @updated="dirty = true" />
            </f7-col>
          </f7-block>

          <f7-block class="block-narrow no-margin-bottom">
            <f7-col>
              <f7-segmented strong tag="p">
                <!-- prettier-ignore -->
                <f7-button
                  v-for="tab in modelTabs"
                  :key="tab.value"
                  @click="showCardControls = false; currentModelTab = tab.value"
                  :active="currentModelTab === tab.value"
                  :text="tab.label" />
              </f7-segmented>

              <div class="cards-title-row">
                <f7-block-title class="no-margin-bottom">Cards</f7-block-title>
                <f7-button
                  v-if="isEditable"
                  @click="showCardControls = !showCardControls"
                  small
                  outline
                  :fill="showCardControls"
                  sortable-toggle=".sortable"
                  color="gray"
                  icon-size="12"
                  icon-ios="material:wrap_text"
                  icon-md="material:wrap_text"
                  icon-aurora="material:wrap_text"
                  style="margin-left: 8px">
                  &nbsp;Reorder
                </f7-button>
              </div>
              <div>
                <f7-list
                  media-list
                  class="homecards-list"
                  :sortable="isEditable"
                  :key="'cards-' + currentModelTab + cardListId"
                  @sortable:sort="reorderCard">
                  <f7-list-item
                    v-for="(card, idx) in cardGroups(currentModelTab, page).flat()"
                    media-item
                    :link="isEditable && !showCardControls ? '' : undefined"
                    @click="(ev) => (isEditable ? cardClicked(ev, card, idx) : null)"
                    :key="idx"
                    :title="card.separator || card.defaultTitle"
                    :footer="card.separator ? '(separator)' : card.key">
                    <template #content-start>
                      <f7-menu v-if="isEditable" class="configure-layout-menu">
                        <f7-menu-item icon-f7="list_bullet" dropdown>
                          <f7-menu-dropdown>
                            <f7-menu-dropdown-item v-if="!card.separator" @click="configureCard(card)" href="#" text="Card Settings" />
                            <f7-menu-dropdown-item v-if="!card.separator" @click="editCardCode(card)" href="#" text="Edit YAML" />
                            <f7-menu-dropdown-item v-if="card.separator" @click="renameCardSeparator(idx)" href="#" text="Rename" />
                            <f7-menu-dropdown-item divider />
                            <f7-menu-dropdown-item
                              v-if="!card.separator"
                              @click="addCardSeparator(idx)"
                              href="#"
                              text="Add Separator Before" />
                            <f7-menu-dropdown-item
                              v-if="card.separator"
                              @click="removeCardSeparator(idx)"
                              href="#"
                              text="Remove Separator" />
                          </f7-menu-dropdown>
                        </f7-menu-item>
                      </f7-menu>
                      <f7-checkbox
                        :checked="!isCardExcluded(card) ? true : null"
                        :disabled="!isEditable || card.separator !== undefined ? true : null"
                        class="margin-right" />
                    </template>
                  </f7-list-item>
                </f7-list>
              </div>
            </f7-col>
          </f7-block>

          <f7-block class="block-narrow homecards-settings">
            <f7-col>
              <div v-if="currentModelTab === 'locations'">
                <config-sheet
                  :parameterGroups="locationsTabParameters.props.parameterGroups || []"
                  :parameters="locationsTabParameters.props.parameters || []"
                  :configuration="modelTabConfig('locations')"
                  :f7router
                  :read-only="!isEditable"
                  @updated="dirty = true" />
              </div>

              <div v-if="currentModelTab === 'equipment'">
                <config-sheet
                  :parameterGroups="equipmentTabParameters.props.parameterGroups || []"
                  :parameters="equipmentTabParameters.props.parameters || []"
                  :configuration="modelTabConfig('equipment')"
                  :f7router
                  :read-only="!isEditable"
                  @updated="dirty = true" />
              </div>

              <div v-if="currentModelTab === 'properties'">
                <config-sheet
                  :parameterGroups="propertiesTabParameters.props.parameterGroups || []"
                  :parameters="propertiesTabParameters.props.parameters || []"
                  :configuration="modelTabConfig('properties')"
                  :f7router
                  :read-only="!isEditable"
                  @updated="dirty = true" />
              </div>
            </f7-col>
          </f7-block>
        </div>

        <div v-else :context="context" :key="pageKey">
          asdfsf
          <model-tab style="margin-bottom: 4rem" :context="context" :type="currentModelTab" :page="page" />
        </div>
      </f7-tab>

      <f7-tab id="code" :tab-active="currentTab === 'code'">
        <editor
          v-if="currentTab === 'code'"
          :style="{ opacity: previewMode ? '0' : '' }"
          class="page-code-editor"
          mode="application/vnd.openhab.uicomponent+yaml;type=home"
          :value="pageYaml"
          :readOnly="!isEditable"
          @input="onEditorInput"
          @save="save()" />
        <!-- <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->
        <div v-if="ready && previewMode" :context="context" :key="pageKey">
          <model-tab style="margin-bottom: 4rem" :context="context" :type="currentModelTab" :page="page" />
        </div>
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.home-editor
  .cards-title-row
    display: flex
    align-items: center
    justify-content: space-between
    margin-bottom: 0.5rem
  .page-code-editor.v-codemirror
    position absolute
    height calc(100% - var(--f7-navbar-height) - 2*var(--f7-toolbar-height))
  .yaml-message
    display block
    position absolute
    top 80%
    white-space pre-wrap
  .homecards-list
    margin-bottom 0
    padding-bottom calc(10px + var(--f7-block-margin-vertical))
    .item-link
      overflow inherit
      z-index inherit !important
    .icon-checkbox
      margin-right 10px
  .homecards-settings
    margin-top 0
    .parameter-group
      margin-top 0
    .parameter-group-title
      margin-top 0
</style>

<script>
import { nextTick, defineAsyncComponent } from 'vue'
import { f7 } from 'framework7-vue'

import NotEditableNotice from '@/components/util/not-editable-notice.vue'
import PageDesigner from '../pagedesigner-mixin'
import { resolveDefaultProps } from '../defaultProps'
import HomeCards from '../../../home/homecards-mixin'

import YAML from 'yaml'

import { useDirty } from '@/pages/useDirty'
import { useTabs } from '@/pages/useTabs'

import {
  OhHomePageDefinition,
  OhLocationsTabParameters,
  OhEquipmentTabParameters,
  OhPropertiesTabParameters,
  OhLocationCardParameters,
  OhEquipmentCardParameters,
  OhPropertyCardParameters
} from '@/assets/definitions/widgets/home'

import ConfigSheet from '@/components/config/config-sheet.vue'
import ModelTab from '@/pages/home/model-tab.vue'
import { useViewArea } from '@/js/composables/useViewArea.ts'
import { toFileYAMLSyntax, fromFileYAMLSyntax } from '@/pages/yaml-file-format'

const ConfigurableWidgets = {
  'oh-location-card': OhLocationCardParameters,
  'oh-equipment-card': OhEquipmentCardParameters,
  'oh-property-card': OhPropertyCardParameters
}

export default {
  mixins: [PageDesigner, HomeCards],
  components: {
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')),
    ConfigSheet,
    ModelTab,
    NotEditableNotice
  },
  props: {
    createMode: Boolean,
    pageCopy: Object,
    uid: String,
    f7router: Object,
    f7route: Object
  },
  setup() {
    useViewArea()
    const { dirty, dirtyIndicator } = useDirty('home-edit-page')
    const { currentTab, switchTab } = useTabs('design')

    return { dirty, dirtyIndicator, currentTab, switchTab }
  },
  data() {
    return {
      pageWidgetDefinition: OhHomePageDefinition(),
      locationsTabParameters: OhLocationsTabParameters(),
      equipmentTabParameters: OhEquipmentTabParameters(),
      propertiesTabParameters: OhPropertiesTabParameters(),
      currentModelTab: 'locations',
      modelTabs: [],
      showCardControls: false,
      cardListId: f7.utils.id(),
      page: {
        uid: 'home',
        component: 'oh-home-page',
        config: {
          label: 'Home Page'
        },
        slots: {
          locations: [{ component: 'oh-locations-tab', config: {}, slots: {} }],
          equipment: [{ component: 'oh-equipment-tab', config: {}, slots: {} }],
          properties: [{ component: 'oh-properties-tab', config: {}, slots: {} }]
        }
      }
    }
  },
  watch: {
    pageReady(val) {
      if (val) {
        this.modelTabs = [
          { value: 'locations', label: this.$t('home.locations.tab') },
          { value: 'equipment', label: this.$t('home.equipment.tab') },
          { value: 'properties', label: this.$t('home.properties.tab') }
        ]
      }
    }
  },
  methods: {
    addWidget(component, widgetType, parentContext, slot) {
      if (!this.isEditable) return
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
    getWidgetDefinition(componentType) {
      return ConfigurableWidgets[componentType] ? ConfigurableWidgets[componentType]() : null
    },
    modelTabComponentName(type) {
      if (type === 'locations') return 'oh-locations-tab'
      if (type === 'equipment') return 'oh-equipment-tab'
      if (type === 'properties') return 'oh-properties-tab'
      return null
    },
    modelTabComponent(type, createIfMissing = this.isEditable) {
      if (!this.page) return null
      if (!this.page.slots) {
        if (!createIfMissing) return null
        this.page.slots = {}
      }

      const componentName = this.modelTabComponentName(type)
      if (!componentName) return null

      const slotComponents = this.page.slots[type]
      let tabComponent = Array.isArray(slotComponents)
        ? slotComponents.find((component) => component?.component === componentName) || slotComponents[0]
        : null

      if (!tabComponent && createIfMissing) {
        tabComponent = { component: componentName, config: {}, slots: {} }
        this.page.slots[type] = [tabComponent]
      }

      if (!tabComponent) return null

      if (!tabComponent.config) {
        if (!createIfMissing) return null
        tabComponent.config = {}
      }
      if (!tabComponent.slots && createIfMissing) {
        tabComponent.slots = {}
      }

      return tabComponent
    },
    modelTabConfig(type) {
      return this.modelTabComponent(type)?.config || {}
    },
    ensureCardComponentExists(card) {
      const tabComponent = this.modelTabComponent(this.currentModelTab)
      if (!tabComponent) return
      if (!tabComponent.slots[card.key]) {
        tabComponent.slots[card.key] = [
          {
            component:
              this.currentModelTab === 'locations'
                ? 'oh-location-card'
                : this.currentModelTab === 'equipment'
                  ? 'oh-equipment-card'
                  : 'oh-property-card',
            config: {}
          }
        ]
      }
    },
    configureCard(card) {
      if (!this.isEditable || !card.key) return
      const tabComponent = this.modelTabComponent(this.currentModelTab, false)
      if (!tabComponent?.slots) return
      this.ensureCardComponentExists(card)
      return this.configureWidget(tabComponent.slots[card.key][0])
    },
    editCardCode(card) {
      if (!this.isEditable || !card.key) return
      const tabComponent = this.modelTabComponent(this.currentModelTab, false)
      if (!tabComponent?.slots) return
      this.ensureCardComponentExists(card)
      return this.editWidgetCode(tabComponent.slots[card.key][0])
    },
    addCardSeparator(idx) {
      if (!this.isEditable) return
      const tabConfig = this.modelTabConfig(this.currentModelTab)
      const orderedCards = this.cardGroups(this.currentModelTab, this.page)
        .flat()
        .map((e) => (e.separator ? e : e.key))
      orderedCards.splice(idx, 0, { separator: 'New Section' })
      tabConfig.cardOrder = orderedCards
      this.renameCardSeparator(idx)
    },
    renameCardSeparator(idx) {
      if (!this.isEditable) return
      const tabConfig = this.modelTabConfig(this.currentModelTab)
      const orderedCards = this.cardGroups(this.currentModelTab, this.page)
        .flat()
        .map((e) => (e.separator ? e : e.key))
      if (orderedCards[idx].separator) {
        f7.dialog.prompt(
          'Enter the title of the separator:',
          null,
          (title) => {
            orderedCards[idx].separator = title
            tabConfig.cardOrder = orderedCards
          },
          null,
          orderedCards[idx].separator
        )
      }
    },
    removeCardSeparator(idx) {
      if (!this.isEditable) return
      const tabConfig = this.modelTabConfig(this.currentModelTab)
      const orderedCards = this.cardGroups(this.currentModelTab, this.page)
        .flat()
        .map((e) => (e.separator ? e : e.key))
      orderedCards.splice(idx, 1)
      tabConfig.cardOrder = orderedCards
    },
    cardClicked(ev, card, idx) {
      if (!this.isEditable) return
      ev.cancelBubble = true
      let el = ev.target
      if (el.classList.contains('icon-checkbox')) {
        this.toggleCardDisplay(card)
        return
      }
      while (!el.classList.contains('media-item')) {
        if (el && el.classList.contains('menu')) return
        el = el.parentElement
      }
      if (card.separator) {
        this.renameCardSeparator(idx)
      }
      this.configureCard(card)
    },
    reorderCard(ev) {
      if (!this.isEditable) return
      const tabConfig = this.modelTabConfig(this.currentModelTab)
      const orderedCards = this.cardGroups(this.currentModelTab, this.page)
        .flat()
        .map((e) => (e.separator ? e : e.key))
      const newOrder = [...orderedCards]
      newOrder.splice(ev.to, 0, newOrder.splice(ev.from, 1)[0])
      tabConfig.cardOrder = newOrder
      this.cardListId = null
      this.showCardControls = false
      nextTick(() => {
        this.cardListId = f7.utils.id()
      })
    },
    isCardExcluded(card) {
      if (!card.key) return
      const page = this.page
      const type = this.currentModelTab
      const excludedCards =
        page &&
        page.slots &&
        page.slots[type] &&
        page.slots[type][0] &&
        page.slots[type][0].config &&
        page.slots[type][0].config.excludedCards
          ? page.slots[type][0].config.excludedCards
          : []
      const excludedIdx = excludedCards.indexOf(card.key)
      return excludedIdx >= 0
    },
    toggleCardDisplay(card) {
      if (!card.key) return
      if (!this.isEditable) return
      const page = this.page
      const type = this.currentModelTab
      const excludedCards =
        page &&
        page.slots &&
        page.slots[type] &&
        page.slots[type][0] &&
        page.slots[type][0].config &&
        page.slots[type][0].config.excludedCards
          ? page.slots[type][0].config.excludedCards
          : []
      const excludedIdx = excludedCards.indexOf(card.key)
      if (excludedIdx < 0) {
        this.page.slots[type][0].config.excludedCards = [...excludedCards, card.key]
      } else {
        this.page.slots[type][0].config.excludedCards.splice(excludedIdx, 1)
      }
    },
    toYaml() {
      this.pageYaml = toFileYAMLSyntax('pages', this.page)
    },
    fromYaml() {
      try {
        const updatedPage = fromFileYAMLSyntax('pages', this.pageYaml, this.page.uid)

        if (!updatedPage.slots) {
          // maintain compatibility with older versions of the page schema
          // where equipment, location, and property were directly on the page object instead of in a slots property
          // so that users can paste older YAML code without having to adjust the structure
          updatedPage.slots = {
            equipment: updatedPage.equipment || [],
            location: updatedPage.location || [],
            property: updatedPage.property || []
          }
        }

        this.page.config = updatedPage.config
        this.page.tags = updatedPage.tags || []
        this.page.props = resolveDefaultProps(updatedPage.props)
        this.page.slots = updatedPage.slots

        this.forceUpdate()
        return true
      } catch (e) {
        f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
