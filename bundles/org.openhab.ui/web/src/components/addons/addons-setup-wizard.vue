<template>
  <div style="width: 100%">
    <f7-list media-list style="margin-top: 0">
      <f7-list-item v-for="addon in shownAddons" :key="addon.uid" class="addons-setup-wizard" @click="toggleAddonSelection(addon)">
        <f7-block class="addon display-flex flex-direction-column">
          <f7-row no-gap>
            <div style="width: 100%">
              <f7-checkbox style="margin-right: 0.5rem" :checked="isAddonSelected(addon)" :disabled="addon.installed" />
              {{ addon.label }}
              <f7-link style="float: right" icon-f7="doc_text_search" :external="true" color="gray" target="_blank" :href="addon.link" />
            </div>
          </f7-row>
          <f7-row no-gap style="margin-top: 0.5rem; margin-bottom: 0">
            <div class="addon-description">
              <addon-logo class="logo-square" :addon="addon" size="54" />
              <span class="text" v-html="addonDescription(addon)" />
            </div>
          </f7-row>
        </f7-block>
      </f7-list-item>
    </f7-list>
    <f7-row v-if="enableAddonSelection">
      <f7-col width="100">
        <f7-button
          large
          icon-f7="bag_fill_badge_plus"
          icon-size="24"
          @click="openAddonSelectionModal"
          :text="t('setupwizard.' + type + '.selectAddons')" />
      </f7-col>
    </f7-row>

    <!-- Addon Selection Modal -->
    <f7-popup v-if="enableAddonSelection" :opened="showAddonSelectionModal" @popup:closed="closeAddonSelectionModal">
      <f7-page>
        <f7-navbar>
          <f7-nav-left>
            <f7-link popup-close :text="t('dialogs.close')" />
          </f7-nav-left>
          <f7-nav-title :title="t('setupwizard.' + type + '.selectAddons')" />
        </f7-navbar>
        <f7-searchbar
          v-model="addonSearchQuery"
          :placeholder="t('setupwizard.' + type + '.selectAddons.placeholder')"
          search-container=".addon-selection-list"
          search-item=".addon-selection-item"
          search-in=".addon-selection-label"
          disable-button-text="Cancel" />
        <f7-list media-list class="addon-selection-list">
          <f7-list-item
            v-for="addon in filterableAddons"
            :key="addon.uid"
            :checkbox="true"
            :checked="isAddonSelected(addon)"
            :disabled="addon.installed"
            @change="toggleAddonSelection(addon, $event)"
            class="addon-selection-item">
            <template #media>
              <addon-logo class="selection-logo" :addon="addon" size="40" />
            </template>
            <div class="addon-selection-label">
              <div class="addon-selection-title">{{ addon.label }}</div>
              <span class="addon-selection-description" v-html="addonDescription(addon)" />
            </div>
          </f7-list-item>
        </f7-list>
      </f7-page>
    </f7-popup>
  </div>
</template>

<style lang="stylus">
.addons-setup-wizard
  cursor pointer
  .addon
    margin-top: 0.5rem
    margin-bottom: 0.5rem
    padding: 0
    .addon-description
      width 100%
      display flex
      .logo-square
        background white
        border-radius 10%
        width 64px
        height 64px
        margin-top 5.5px
        display flex
        justify-content center
        align-items center
        .logo
          margin-left 0
          max-height 54px
          max-width 54px
      .text
        margin-left 1rem
        max-width calc(100% - 64px - 0.5rem)

.addon-selection-list.media-list .addon-selection-item
  label.item-checkbox.item-content
    align-items flex-start
    .icon-checkbox
      margin-top calc(0.3rem + 22px)
      align-self flex-start
  .item-media
    align-self flex-start
    margin-top 0.3rem
    .selection-logo
      background white
      border-radius 10%
      width 48px
      height 48px
      display flex
      justify-content center
      align-items center
      .logo
        margin-left 0
        max-height 40px
        max-width 40px
  .item-inner
    .addon-selection-label
      .addon-selection-title
        font-weight 500
      .addon-selection-description
        font-size 0.9em
        color #999
</style>

<script>
import AddonLogo from '@/components/addons/addon-logo.vue'

export default {
  props: {
    addons: Array,
    type: String,
    preSelectedAddons: Array,
    selectedAddons: Array,
    enableAddonSelection: Boolean,
    t: Function
  },
  emits: ['added', 'removed'],
  components: {
    AddonLogo
  },
  data () {
    return {
      localSelectedAddons: [...this.selectedAddons],
      shownAddons: [...(this.preSelectedAddons || [])],
      modalShownAddons: this.addons?.filter((a) => !a.installed && !this.isPreSelectedAddon(a)) || [],
      showAddonSelectionModal: false,
      addonSearchQuery: ''
    }
  },
  computed: {
    /**
     * Returns addons available for selection (excluding installed and pre-selected).
     * Filtered by search query if present.
     */
    filterableAddons () {
      const available = this.modalShownAddons
      if (!this.addonSearchQuery) {
        return available
      }
      const query = this.addonSearchQuery.toLowerCase()
      return available.filter((a) =>
        a.label.toLowerCase().includes(query) || a.uid.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    /**
     * Whether the given add-on is currently selected.
     * @param addon
     * @returns {boolean}
     */
    isAddonSelected (addon) {
      return this.localSelectedAddons.includes(addon)
    },
    /**
     * Whether the given add-on is pre-selected.
     * @param addon
     * @returns {boolean}
     */
    isPreSelectedAddon (addon) {
      return this.preSelectedAddons?.includes(addon)
    },
    /**
     * Returns the add-on description.
     * @param addon
     * @returns {string}
     */
    addonDescription (addon) {
      const line1 = this.t('setupwizard.addon.' + addon.uid + '.line1')
      const line2 = this.t('setupwizard.addon.' + addon.uid + '.line2')
      const hasLine1 = line1 !== 'setupwizard.addon.' + addon.uid + '.line1'
      const hasLine2 = line2 !== 'setupwizard.addon.' + addon.uid + '.line2'
      const descr = (hasLine1 ? line1 : '') + (hasLine2 ? '<br>' + line2 : '')
      return descr || addon.description || addon.uid + '<br>' + addon.version
    },
    /**
     * Toggles the selection of a single add-on.
     * @param addon
     */
    toggleAddonSelection (addon) {
      if (this.isAddonSelected(addon)) {
        const index = this.localSelectedAddons.findIndex((a) => addon.uid === a.uid)
        if (index > -1) {
          this.localSelectedAddons.splice(index, 1)
        }
        this.$emit('removed', addon)
      } else {
        this.localSelectedAddons.push(addon)
        this.$emit('added', addon)
        if (!this.shownAddons.includes(addon)) {
          this.shownAddons.push(addon)
        }
      }
    },
    /**
     * Opens the add-on selection modal.
     */
    openAddonSelectionModal () {
      this.showAddonSelectionModal = true
    },
    /**
     * Closes the add-on selection modal.
     */
    closeAddonSelectionModal () {
      this.showAddonSelectionModal = false
      this.addonSearchQuery = ''
    }
  }
}
</script>
