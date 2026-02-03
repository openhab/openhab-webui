<template>
  <f7-page
    no-toolbar
    no-navbar
    no-swipeback
    no-swipe-panel
    login-screen
    class="setup-wizard"
    @page:init="pageBeforeIn"
    @page:beforeout="pageBeforeOut">
    <f7-tabs animated>
      <!-- Intro Tab -->
      <f7-tab id="intro" tab-active @tab:show="handleTabShow">
        <tab-header
          :image="introLogo"
          :prev="prev"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t"
          @back="handlerPrev(prev)"
          @close="skipSetup" />
        <f7-list form style="margin-top: 4rem" v-if="i18nReady">
          <f7-list-item
            :title="t('setupwizard.language')"
            smart-select
            :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true }">
            <select name="language" v-model="language">
              <option disabled value="" />
              <option v-for="option in availableLanguages" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </f7-list-item>
          <f7-list-item
            :title="t('setupwizard.region')"
            smart-select
            :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true }">
            <select name="region" v-model="region">
              <option disabled value="" />
              <option v-for="option in availableRegions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </f7-list-item>
          <f7-list-item
            :title="t('setupwizard.timezone')"
            smart-select
            :smart-select-params="{ openIn: 'popup', searchbar: true, virtualList: true, closeOnSelect: true, virtualListHeight: theme.aurora ? 32 : undefined, }">
            <select name="timezone" v-model="timezone">
              <option disabled value="" />
              <option v-for="option in availableTimezones" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </f7-list-item>
        </f7-list>
        <f7-block class="display-flex flex-direction-column padding">
          <div>
            <f7-button v-if="next" large fill color="blue" :text="t('setupwizard.beginSetup')" @click="handlerNext(next)" />
            <f7-button v-if="skip" large color="blue" :text="t('setupwizard.skipSetup')" @click="handlerNext(skip)" />
          </div>
        </f7-block>
        <f7-list>
          <f7-list-item :title="t('setupwizard.short')">
            <template #after>
              <f7-toggle v-model:checked="setupWizardShort" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-tab>

      <f7-tab id="location" @tab:show="handleTabShow">
        <tab-header
          :icon="wizardSteps[currentStep].icon"
          :title="t('setupwizard.' + currentStep + '.title')"
          :prev="prev"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t"
          @back="handlerPrev(prev)"
          @close="skipSetup" />
        <f7-list>
          <f7-list-group>
            <parameter-location
              :value="updatedLocation"
              :config-description="{ label: t('setupwizard.' + currentStep + '.parameterLabel'), name: 'Location' }"
              :f7router
              @input="(value) => updatedLocation = value"
              :placeholder="t('setupwizard.' + currentStep + '.placeholder')" />
          </f7-list-group>
        </f7-list>
        <f7-block class="padding">
          <f7-row>
            <f7-col width="100">
              <f7-button
                large
                icon-f7="location_fill"
                icon-size="24"
                @click="getCurrentPosition()"
                :text="t('setupwizard.' + currentStep + '.retrieveFromDevice')" />
            </f7-col>
          </f7-row>
          <f7-block-footer>
            <small>{{ t('setupwizard.' + currentStep + '.footer') }}</small>
          </f7-block-footer>
        </f7-block>
        <f7-block class="display-flex flex-direction-column padding" v-if="networksReady">
          <div>
            <f7-button v-if="updatedLocation && next" large fill color="blue" :text="t('setupwizard.' + currentStep + '.next')" @click="handlerNext(next)" />
            <f7-button v-if="skip" large color="blue" :text="t('setupwizard.skip')" class="margin-top" @click="handlerNext(skip)" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="network" @tab:show="handleTabShow">
        <tab-header
          :icon="wizardSteps[currentStep].icon"
          :title="t('setupwizard.' + currentStep + '.title')"
          :prev="prev"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t"
          @back="handlerPrev(prev)"
          @close="skipSetup" />
        <f7-list>
          <f7-list-group>
            <parameter-options
              v-if="networksReady"
              class="network"
              :config-description="networkConfigDescription"
              :value="network"
              @input="(value) => changeNetwork(value)" />
          </f7-list-group>
        </f7-list>
        <f7-block class="display-flex flex-direction-column padding">
          <div>
            <f7-button v-if="network && next" large fill color="blue" :text="t('setupwizard.' + currentStep + '.next')" @click="handlerNext(next)" />
            <f7-button v-if="skip" large color="blue" :text="t('setupwizard.skip')" class="margin-top" @click="handlerNext(skip)" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="concepts-text" @tab:show="handleTabShow">
        <tab-header
          :icon="wizardSteps[currentStep].icon"
          :title="t('setupwizard.' + currentStep + '.title')"
          :prev="prev"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t"
          @back="handlerPrev(prev)"
          @close="skipSetup" />
        <f7-login-screen-title>
          <div class="padding">
            <img style="width: 85%" :src="conceptsImage" />
          </div>
        </f7-login-screen-title>
        <f7-block>
          {{ t('setupwizard.' + currentStep + '.body1') }}
          {{ t('setupwizard.' + currentStep + '.body2') }}
          <br /><br />
          <a class="text-color-blue external" target="_blank" href="https://www.openhab.org/docs/concepts/">
            {{ t('setupwizard.documentationLink') }}</a
          >
          <br /><br />
          {{ t('setupwizard.' + currentStep + '.nextDescription') }}
        </f7-block>
        <f7-block class="display-flex flex-direction-column padding">
          <div>
            <f7-button
              v-if="next" large fill color="blue" :text="t('setupwizard.next')" @click="handlerNext(next)" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab v-for="addonType in preSelectingAddonTypes" :key="addonType" :id="addonType" @tab:show="handleTabShow">
        <tab-header
          :icon="wizardSteps[currentStep].icon"
          :title="t('setupwizard.' + currentStep + '.title')"
          :prev="prev"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t"
          @back="handlerPrev(prev)"
          @close="skipSetup" />
        <f7-block class="padding">
          <f7-block v-if="waitingForAddonSuggestions">
            <div class="display-flex justify-content-center margin-bottom">
              <f7-progressbar id="suggestions-progress-bar-addons" :progress="0" />
            </div>
            <div>{{ t('setupwizard.addons.suggestionsWaitMessage') }}</div>
          </f7-block>
          <addons-setup-wizard
            v-if="addonSuggestionsReady"
            :enableAddonSelection="true"
            :addons="addonsByType[addonType]"
            :type="addonType"
            :preSelectedAddons="selectedAddons"
            @update="updateAddonSelection"
            :t />
          <f7-block-footer class="margin-bottom">
            <small>{{ t('setupwizard.' + currentStep + '.footer') }}</small>
          </f7-block-footer>
          <div>
            <f7-button
              v-if="addonSuggestionsReady && (toInstallAddonsByType[addonType]?.length > 0) && next"
              large
              fill
              color="blue"
              :text="t('setupwizard.' + currentStep + '.next', toInstallAddonsByType[addonType]?.length)"
              @click="handlerNext(next)" />
            <f7-button v-if="skip" large color="blue" :text="t('setupwizard.' + currentStep + '.skip')" class="margin-top" @click="handlerNext(skip)" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="wait" @tab:show="handleTabShow">
        <f7-block>
          <f7-login-screen-title class="text-color-gray">
            {{ t('setupwizard.addons.pleaseWait') }}
          </f7-login-screen-title>
          <div class="display-flex justify-content-center flex-direction-column text-align-center text-color-gray" style="margin-top: 4rem">
            <div class="display-flex justify-content-center margin-bottom">
              <f7-preloader size="24" />
            </div>
            <div>{{ t('setupwizard.addons.waitMessage') }}</div>
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="persistence-config" @tab:show="handleTabShow">
        <tab-header
          :icon="wizardSteps[currentStep].icon"
          :title="t('setupwizard.' + currentStep + '.title')"
          :prev="prev"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t"
          @back="handlerPrev(prev)"
          @close="skipSetup" />
        <persistence-config-setup-wizard :addons="addons" :addonsReady="persistenceAddonsReady" :confirm="persistenceConfigConfirm" :t />
        <f7-block-footer class="margin-bottom">
          <small>{{ t('setupwizard.' + currentStep + '.footer') }}</small>
        </f7-block-footer>
        <f7-block class="padding">
          <div>
            <f7-button v-if="next" large fill color="blue" :text="t('setupwizard.' + currentStep + '.config')" @click="handlerNext(next)" />
            <f7-button
              v-if="skip"
              large
              color="blue"
              :text="t('setupwizard.' + currentStep + '.configLater')"
              class="margin-top"
              @click="handlerNext(skip)" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="finish" @tab:show="handleTabShow">
        <tab-header
          :title="t('setupwizard.welcome.title')"
          :prev="prev"
          @back="handlerPrev(prev)"
          @close="skipSetup" />
        <f7-block v-if="bindingsInstalled">
          {{ t('setupwizard.welcome.bindingsInstalled') }}
        </f7-block>
        <f7-block class="display-flex flex-direction-column padding" style="margin-top: 4rem">
          <div>
            <f7-button v-if="next" large color="blue" :text="t('setupwizard.welcome.getStarted')" @click="handlerNext(next)" />
          </div>
        </f7-block>
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.setup-wizard
  .intro-logo
    margin-top 3rem
    margin-bottom 2rem
    width 240px
  .page-content
    margin-top inherit
  .network
    --f7-list-in-list-padding-left 0
    .block-header
      .item-label
        text-align left
        margin-left 0 !important
        margin-right 0 !important
  .block.padding
    margin-top 0
  .block.block-strong
    margin-bottom 0

