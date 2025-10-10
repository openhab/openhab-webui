<template>
  <div style="width: 100%">
    <f7-row v-if="enableAddonSelection">
      <f7-col width="100">
        <f7-button ref="selectAddons"
                   large
                   icon-f7="bag_fill_badge_plus"
                   icon-size="24"
                   @click="selectAddons"
                   :text="t('setupwizard.addons.selectAddons')" />
      </f7-col>
    </f7-row>
    <f7-list media-list>
      <f7-list-item v-for="addon in shownAddons" :key="addon.uid" class="addons-setup-wizard">
        <f7-block class="addon display-flex flex-direction-column">
          <f7-row no-gap>
            <div style="width: 100%">
              <f7-checkbox style="margin-right: 0.5rem"
                           :checked="selectedAddon(addon) ? true : null"
                           :disabled="addon.installed ? true : null"
                           @change="toggleAddonSelection(addon, $event)" />
              {{ addon.label }}
              <f7-link style="float: right"
                       icon-f7="doc_text_search"
                       :external="true"
                       color="gray"
                       target="_blank"
                       :href="addon.link" />
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
  </div>
</template>

<style lang="stylus">
.addons-setup-wizard
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
        margin-left 0.5rem
        max-width calc(100% - 64px - 0.5rem)
</style>

<script>
import { f7 } from 'framework7-vue'
import AddonLogo from '@/components/addons/addon-logo.vue'

import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n'

export default {
  props: {
    addons: Array,
    preSelectedAddons: Array,
    enableAddonSelection: Boolean
  },
  emits: ['update'],
  components: {
    AddonLogo
  },
  setup () {
    const { t, setLocaleMessage } = useI18n({ useScope: 'local' })
    loadLocaleMessages('setup-wizard', setLocaleMessage)
    return {
      t
    }
  },
  data () {
    return {
      shownAddons: [],
      selectedAddons: []
    }
  },
  methods: {
    /**
     * Whether the given add-on is currently selected.
     * @param addon
     * @returns {boolean}
     */
    selectedAddon (addon) {
      return this.selectedAddons.includes(addon)
    },
    /**
     * Whether the given add-on is pre-selected.
     * @param addon
     * @returns {boolean}
     */
    preSelectedAddon (addon) {
      return this.preSelectedAddons.includes(addon)
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
     * To be called by the change event of the <code>f7-checkbox</code> component.
     * @param addon
     * @param event
     */
    toggleAddonSelection (addon, event) {
      if (event.target.checked) {
        this.selectedAddons.push(addon)
      } else {
        this.selectedAddons = this.selectedAddons.filter((a) => a.uid !== addon.uid)
      }
      this.$emit('update', this.selectedAddons)
    },
    /**
     * Opens the add-on selection popup.
     */
    selectAddons () {
      if (this.autocompleteAddons) {
        this.autocompleteAddons.value = this.selectedAddons.map((a) => a.label)
        this.autocompleteAddons.open()
      }
    },
    /**
     * Updates the list of selected add-ons.
     * To be called by change event of the selection popup.
     * @param newSelected
     */
    updateAddonSelection (newSelected) {
      this.selectedAddons = newSelected
      this.$emit('update', this.selectedAddons)
    }
  },
  mounted () {
    // Update the list of shown and selected add-ons with the pre-selected add-ons.
    // Exclude add-ons that are in the list of pre-selected add-ons, but are not meant to be shown here (usually because these add-ons are handled in a separate step).
    if (Array.isArray(this.preSelectedAddons)) {
      this.shownAddons = this.selectedAddons = this.preSelectedAddons.filter((a) => this.addons.includes(a))
    }

    // Initialize the autocomplete, which provides the add-on selection popup, if add-on selection has been enabled.
    if (!this.enableAddonSelection) return
    this.autocompleteAddons = f7.autocomplete.create({
      openIn: 'popup',
      pageTitle: this.t('setupwizard.addons.selectAddons'),
      searchbarPlaceholder: this.t('setupwizard.addons.selectAddons.placeholder'),
      openerEl: this.$refs.selectAddons,
      multiple: true,
      requestSourceOnOpen: true,
      source: (query, render) => {
        // Exclude installed and pre-selected add-ons from the selection popup.
        if (query.length === 0) {
          render(self.addons.filter((a) => !a.installed && !self.preSelectedAddon(a)).map((a) => a.label))
        } else {
          render(
            self.addons
              .filter(
                (a) => !a.installed && !self.preSelectedAddon(a) && (a.label.toLowerCase().indexOf(query.toLowerCase()) >= 0 || a.uid.toLowerCase().indexOf(query.toLowerCase()) >= 0))
              .map((a) => a.label))
        }
      },
      on: {
        change (value) {
          const selected = value.map((label) => self.addons.find((a) => a.label === label))
          // If we added addons, keep them visible on the main list, even if we deselect them again later.
          self.shownAddons = [...new Set(self.selectedAddons.concat(selected))]
          self.updateAddonSelection(selected)
        }
      }
    })

    // Add event listener for locale change
    f7.on('localeChange', () => {
      if (this.autocompleteAddons) {
        this.autocompleteAddons.params.pageTitle = this.t('setupwizard.addons.selectAddons')
        this.autocompleteAddons.params.searchbarPlaceholder = this.t('setupwizard.addons.selectAddons.placeholder')
        this.autocompleteAddons.params.searchbarDisableText = this.t('dialogs.cancel')
        this.autocompleteAddons.params.popupCloseLinkText = this.t('dialogs.close')
        this.autocompleteAddons.params.pageBackLinkText = this.t('dialogs.back')
        this.autocompleteAddons.params.notFoundText = this.t('dialogs.search.nothingFound')
      }
    })
  }
}
</script>
