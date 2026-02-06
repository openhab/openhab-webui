<template>
  <f7-page
    no-toolbar
    no-swipeback
    no-swipe-panel
    login-screen
    class="setup-wizard"
    @page:init="pageBeforeIn"
    @page:beforeout="pageBeforeOut">
    <!-- Navbar with steps link -->
    <f7-navbar no-hairline class="navbar-header-row">
      <f7-nav-left>
        <f7-link
          v-if="prev"
          icon-ios="f7:arrow_left"
          icon-aurora="f7:arrow_left"
          icon-md="material:arrow_back"
          color="blue"
          @click="handler(prev)" />
      </f7-nav-left>
      <f7-nav-title v-if="currentStep !== 'welcome'" class="wizard-progress-title">
        <f7-link popover-open="#wizard-steps-popover">
          <span v-html="wizardProgress"></span>
        </f7-link>
      </f7-nav-title>
      <f7-nav-right>
        <f7-link icon-ios="f7:xmark" icon-aurora="f7:xmark" icon-md="material:close" color="blue" @click="skipSetup" />
      </f7-nav-right>
    </f7-navbar>

    <!-- List of steps popover -->
    <f7-popover id="wizard-steps-popover">
      <f7-list menuList>
        <f7-list-item
          v-for="(step, index) in wizardStepKeysFiltered"
          :key="index"
          :title="t('setupwizard.' + step + '.title')"
          :selected="step === currentStep"
          :style="!wizardStepKeysActive.includes(step) ? 'color: grey; pointerEvents: none; opacity: 0.6' : ''"
          :checked="setupWizardStepsDone?.[step]"
          checkbox
          readonly
          link
          no-chevron
          :popover-close="wizardStepKeysActive.includes(step)"
          @click="toStep(step)">
          <template #after>
            <f7-icon v-if="wizardSteps[step].show?.extended" f7="info_circle" :tooltip="t('setupwizard.extended')" />
          </template>
        </f7-list-item>
      </f7-list>
    </f7-popover>

    <f7-tabs animated>
      <!-- Intro step -->
      <f7-tab id="intro" tab-active @tab:show="handleTabShow">
        <tab-header :image="introLogo" :step="currentStep" :link="wizardSteps[currentStep].link" :t="t" />
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
            <f7-button
              v-if="next && firstStepNotDone && firstStepNotDone !== 'intro'"
              large
              fill
              color="blue"
              :text="t('setupwizard.skipToNext')"
              @click="toStep(firstStepNotDone)" />
            <f7-button
              v-if="next"
              large
              :fill="!firstStepNotDone || firstStepNotDone === 'intro'"
              color="blue"
              :text="t('setupwizard.beginSetup')"
              @click="handler(next)" />
            <f7-button large color="blue" :text="t('setupwizard.skipSetup')" @click="skipSetup" />
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

      <!-- Location setup -->
      <f7-tab id="location" @tab:show="handleTabShow">
        <tab-header
          :icon="wizardSteps[currentStep].icon"
          :title="t('setupwizard.' + currentStep + '.title')"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t" />
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
            <f7-button
              v-if="updatedLocation && next"
              large
              fill
              color="blue"
              :text="t('setupwizard.' + currentStep + '.next')"
              @click="handler(next)" />
            <f7-button v-if="skip" large color="blue" :text="t('setupwizard.skip')" class="margin-top" @click="handler(skip)" />
          </div>
        </f7-block>
      </f7-tab>

      <!-- Primary network selection -->
      <f7-tab id="network" @tab:show="handleTabShow">
        <tab-header
          :icon="wizardSteps[currentStep].icon"
          :title="t('setupwizard.' + currentStep + '.title')"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t" />
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
            <f7-button
              v-if="network && next"
              large
              fill
              color="blue"
              :text="t('setupwizard.' + currentStep + '.next')"
              @click="handler(next)" />
            <f7-button v-if="skip" large color="blue" :text="t('setupwizard.skip')" class="margin-top" @click="handler(skip)" />
          </div>
        </f7-block>
      </f7-tab>

      <!-- Intro steps explaining concepts -->
      <f7-tab v-for="introStep in wizardIntroStepKeys" :key="introStep" :id="introStep" @tab:show="handleTabShow">
        <info 
          :step="currentStep"
          :icon="wizardSteps[currentStep].icon"
          :image="wizardSteps[currentStep].image"
          :link="wizardSteps[currentStep].link"
          :t="t" />
        <f7-block class="display-flex flex-direction-column padding">
          <div>
            <f7-button v-if="next" large fill color="blue" :text="t('setupwizard.next')" @click="handler(next)" />
          </div>
        </f7-block>
      </f7-tab>

      <!-- Steps for add-on selection and installation -->
      <f7-tab v-for="addonType in preSelectingAddonTypes" :key="addonType" :id="addonType" @tab:show="handleTabShow">
        <tab-header
          :icon="wizardSteps[currentStep].icon"
          :title="t('setupwizard.' + currentStep + '.title')"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t" />
        <f7-block class="padding">
          <f7-block v-if="waitingForAddonSuggestions">
            <div class="display-flex justify-content-center margin-bottom">
              <f7-progressbar :id="'suggestions-progress-bar-' + addonType" :progress="waitingProgress" />
            </div>
            <div>{{ t('setupwizard.addons.suggestionsWaitMessage') }}</div>
          </f7-block>
          <div v-if="!installingAddons">
            <addons-setup-wizard
              v-if="addonSuggestionsReady"
              :enableAddonSelection="true"
              :addons="addonsByType[addonType]"
              :type="addonType"
              :selectedAddons="selectedAddonsByType[addonType] || []"
              :preSelectedAddons="preSelectedAddonsByType(addonType)"
              @added="addAddonSelection"
              @removed="removeAddonSelection"
              :t />
            <f7-block-footer class="margin-bottom">
              <small>{{ t('setupwizard.' + currentStep + '.footer') }}</small>
            </f7-block-footer>
          </div>
          <div v-else>
            <f7-block-header class="padding">
              {{ waitingProgressTitle }}
            </f7-block-header>
            <f7-block>
              <div class="display-flex justify-content-center margin-bottom">
                <f7-progressbar :id="'installing-progress-bar-' + addonType" :progress="waitingProgress" />
              </div>
              <div>{{ waitingProgressText }}</div>
            </f7-block>
          </div>
          <div>
            <f7-button
              v-if="!installingAddons && addonSuggestionsReady && (toInstallAddons.length > 0) && next"
              large
              fill
              color="blue"
              :text="t('setupwizard.' + currentStep + '.next', toInstallAddons.length)"
              @click="handler(next)" />
            <f7-button
              v-if="!installingAddons && skip"
              large
              color="blue"
              :text="t('setupwizard.' + currentStep + '.skip')"
              class="margin-top"
              @click="handler(skip)" />
            <f7-button
              v-if="installingAddons"
              large
              fill
              color="blue"
              :text="t('setupwizard.addons.cancelInstall')"
              class="margin-top"
              @click="cancelInstall" />
          </div>
        </f7-block>
      </f7-tab>

      <!-- Configure persistence -->
      <f7-tab id="persistence-config" @tab:show="handleTabShow">
        <tab-header
          :icon="wizardSteps[currentStep].icon"
          :title="t('setupwizard.' + currentStep + '.title')"
          :step="currentStep"
          :link="wizardSteps[currentStep].link"
          :t="t" />
        <persistence-config-setup-wizard :addons="addons" :addonsReady="persistenceInstalled" :confirm="persistenceConfigConfirm" :t />
        <f7-block-footer class="margin-bottom">
          <small>{{ t('setupwizard.' + currentStep + '.footer') }}</small>
        </f7-block-footer>
        <f7-block class="padding">
          <div>
            <f7-button v-if="next" large fill color="blue" :text="t('setupwizard.' + currentStep + '.config')" @click="handler(next)" />
            <f7-button
              v-if="skip"
              large
              color="blue"
              :text="t('setupwizard.' + currentStep + '.configLater')"
              class="margin-top"
              @click="handler(skip)" />
          </div>
        </f7-block>
      </f7-tab>

      <!-- Welcome -->
      <f7-tab id="welcome" @tab:show="handleTabShow">
        <tab-header :title="t('setupwizard.welcome.title')" />
        <f7-block>
          {{ t('setupwizard.welcome.model') }}
        </f7-block>
        <f7-block v-if="bindingsInstalled">
          {{ t('setupwizard.welcome.bindingsInstalled') }}
        </f7-block>
        <f7-block-footer class="margin-bottom">
          <small>{{ t('setupwizard.' + currentStep + '.footer') }}</small>
        </f7-block-footer>
        <f7-block class="display-flex flex-direction-column padding" style="margin-top: 4rem">
          <div>
            <f7-button v-if="next" large fill color="blue" :text="t('setupwizard.welcome.modelLink')" @click="handler({ ...next, link: '/settings/model/' })" />
            <f7-button v-if="next && bindingsInstalled" large color="blue" :text="t('setupwizard.welcome.inboxLink')" @click="handler({ ...next, link: '/settings/things/inbox' })" />
          <f7-button v-if="next" large color="blue" :text="t('setupwizard.welcome.getStarted')" @click="handler({ ...next, link: '/' })" />
          </div>
        </f7-block>
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.setup-wizard
  .intro-logo
    margin-top 4rem
    margin-bottom 2rem
    width 240px
  .login-screen-content
    padding-top 0
  .page-content
    margin-top inherit
  .navbar-header-row
    max-width var(--f7-login-screen-blocks-max-width)
    position relative
    margin 0.5rem auto
    box-sizing border-box
    .navbar-bg
      background-color transparent
  .wizard-progress-title
    .progress-circle
      display inline-block
      width 8px
      height 8px
      border-radius 50%
      margin-right 6px
      &:last-child
        margin-right 0
      &.filled
        background-color #007aff
      &.empty
        border 1px solid #007aff
        box-sizing border-box
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

