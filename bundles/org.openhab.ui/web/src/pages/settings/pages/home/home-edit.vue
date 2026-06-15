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
                    :link="showCardControls ? undefined : ''"
                    @click="(ev) => cardClicked(ev, card, idx)"
                    :key="idx"
                    :title="card.separator || card.defaultTitle"
                    :footer="card.separator ? '(separator)' : card.key">
                    <template #content-start>
                      <f7-menu class="configure-layout-menu">
                        <f7-menu-item icon-f7="list_bullet" dropdown>
                          <f7-menu-dropdown>
                            <f7-menu-dropdown-item v-if="!card.separator" @click="configureCard(card)" href="#" text="Card Settings" />
                            <f7-menu-dropdown-item
                              v-if="!card.separator"
                              @click="editCardCode(card)"
                              href="#"
                              :text="isEditable ? 'Edit YAML' : 'View YAML'" />
                            <template v-if="isEditable">
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
                            </template>
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
                  :configuration="page.slots.locations[0].config"
                  :f7router
                  :read-only="!isEditable"
                  @updated="dirty = true" />
              </div>

              <div v-if="currentModelTab === 'equipment'">
                <config-sheet
                  :parameterGroups="equipmentTabParameters.props.parameterGroups || []"
                  :parameters="equipmentTabParameters.props.parameters || []"
                  :configuration="page.slots.equipment[0].config"
                  :f7router
                  :read-only="!isEditable"
                  @updated="dirty = true" />
              </div>

              <div v-if="currentModelTab === 'properties'">
                <config-sheet
                  :parameterGroups="propertiesTabParameters.props.parameterGroups || []"
                  :parameters="propertiesTabParameters.props.parameters || []"
                  :configuration="page.slots.properties[0].config"
                  :f7router
                  :read-only="!isEditable"
                  @updated="dirty = true" />
              </div>
            </f7-col>
          </f7-block>
        </div>

        <div v-else :context="context" :key="pageKey">
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
  .page-code-editor
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
import HomeCards from '../../../home/homecards-mixin'

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

const ModelTabComponents = {
  locations: 'oh-locations-tab',
  equipment: 'oh-equipment-tab',
  properties: 'oh-properties-tab'
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
        this.normalizePageSlots()
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
    getCardComponent(modelComponent, card) {
      const defaultCardComponent = {
        component:
          modelComponent.component === 'oh-locations-tab'
            ? 'oh-location-card'
            : modelComponent.component === 'oh-equipment-tab'
              ? 'oh-equipment-card'
              : 'oh-property-card',
        config: {}
      }

      if (!Array.isArray(modelComponent.slots[card.key]) || modelComponent.slots[card.key].length === 0) {
        if (!this.isEditable) {
          // if not editable, return a default config for preview purposes without modifying the actual page data
          return defaultCardComponent
        } else {
          modelComponent.slots[card.key] = [defaultCardComponent]
        }
      }
      return modelComponent.slots[card.key][0]
    },
    configureCard(card) {
      if (!card.key) return
      if (
        !this.page.slots[this.currentModelTab] ||
        !this.page.slots[this.currentModelTab][0] ||
        !this.page.slots[this.currentModelTab][0].slots
      )
        return

      const cardComponent = this.getCardComponent(this.page.slots[this.currentModelTab][0], card)
      return this.configureWidget(cardComponent)
    },
    editCardCode(card) {
      if (!card.key) return
      if (
        !this.page.slots[this.currentModelTab] ||
        !this.page.slots[this.currentModelTab][0] ||
        !this.page.slots[this.currentModelTab][0].slots
      )
        return
      const cardComponent = this.getCardComponent(this.page.slots[this.currentModelTab][0], card)
      return this.editWidgetCode(cardComponent)
    },
    addCardSeparator(idx) {
      if (!this.isEditable) return
      const orderedCards = this.cardGroups(this.currentModelTab, this.page)
        .flat()
        .map((e) => (e.separator ? e : e.key))
      orderedCards.splice(idx, 0, { separator: 'New Section' })
      this.page.slots[this.currentModelTab][0].config.cardOrder = orderedCards
      this.renameCardSeparator(idx)
    },
    renameCardSeparator(idx) {
      if (!this.isEditable) return
      const orderedCards = this.cardGroups(this.currentModelTab, this.page)
        .flat()
        .map((e) => (e.separator ? e : e.key))
      if (orderedCards[idx].separator) {
        f7.dialog.prompt(
          'Enter the title of the separator:',
          null,
          (title) => {
            orderedCards[idx].separator = title
            this.page.slots[this.currentModelTab][0].config.cardOrder = orderedCards
          },
          null,
          orderedCards[idx].separator
        )
      }
    },
    removeCardSeparator(idx) {
      if (!this.isEditable) return
      const orderedCards = this.cardGroups(this.currentModelTab, this.page)
        .flat()
        .map((e) => (e.separator ? e : e.key))
      orderedCards.splice(idx, 1)
      this.page.slots[this.currentModelTab][0].config.cardOrder = orderedCards
    },
    cardClicked(ev, card, idx) {
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
      const orderedCards = this.cardGroups(this.currentModelTab, this.page)
        .flat()
        .map((e) => (e.separator ? e : e.key))
      const newOrder = [...orderedCards]
      newOrder.splice(ev.to, 0, newOrder.splice(ev.from, 1)[0])
      this.page.slots[this.currentModelTab][0].config.cardOrder = newOrder
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
    normalizePageSlots() {
      // ensure page.slots has the expected structure with equipment, locations, and properties arrays for v-model bindings, even if the YAML doesn't include them
      if (!this.page.slots) {
        this.page.slots = {}
      }

      ;['equipment', 'locations', 'properties'].forEach((slot) => {
        if (!Array.isArray(this.page.slots[slot])) {
          this.page.slots[slot] = []
        }

        if (this.page.slots[slot].length === 0) {
          this.page.slots[slot].push({})
        }

        if (this.page.slots[slot][0].component !== ModelTabComponents[slot]) {
          this.page.slots[slot][0].component = ModelTabComponents[slot]
        }

        if (!this.page.slots[slot][0].config) {
          this.page.slots[slot][0].config = {}
        }

        if (!this.page.slots[slot][0].slots) {
          this.page.slots[slot][0].slots = {}
        }
      })
    },
    toYaml() {
      this.pageYaml = toFileYAMLSyntax('pages', this.page)
    },
    fromYaml() {
      try {
        const updatedPage = fromFileYAMLSyntax('pages', this.pageYaml, this.page.uid)

        if (!updatedPage.slots) {
          // maintain compatibility with older versions of the page schema
          // where equipment, locations, and properties were directly on the page object instead of in a slots property
          // so that users can paste older YAML code without having to adjust the structure
          updatedPage.slots = {
            equipment: updatedPage.equipment || [],
            locations: updatedPage.locations || [],
            properties: updatedPage.properties || []
          }
        }

        this.page.config = updatedPage.config
        this.page.tags = updatedPage.tags || []
        this.page.slots = updatedPage.slots
        this.normalizePageSlots()

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