.tab-active
  scroll-snap-align start
  overflow-y auto
  overscroll-behavior-y contain

.view-master-detail
  .setup-wizard
    .intro-logo
      visibility hidden
      // margin-top 25%
    .tab
      padding-top 10%
</style>

<script>
import { nextTick, defineAsyncComponent } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapWritableState } from 'pinia'

import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n'

import introLogo from '@/images/openhab-logo.svg'
import conceptsImage from '@/images/concepts.png'

import AddonsSetupWizard from '@/components/addons/addons-setup-wizard.vue'
import PersistenceConfigSetupWizard from '@/components/persistence/persistence-config-setup-wizard.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

export default {
  props: {
    f7router: Object
  },
  components: {
    'parameter-location': defineAsyncComponent(() => import('@/components/config/controls/parameter-location.vue')),
    'parameter-options': defineAsyncComponent(() => import('@/components/config/controls/parameter-options.vue')),
    'tab-header': defineAsyncComponent(() => import('./setup-wizard-tab-header.vue')),
    AddonsSetupWizard,
    PersistenceConfigSetupWizard
  },
  setup () {
    const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })
    loadLocaleMessages('setup-wizard', mergeLocaleMessage)
    return { t, theme, mergeLocaleMessage, introLogo, conceptsImage }
  },
  data () {
    return {
      i18nReady: false,

      // wizard sequence of steps and functions to be called when changing step
      wizardSteps: {
        'intro': {
          next: { handler: () => this.beginSetup(), step: 'location' },
          skip: { handler: () => this.skipSetup() }
        },
        'location': {
          icon: 'map_pin_ellipse',
          show: { handler: () => this.updatedLocation = this.location },
          prev: { step: 'intro' },
          next: { handler: () => this.setLocation(), step: 'network' },
          skip: { step: 'network' }
        },
        'network': {
          icon: 'wifi',
          show: { handler: () => { if (!this.multiNetwork) this.skipStep() } },
          prev: { step: 'location' },
          next: { handler: () => this.setNetwork(), step: 'concepts-text' },
          skip: { step: 'concepts-text' }
        },
        'concepts-text': {
          icon: 'lightbulb',
          skipShort: true,
          prev: { step: 'network' },
          next: { step: 'binding' }
        },
        'binding': {
          icon: 'circle_grid_hex_fill',
          link: 'https://www.openhab.org/addons/#binding',
          show: { handler: () => this.getSuggestedAddons() },
          prev: { handler: () => this.skipAddons(), step: 'network' },
          next: { handler: () => this.selectAddons(), step: 'automation' },
          skip: { handler: () => this.skipAddons(), step: 'automation' }
        },
        'automation': {
          icon: 'wand_stars',
          link: 'https://www.openhab.org/addons/#automation',
          show: { handler: () => this.getSuggestedAddons() },
          prev: { handler: () => this.skipAddons(), step: 'binding' },
          next: { handler: () => this.selectAddons(), step: 'ui' },
          skip: { handler: () => this.skipAddons(), step: 'ui' }
        },
        'ui': {
          icon: 'play_rectangle',
          link: 'https://www.openhab.org/addons/#ui',
          show: { handler: () => this.getSuggestedAddons() },
          prev: { handler: () => this.skipAddons(), step: 'automation' },
          next: { handler: () => this.selectAddons(), step: 'persistence' },
          skip: { handler: () => this.skipAddons(), step: 'persistence' }
        },
        'persistence': {
          icon: 'download_circle',
          link: 'https://www.openhab.org/addons/#persistence',
          show: { handler: () => this.getSuggestedAddons() },
          prev: { handler: () => this.skipAddons(), step: 'ui' },
          next: { handler: () => { this.selectAddons() }, step: 'wait' },
          skip: { handler: () => { this.skipAddons() }, step: 'wait' }
        },
        'wait': {
          show: { handler: () => { this.installAddons(); this.skipStep() } },
          skip: { step: 'persistence-config' }
         },
        'persistence-config': {
          icon: 'download_circle',
          show: { handler: () => { if (!this.persistenceInstalled) this.skipStep() } },
          prev: { step: 'persistence' },
          next: { handler: () => this.persistenceConfig(), step: 'finish' },
          skip: { step: 'finish' }
        },
        'finish': {
          prev: { step: 'intro' },
          next: { handler: () => this.finish() }
        }
      },
      currentStep: 'intro',
      skipStepDirection: 'skip',

      availableLanguages: null,
      availableRegions: null,
      availableTimezones: null,
      language: null,
      region: null,
      timezone: null,
      location: null,
      updatedLocation: null,
      networksReady: false,
      networkConfigDescription: null,
      network: null,
      networkChanged: false,

      waitingForAddonSuggestions: false,
      waitingTimeout: null,
      addonSuggestionsReady: false,
      addons: [],
      // all recommended addons, pre-defined
      recommendedAddons: ['binding-astro', 'automation-jsscripting', 'ui-basic', 'misc-openhabcloud', 'persistence-rrd4j', 'persistence-mapdb', 'persistence-inmemory'],
      // addon types that can be selected in wizard
      preSelectingAddonTypes: ['binding', 'automation', 'ui', 'persistence'],
      // all recommended and suggested addons, list created in code
      selectedAddons: [],
      oldSelection: [],
      installingAddons: false,
      bindingsInstalled: false,
      persistenceAddonsReady: false,

      persistenceConfigConfirm: false
    }
  },
  computed: {
    show () {
      if (!this.currentStep) return null
      return this.wizardSteps[this.currentStep].show || null
    },
    prev () {
      if (!this.currentStep) return null
      return this.wizardSteps[this.currentStep].prev || null
    },
    next () {
      if (!this.currentStep) return null
      return this.wizardSteps[this.currentStep].next || null
    },
    skip () {
      if (!this.currentStep) return null
      return this.wizardSteps[this.currentStep].skip || null
    },
    locale () {
      if (!this.language) return null
      if (!this.region) return this.language
      return this.language + '-' + this.region.toLowerCase()
    },
    multiNetwork () {
      return (this.networkConfigDescription?.options?.length > 1)
    },
    toInstallAddons () {
      return this.addons.filter((a) => this.selectedAddons.includes(a) && !a.installed)
    },
    addonsByType () {
      const addons = {}
      this.addons.forEach((a) => {
        let type = a.type
        // Special case, we want to show the openHAB cloud connector in the ui addon step for this wizard.
        if (a.uid === 'misc-openhabcloud' && this.recommendedAddons.includes('misc-openhabcloud')) type = 'ui'
        if (!addons[type]) addons[type] = []
        addons[type].push(a)
      })
      return addons
    },
    toInstallAddonsByType () {
      const addons = {}
      this.preSelectingAddonTypes.forEach((t) => {
        addons[t] = this.toInstallAddons.filter((a) => (this.addonsByType[t].includes(a)))
      })
      return addons
    },
    recommendedAddonsByType () {
      const addons = {}
      Object.keys(this.addonsByType).forEach((type) => {
        addons[type] = this.addonsByType[type].filter((a) => this.recommendedAddons.includes(a.uid))
      })
      return addons
    },
    persistenceInstalled () {
      return this.addons.find((a) => a.type === 'persistence' && a.installed)
    },
    ...mapWritableState(useUIOptionsStore, {
      setupWizardShort: 'setupWizardShort'
    })
  },
  watch: {
    locale (val) {
      useRuntimeStore().locale = this.locale
      loadLocaleMessages('setup-wizard', this.mergeLocaleMessage)
      // watch on useRuntimeStore().locale in App.vue will update globals
    }
  },
  methods: {
    handleTabShow (arg1, arg2) {
      // Framework7 tab:show can pass (el) or (event, el) - handle both
      const tabEl = arg2 || arg1
      const id = tabEl?.id || tabEl?.target?.id
      if (id) this.currentStep = id
      // Scroll the active tab to top
      nextTick(() => {
        const activeTab = this.$el?.querySelector('#' + id)
        if (activeTab) {
          activeTab.scrollTop = 0
        }
        this.show?.handler?.()
      })
    },
    handlerPrev (prev) {
      this.skipStepDirection = 'prev'
      this.handler(prev)

    },
    handlerNext (next) {
      this.skipStepDirection = 'skip'
      this.handler(next)
    },
    handler (direction) {
      if (!direction) return
      direction?.handler?.()
      let nextStep = direction?.step
      // skip setup tabs marked as skipShort when short wizard is selected
      if (this.setupWizardShort) {
        while (nextStep && this.wizardSteps[nextStep].skipShort) {
          nextStep = this.wizardSteps[nextStep].next?.step
        }
      }
      if (nextStep) {
        f7.tab.show('#' + nextStep)
      }
    },
    skipStep () {
      this.handler(this.wizardSteps[this.currentStep][this.skipStepDirection])
    },
    beginSetup () {
      this.$oh.api.put('/rest/services/org.openhab.i18n/config', {
        language: this.language,
        region: this.region,
        timezone: this.timezone
      }).then(() => {
        f7.emit('localeChanged')
      })
    },
    getCurrentPosition () {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.updatedLocation = position.coords.latitude + ',' + position.coords.longitude
        }, (error) => {
          f7.dialog.alert(
            error.message,
            this.t('setupwizard.location.retrieveFromDevice.error')
          )
        })
      } else {
        f7.dialog.alert(
          this.t('setupwizard.location.retrieveFromDevice.notAvailable.message'),
          this.t('setupwizard.location.retrieveFromDevice.notAvailable.title')
        )
      }
    },
    skipSetup () {
      f7.dialog.confirm(
        this.t('setupwizard.skipSetup.confirm.message'),
        this.t('setupwizard.skipSetup.confirm.title'),
        () => {
          f7.panel.get('left').enableVisibleBreakpoint()
          nextTick(() => {
            f7.views.main.router.navigate('/', {
              transition: 'f7-circle',
              clearPreviousHistory: true
            })
          })
        }
      )
    },
    setLocation () {
      this.location = this.updatedLocation
      this.$oh.api.put('/rest/services/org.openhab.i18n/config', {
        location: this.location
      })
    },
    changeNetwork (newNetwork) {
      if (newNetwork && (this.network !== newNetwork)) {
        this.networkChanged = true
        this.network = newNetwork
      }
    },
    setNetwork () {
      if (this.networkChanged) {
        this.$oh.api.put('/rest/services/org.openhab.network/config', {
          primaryAddress: this.network
        })
      }
      this.addonSuggestionsReady = false
    },
    /**
     * Manages the loading process of suggested add-ons.
     *
     * If the network config has changed, first wait 10 seconds before loading add-on suggestions to give
     * the server enough time to discover suggestions, otherwise load suggestions instantaneous.
     * Also handle the loading progress bar.
     */
    getSuggestedAddons () {
      if (this.addonSuggestionsReady) return
      let progress = 0
      const loading = () => {
        this.waitingTimeout = setTimeout(() => {
          const progressBefore = progress
          progress += 10
          f7.progressbar.set('#suggestions-progress-bar-persistence', progress)
          f7.progressbar.set('#suggestions-progress-bar-addons', progress)
          if (progressBefore < 100) {
            loading()
          } else {
            this.getSuggestions()
            this.waitingForAddonSuggestions = false
          }
        }, 1000)
      }
      if (this.networkChanged) {
        // wait 10 seconds for suggestions to refresh after network scan
        this.networkChanged = false
        this.waitingForAddonSuggestions = true
        f7.progressbar.set('#suggestions-progress-bar-persistence', 0)
        f7.progressbar.set('#suggestions-progress-bar-addons', 0)
        clearTimeout(this.waitingTimeout)
        loading()
      } else if (!this.waitingForAddonSuggestions) {
        this.getSuggestions()
      }
    },
    /**
     * Load and process the list of suggested add-ons.
     *
     * Sets <code>this.addonSuggestionsReady</code> to <code>true</code> once addon-suggestions are ready.
     *
     * @emits addonSuggestionsReady once add-on suggestions are ready
     */
    getSuggestions () {
      this.$oh.api.get('/rest/addons/suggestions').then((suggestions) => {
        const suggestedAddons = suggestions.flatMap((s) => s.id).filter((id) => !this.recommendedAddons.includes(id))
        // Keep the recommended addons first
        this.selectedAddons = [
          ...this.addons.filter((a) => this.recommendedAddons.includes(a.uid)).sort((a, b) => a.uid.toUpperCase().localeCompare(b.uid.toUpperCase())),
          ...this.addons.filter((a) => suggestedAddons.includes(a.id)).sort((a, b) => a.uid.toUpperCase().localeCompare(b.uid.toUpperCase()))
        ]
        this.oldSelection = [...this.selectedAddons]
        this.addonSuggestionsReady = true
        f7.emit('addonSuggestionsReady')
      })
    },
    selectAddons () {
      if (this.addonSuggestionsReady) {
        this.oldSelection = [...this.selectedAddons]
      } else {
        f7.once('addonSuggestionsReady', () => {
        this.oldSelection = [...this.selectedAddons]
        })
      }
    },
    skipAddons () {
      if (this.addonSuggestionsReady) {
        this.selectedAddons = [...this.oldSelection]
      } else {
        f7.once('addonSuggestionsReady', () => {
          this.selectedAddons = [...this.oldSelection]
        })
      }
    },
    preSelectedAddon (addon) {
      return this.preSelectingAddonTypes.includes(addon.type)
    },
    updateAddonSelection (newSelected) {
      const oldSelected = this.selectedAddons
      this.selectedAddons = newSelected
      console.debug('Updating add-on selection:', oldSelected.map((a) => a.uid), newSelected.map((a) => a.uid))
      nextTick(() => {
        console.log('Add-ons to install:', this.toInstallAddons.map((a) => a.uid))
      })
    },
    installAddons () {
      const checkInterval = 2 // check the add-ons statuses every 2 seconds

      if (this.toInstallAddons.filter((a) => a.type === 'persistence').length === 0) this.persistenceAddonsReady = true

      const addonsCount = this.toInstallAddons.length
      if (addonsCount === 0)  return

      this.installingAddons = true

      this.bindingsInstalled = this.toInstallAddons.find((a) => (a.type === 'binding'))
      let progress = 0

      const progressDialog = f7.dialog.progress(this.t('setupwizard.addons.installing'), progress)

      const checkAddonStatus = (addon) => {
        return new Promise((resolve, reject) => {
          this.$oh.api.get('/rest/addons/' + addon.uid).then((data) => {
            if (data.installed) {
              console.log(`Add-on ${addon.uid} installed!`)
              resolve(data)
            } else {
              console.log(`Add-on ${addon.uid} still not installed. Trying again in ${checkInterval} secs...`)
              reject(data)
            }
          }).catch((err) => {
            console.log(`Error while querying API to check addon: ${addon.uid}: ${err}'. Trying again in ${checkInterval} secs...`)
            reject(err)
          })
        })
      }

      const installNextAddon = () => {
        // no more add-ons to install => go to next screen
        if (!this.toInstallAddons.length) {
          progressDialog.close()
          progressDialog.destroy()
          this.persistenceAddonsReady = true
          return
        }

        // check if all persistence add-ons have already been installed, so the persistence config tab can be prepared
        if (this.toInstallAddons.filter((a) => a.type === 'persistence').length === 0) this.persistenceAddonsReady = true
        
        // install next add-on
        progressDialog.setText(this.t('setupwizard.addons.progress', { current: addonsCount - this.toInstallAddons.length + 1, total: addonsCount }))
        progressDialog.setProgress(((addonsCount - this.toInstallAddons.length + 1) / addonsCount) * 100)
        const addon = this.toInstallAddons[0]
        console.log('Installing add-on: ' + addon.uid)
        progressDialog.setTitle(this.t('setupwizard.addons.installingAddon', { addon: addon.label }))

        this.$oh.api.post('/rest/addons/' + addon.uid + '/install', {}, 'text').then(() => {
          const checkTimer = setInterval(() => {
            checkAddonStatus(addon).then(() => {
              addon.installed = true
              clearInterval(checkTimer)
              nextTick(() => {
                installNextAddon()
              })
            }).catch(() => {
              // just keep going... TODO: implement failure mechanism after a number of failed checks?
            })
          }, checkInterval * 1000)
        })
      }

      progressDialog.open()
      installNextAddon()
    },
    persistenceConfig () {
      this.persistenceConfigConfirm = true
    },
    finish () {
      f7.panel.get('left').enableVisibleBreakpoint()
      nextTick(() => {
        f7.views.main.router.navigate('/', { transition: 'f7-circle', clearPreviousHistory: true })
        if (this.$f7dim.width >= 1280) {
          f7.emit('selectDeveloperDock', { dock: 'help', helpTab: 'quick' })
        }
      })
    },
    pageBeforeIn () {
      f7.panel.get('left').disableVisibleBreakpoint()
    },
    pageBeforeOut () {
      f7.panel.get('left').enableVisibleBreakpoint()
      // create the overview page to prevent this setup wizard from being launched again
      this.$oh.api.post('/rest/ui/components/ui:page', {
        uid: 'overview',
        component: 'oh-layout-page',
        config: {
          label: 'Overview'
        },
        slots: {
          default: [],
          masonry: null
        }
      }).then(() => {
        // this will force the pages to be refreshed
        f7.emit('sidebarRefresh', null)
      })
    }
  },
  mounted () {
    // hack to eliminate issue in framework7 router where the intro page (after a login) is unresponsive. Note,
    // if the setup-wizard page is reloaded, the page works correctly and is responsive.
    // Diagnosis: While the animate option is set to false when navigating to the setup-wizard (in auth-mixin),
    // framework7 seems to ignore and initiates the animation by setting the router-transition and router-transition-forward
    // classes on the view. These classes are never cleared in the framework and since these classes have 'pointer-events: none',
    // the page becomes unresponsive.
    f7.views.main.router.$el.removeClass('router-transition router-transition-forward')

    const promises = [
      this.$oh.api.get('/rest/config-descriptions/system:i18n'),
      this.$oh.api.get('/rest/services/org.openhab.i18n/config'),
      this.$oh.api.get('/rest/config-descriptions/system:network'),
      this.$oh.api.get('/rest/services/org.openhab.network/config'),
      this.$oh.api.get('/rest/addons')
    ]

    Promise.all(promises).then((data) => {
      // i18n config descriptions
      this.availableLanguages = data[0].parameters.find((p) => p.name === 'language').options
      this.availableRegions = data[0].parameters.find((p) => p.name === 'region').options
      this.availableTimezones = data[0].parameters.find((p) => p.name === 'timezone').options

      if (Intl && Intl.DateTimeFormat().resolvedOptions()) {
        const intlOptions = Intl.DateTimeFormat().resolvedOptions()
        if (intlOptions.locale) {
          this.language = intlOptions.locale.split('-')[0]
          if (intlOptions.locale.split('-')[1]) this.region = intlOptions.locale.split('-')[1]
        }
        if (intlOptions.timeZone) {
          if (this.availableTimezones.find((tz) => tz.value === intlOptions.timeZone)) this.timezone = intlOptions.timeZone
        }
      }

      // i18n config
      if (data[1].language) this.language = data[1].language
      if (data[1].location) this.location = data[1].location
      if (data[1].region) this.region = data[1].region
      if (data[1].timezone) this.timezone = data[1].timezone

      this.i18nReady = true

      // network config description & config
      this.networkConfigDescription = data[2].parameters.find((p) => p.name === 'primaryAddress')
      this.network = data[3].primaryAddress
      this.networksReady = true

      // addons
      this.addons = data[4].sort((a, b) => a.label.toUpperCase().localeCompare(b.label.toUpperCase()))

      // if there is only one network configuration option,
      // load the addon suggestion immediately and don't wait for the network to be configured
      if (!this.multiNetwork) {
        this.getSuggestions()
      }
    })
  }
}
</script>