// Disable tab switching animation while keeping scrollable tabs,
// this avoids animation flashing tabs that are not defined in the right order
.tabs-animated-wrap .tabs
  transition none
.tab
  transition none

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
import conceptsImage from '@/images/wizard-concepts.png'
import rulesImage from '@/images/wizard-rules.png'
import uiImage from '@/images/wizard-ui.png'
import persistenceImage from '@/images/wizard-persistence.png'
import semanticsImage from '@/images/wizard-semantics.png'

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
    'info': defineAsyncComponent(() => import('./setup-wizard-info.vue')),
    AddonsSetupWizard,
    PersistenceConfigSetupWizard
  },
  setup () {
    const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })
    loadLocaleMessages('setup-wizard', mergeLocaleMessage)
    return { t, theme, mergeLocaleMessage, introLogo, conceptsImage, rulesImage, uiImage, persistenceImage, semanticsImage }
  },
  data () {
    return {
      i18nReady: false,

      // wizard sequence of steps and functions to be called when changing step
      wizardSteps: {
        // Intro does have to be the first step. Code forces no next step is possible before completing it.
        'intro': {
          next: { handler: () => this.beginSetup(), step: 'location' }
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
          show: { isInvisible: () => !this.multiNetwork },
          prev: { step: 'location' },
          next: { handler: () => this.setNetwork(), step: 'concepts-intro' },
          skip: { step: 'concepts-intro' }
        },
        'concepts-intro': {
          icon: 'lightbulb',
          image: conceptsImage,
          link: 'https://www.openhab.org/docs/concepts/',
          show: { extended: true },
          prev: { step: 'network' },
          next: { step: 'binding' }
        },
        'binding': {
          icon: 'circle_grid_hex_fill',
          link: 'https://www.openhab.org/addons/#binding',
          show: { handler: () => this.initSelectedAddons() },
          prev: { step: 'network' },
          next: { handler: () => this.installAddons(), step: 'rules-intro' },
          skip: { step: 'rules-intro' }
        },
        'rules-intro': {
          icon: 'wand_stars',
          image: rulesImage,
          link: 'https://www.openhab.org/docs/tutorial/rules_introduction/',
          show: { extended: true },
          prev: { step: 'binding' },
          next: { step: 'automation' }
        },
        'automation': {
          icon: 'wand_stars',
          link: 'https://www.openhab.org/addons/#automation',
          show: { handler: () => this.initSelectedAddons() },
          prev: { step: 'binding' },
          next: { handler: () => this.selectAddons(), step: 'ui-intro' },
          skip: { step: 'ui-intro' }
        },
        'ui-intro': {
          icon: 'play_rectangle',
          image: uiImage,
          link: 'https://www.openhab.org/docs/tutorial/pages_intro/',
          show: { extended: true },
          prev: { step: 'automation' },
          next: { step: 'ui' }
        },
        'ui': {
          icon: 'play_rectangle',
          link: 'https://www.openhab.org/addons/#ui',
          show: { handler: () => this.initSelectedAddons() },
          prev: { step: 'automation' },
          next: { handler: () => this.selectAddons(), step: 'persistence-intro' },
          skip: { step: 'persistence-intro' }
        },
        'persistence-intro': {
          icon: 'download_circle',
          image: persistenceImage,
          link: 'https://www.openhab.org/docs/tutorial/persistence/',
          show: { extended: true },
          prev: { step: 'ui' },
          next: { step: 'persistence' }
        },
        'persistence': {
          icon: 'download_circle',
          link: 'https://www.openhab.org/addons/#persistence',
          show: { handler: () => this.initSelectedAddons() },
          prev: { step: 'ui' },
          next: { handler: () => { this.selectAddons() }, step: 'persistence-config' },
          skip: { step: 'persistence-config' }
        },
        'persistence-config': {
          icon: 'download_circle',
          show: { isInvisible: () => !this.persistenceInstalled, handler: () => this.persistenceConfigConfirm = false },
          prev: { step: 'persistence' },
          next: { handler: () => this.persistenceConfigConfirm = true, step: 'semantics-intro' },
          skip: { step: 'semantics-intro' }
        },
        'semantics-intro': {
          icon: 'list_bullet_indent',
          image: semanticsImage,
          link: 'https://www.openhab.org/docs/tutorial/model/',
          show: { extended: true },
          prev: { step: 'persistence-config' },
          next: { step: 'welcome' }
        },
        'welcome': {
          prev: { step: 'intro' },
          next: { handler: (link) => this.finish(link) }
        }
      },
      currentStep: 'intro',

      // progress bar state
      waitingProgress: 0,
      waitingProgressTitle: '',
      waitingProgressText: '',
      waitingTimeout: null,

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
      addonSuggestionsReady: false,
      addons: [],
      // all recommended addons, pre-defined
      recommendedAddons: ['binding-astro', 'automation-jsscripting', 'ui-basic', 'misc-openhabcloud', 'persistence-rrd4j', 'persistence-mapdb', 'persistence-inmemory'],
      // addons suggested from suggestion finders
      suggestedAddons: [],
      // addon types that can be selected in wizard
      preSelectingAddonTypes: ['binding', 'automation', 'ui', 'persistence'],
      // list of addons per step, will include pre-selected and already installed, updated in addons setup wizard
      selectedAddonsByType: {},
      installingAddons: false,
      installingAddonsCancelled: false,

      persistenceConfigConfirm: false
    }
  },
  computed: {
    show () {
      if (!this.currentStep) return null
      return { action: 'show', ...this.wizardSteps[this.currentStep].show }
    },
    prev () {
      if (!this.currentStep) return null
      return { action: 'prev', ...this.wizardSteps[this.currentStep].prev }
    },
    next () {
      if (!this.currentStep) return null
      return { action: 'next', ...this.wizardSteps[this.currentStep].next }
    },
    skip () {
      if (!this.currentStep) return null
      return { action: 'skip', ...this.wizardSteps[this.currentStep].skip }
    },
    locale () {
      if (!this.language) return null
      if (!this.region) return this.language
      return this.language + '-' + this.region.toLowerCase()
    },
    multiNetwork () {
      return (this.networkConfigDescription?.options?.length > 1)
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
    installedAddonsByType () {
      const addons = {}
      Object.keys(this.addonsByType).forEach((type) => {
        addons[type] = this.addonsByType[type].filter((a) => a.installed)
      })
      return addons
    },
    toInstallAddons () {
      return this.selectedAddonsByType[this.currentStep]?.filter((a => !a.installed)) || []
    },
    preSelectedAddons () {
      // all recommended and suggested addons
      return [
        ...this.addons.filter((a) => this.recommendedAddons.includes(a.uid)).sort((a, b) => a.uid.toUpperCase().localeCompare(b.uid.toUpperCase())),
        ...this.addons.filter((a) => this.suggestedAddons.includes(a.id)).sort((a, b) => a.uid.toUpperCase().localeCompare(b.uid.toUpperCase()))
      ]
    },
    bindingsInstalled () {
      return !this.installingAddons && (this.addons.findIndex((a) => a.type === 'binding' && a.installed) >= 0)
    },
    persistenceInstalled () {
      return !this.installingAddons && (this.addons.findIndex((a) => a.type === 'persistence' && a.installed) >= 0)
    },
    wizardStepKeys () {
      const steps = []
      let step = 'intro'
      while (step) {
        steps.push(step)
        step = this.wizardSteps[step].next?.step || this.wizardSteps[step].skip?.step
      }
      return steps
    },
    wizardIntroStepKeys () {
      // Collect all steps the are used as concept intro
      return this.wizardStepKeys.filter((step) => this.wizardSteps[step].show?.extended)
    },
    wizardStepKeysFiltered () {
      let steps = this.wizardStepKeys
      if (this.setupWizardShort) steps = steps.filter((step) => !this.wizardSteps[step].show?.extended)
      return steps
    },
    wizardStepKeysActive () {
      return this.wizardStepKeysFiltered.filter((step) => step === 'intro' || (this.setupWizardStepsDone?.intro && !this.wizardSteps[step].show?.isInvisible?.()))
    },
    wizardStepCount () {
      return this.wizardStepKeysFiltered.length
    },
    wizardCurrentCount () {
      return this.wizardStepKeysFiltered.findIndex((step) => this.currentStep === step) + 1
    },
    wizardProgress () {
      const filled = '<span class="progress-circle filled"></span>'
      const empty = '<span class="progress-circle empty"></span>'
      return filled.repeat(this.wizardCurrentCount) + empty.repeat(this.wizardStepCount - this.wizardCurrentCount)
    },
    firstStepNotDone () {
      return this.wizardStepKeysFiltered.find((step) => !this.setupWizardStepsDone?.[step])
    },
    ...mapWritableState(useUIOptionsStore, {
      setupWizardShort: 'setupWizardShort',
      setupWizardStepsDone: 'setupWizardStepsDone'
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
    async execHandler (handler, ...args) {
      const result = handler?.(...args)
      // Wait for handler if it returns a Promise
      if (result instanceof Promise) {
        try {
          await result
        } catch (error) {
          // Handler rejected (e.g., installation cancelled)
          console.log('Handler was cancelled or failed:', error.message)
          return false
        }
      }
      return true
    },
    async handleTabShow (arg1, arg2) {
      // Framework7 tab:show can pass (el) or (event, el) - handle both
      const tabEl = arg2 || arg1
      const id = tabEl?.id || tabEl?.target?.id
      if (id) this.currentStep = id
      await this.execHandler(this.show?.handler)
      // Scroll the active tab to top
      nextTick(() => {
        const activeTab = document.querySelector('#' + id)
        if (activeTab) {
          activeTab.scrollTop = 0
        }
      })
    },
    async handler (direction) {
      if (!direction) return
      // Extract link if passed as parameter (e.g., when direction is a computed object with link property)
      const link = direction?.link
      if  (!await this.execHandler(direction?.handler, link)) {
        // an error occurred or operation was cancelled, don't move tabs
        return
      }
      let nextStep = direction.step
      const action = direction.action === 'next' ? 'skip' : direction.action
      // skip setup tabs that are marked invisble because step is not required with current configuration
      // and steps marked as extended when using the short wizard
      while (nextStep && this.isInvisible(nextStep)) {
        if (action === 'skip') {
          nextStep = this.wizardSteps[nextStep].skip?.step || this.wizardSteps[nextStep].next?.step
        } else {
          nextStep = this.wizardSteps[nextStep][action]?.step
        }
      }
      if (direction?.action === 'next') {
        // we completed this step, store it
        const stepsDone = { ...(this.setupWizardStepsDone) }
        stepsDone[this.currentStep] = true
        this.setupWizardStepsDone = stepsDone
      }
      if (nextStep) {
        f7.tab.show('#' + nextStep)
      }
    },
    async toStep (step) {
      if (step === this.currentStep) return
      if (this.isInvisible(step)) return
      if (!await this.execHandler(this.wizardSteps[this.currentStep].skip?.handler)) {
        // an error occurred or operation was cancelled, don't move tabs
        return
      }
      f7.tab.show('#' + step)
    },
    isInvisible (step) {
      return (this.wizardSteps[step].show?.isInvisible?.() || (this.setupWizardShort && this.wizardSteps[step].show?.extended))
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
    initSelectedAddons () {
      this.getSuggestedAddons()
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
      const loading = () => {
        this.waitingTimeout = setTimeout(() => {
          if (this.waitingProgress < 100) {
            this.waitingProgress += 10
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
        this.waitingProgress = 0
        this.waitingForAddonSuggestions = true
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
     */
    getSuggestions () {
      this.$oh.api.get('/rest/addons/suggestions').then((suggestions) => {
        // Filter out the recommendaed addons so they can be put first in preSelectedAddons
        this.suggestedAddons = suggestions.flatMap((s) => s.id).filter((id) => !this.recommendedAddons.includes(id))
        nextTick(() => {
          this.preSelectingAddonTypes.forEach((type) => this.initAddonSelection(type))
        })
        this.addonSuggestionsReady = true
      })
    },
    preSelectedAddonsByType (type) {
      return this.addonsByType[type].filter((a) => this.preSelectedAddons.includes(a))
    },
    initAddonSelection (type) {
      const installed = this.installedAddonsByType[type]
      this.selectedAddonsByType[type] = [...new Set([...(this.preSelectedAddonsByType(type) || []), ...installed])]
    },
    addAddonSelection (addon) {
      const oldSelected = this.selectedAddonsByType[this.currentStep]
      if (!this.selectedAddonsByType[this.currentStep]) this.selectedAddonsByType[this.currentStep] = []
      this.selectedAddonsByType[this.currentStep].push(addon)
      const newSelected = this.selectedAddonsByType[this.currentStep]
      console.debug('Adding to add-on selection:', oldSelected.map((a) => a.uid), newSelected.map((a) => a.uid))
      nextTick(() => {
        console.log('Add-ons to install:', this.toInstallAddons.map((a) => a.uid))
      })
    },
    removeAddonSelection (addon) {
      const oldSelected = this.selectedAddonsByType[this.currentStep]
      if (!this.selectedAddonsByType[this.currentStep]) this.selectedAddonsByType[this.currentStep] = []
      this.selectedAddonsByType[this.currentStep] = this.selectedAddonsByType[this.currentStep].filter((a) => a.uid !== addon.uid)
      const newSelected = this.selectedAddonsByType[this.currentStep]
      console.debug('removing from add-on selection:', oldSelected.map((a) => a.uid), newSelected.map((a) => a.uid))
      nextTick(() => {
        console.log('Add-ons to install:', this.toInstallAddons.map((a) => a.uid))
      })
    },
    async selectAddons () {
      // Needs to be async, so wizard can stay on page until all add-ons are installed
      await this.installAddons()
    },
    installAddons () {
      return new Promise((resolve, reject) => {
        const checkInterval = 2 // check the add-ons statuses every 2 seconds

        const addons = [...this.toInstallAddons]
        const addonsCount = addons.length
        if (addonsCount === 0) {
          resolve()
          return
        }

        this.installingAddons = true
        this.isInstallCancelled = false
        this.waitingProgressTitle = this.t('setupwizard.addons.installing')
        this.waitingProgress = 0

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
          if (!addons.length) {
            this.installingAddons = false
            resolve()
            return
          }

          // cancelled, not installing the next one anymore
          if (this.isInstallCancelled) {
              this.installingAddons = false
              reject(new Error('cancelled'))
              return
          }

          // install next add-on
          const addon = addons.shift()
          this.waitingProgress = ((addonsCount - addons.length) / addonsCount) * 100
          this.waitingProgressText = this.t('setupwizard.addons.progress', { current: addonsCount - addons.length, total: addonsCount })
          console.log('Installing add-on: ' + addon.uid)
          this.waitingProgressTitle = this.t('setupwizard.addons.installingAddon', { addon: addon.label })

          this.$oh.api.post('/rest/addons/' + addon.uid + '/install', {}, 'text').then(() => {
            if (this.isInstallCancelled) return
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

        installNextAddon()
      })
    },
    cancelInstall () {
      this.isInstallCancelled = true
      this.waitingProgressTitle = this.t('setupwizard.addons.installCancelled')
      this.waitingProgress = 100

    },
    finish (link) {
      const target = link || '/'
      // we completed this step, store it
      const stepsDone = { ...(this.setupWizardStepsDone) }
      stepsDone['welcome'] = true
      this.setupWizardStepsDone = stepsDone

      f7.panel.get('left').enableVisibleBreakpoint()
      nextTick(() => {
        f7.views.main.router.navigate(target, { transition: 'f7-circle', clearPreviousHistory: true })
        if (this.$f7dim.width >= 1280) {
          f7.emit('selectDeveloperDock', { dock: 'help', helpTab: 'quick' })
        }
      })
    },
    pageBeforeIn () {
      f7.panel.get('left').disableVisibleBreakpoint()
      this.currentStep = 'intro'
    },
    pageBeforeOut () {
      f7.panel.get('left').enableVisibleBreakpoint()
      // create the overview page to prevent this setup wizard from being launched again automatically
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
