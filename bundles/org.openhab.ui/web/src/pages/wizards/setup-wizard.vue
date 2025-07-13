<template>
  <f7-page no-toolbar
           no-navbar
           no-swipeback
           no-swipe-panel
           login-screen
           class="setup-wizard"
           @page:init="pageBeforeIn"
           @page:beforeout="pageBeforeOut">
    <f7-tabs animated>
      <f7-tab id="intro" tab-active>
        <f7-login-screen-title>
          <img class="intro-logo" src="@/images/openhab-logo.svg" type="image/svg+xml">
        </f7-login-screen-title>
        <f7-list form style="margin-top: 4rem" v-if="i18nReady">
          <f7-list-item
            :title="t('setupwizard.language')"
            smart-select
            :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true, }">
            <select name="language" v-model="language">
              <option disabled value="" />
              <option v-for="option in availableLanguages"
                      :key="option.value"
                      :value="option.value">
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
              <option v-for="option in availableRegions"
                      :key="option.value"
                      :value="option.value">
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
              <option v-for="option in availableTimezones"
                      :key="option.value"
                      :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </f7-list-item>
        </f7-list>
        <f7-block class="display-flex flex-direction-column padding">
          <div>
            <f7-button large
                       fill
                       color="blue"
                       :text="t('setupwizard.beginSetup')"
                       @click="beginSetup" />
            <f7-button large
                       color="blue"
                       :text="t('setupwizard.skipSetup')"
                       class="margin-top"
                       @click="skipSetup" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="location">
        <f7-block>
          <f7-link
            icon-ios="f7:arrow_left"
            icon-aurora="f7:arrow_left"
            icon-md="material:arrow_back"
            tab-link="#intro"
            color="blue"
            tab-link-active />
          <f7-login-screen-title>
            <div class="padding">
              <f7-icon size="48" color="blue" f7="map_pin_ellipse" />
            </div>
            {{ t('setupwizard.location.title') }}
          </f7-login-screen-title>
        </f7-block>
        <f7-block strong>
          {{ t('setupwizard.location.header1') }}<br>{{ t('setupwizard.location.header2') }}
        </f7-block>
        <f7-list>
          <f7-list-group>
            <parameter-location :value="location"
                                :config-description="{ label: t('setupwizard.location.parameterLabel'), name: 'Location' }"
                                @input="value => location = value"
                                :placeholder="t('setupwizard.location.placeholder')" />
          </f7-list-group>
        </f7-list>
        <f7-block class="padding">
          <f7-row>
            <f7-col width="100">
              <f7-button large
                         icon-f7="location_fill"
                         icon-size="24"
                         @click="getCurrentPosition()"
                         :text="t('setupwizard.location.retrieveFromDevice')" />
            </f7-col>
          </f7-row>
          <f7-block-footer>
            <small>{{ t('setupwizard.location.footer') }}</small>
          </f7-block-footer>
        </f7-block>
        <f7-block class="display-flex flex-direction-column padding" v-if="networksReady">
          <div>
            <f7-button v-if="location"
                       large
                       fill
                       color="blue"
                       :text="t('setupwizard.location.setLocation')"
                       @click="setLocation" />
            <f7-button large
                       color="blue"
                       :text="t('setupwizard.configureLater')"
                       class="margin-top"
                       @click="skipLocation" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="network">
        <f7-block>
          <f7-link
            icon-ios="f7:arrow_left"
            icon-aurora="f7:arrow_left"
            icon-md="material:arrow_back"
            tab-link="#location"
            color="blue"
            tab-link-active />
          <f7-login-screen-title>
            <div class="padding">
              <f7-icon size="48" color="blue" f7="wifi" />
            </div>
            {{ t('setupwizard.network.title') }}
          </f7-login-screen-title>
        </f7-block>
        <f7-block strong>
          {{ t('setupwizard.network.header1') }} {{ t('setupwizard.network.header2') }}
        </f7-block>
        <f7-list>
          <f7-list-group>
            <parameter-options v-if="networksReady"
                               class="network"
                               :config-description="networkConfigDescription"
                               :value="network"
                               @input="value => changeNetwork(value)" />
          </f7-list-group>
        </f7-list>
        <f7-block class="display-flex flex-direction-column padding">
          <div>
            <f7-button large
                       fill
                       color="blue"
                       :text="t('setupwizard.network.setNetwork')"
                       @click="setNetwork" />
            <f7-button large
                       color="blue"
                       :text="t('setupwizard.configureLater')"
                       class="margin-top"
                       @click="skipNetwork" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="persistence">
        <f7-block>
          <f7-link
            icon-ios="f7:arrow_left"
            icon-aurora="f7:arrow_left"
            icon-md="material:arrow_back"
            :tab-link="(networkConfigDescription && networkConfigDescription.options && networkConfigDescription.options.length > 1) ? '#network' : '#location'"
            color="blue"
            tab-link-active />
          <f7-login-screen-title>
            <div class="padding">
              <f7-icon size="48" color="blue" f7="download_circle" />
            </div>
            {{ t('setupwizard.persistence.title') }}
          </f7-login-screen-title>
        </f7-block>
        <f7-block strong>
          {{ t('setupwizard.persistence.header1') }} {{ t('setupwizard.persistence.header2') }}
        </f7-block>
        <f7-block style="margin-top: 0; margin-bottom: 2em">
          <f7-block v-if="waitingForAddonSuggestions">
            <div class="display-flex justify-content-center margin-bottom">
              <f7-progressbar id="suggestions-progress-bar-persistence" :progress="0" />
            </div>
            <div>{{ t('setupwizard.addons.suggestionsWaitMessage') }}</div>
          </f7-block>
          <addons-setup-wizard v-if="addonSuggestionsReady && recommendedAddonsByType('persistence').length"
                               :addons="recommendedAddonsByType('persistence')"
                               :preSelectedAddons="selectedAddons"
                               @update="updateAddonSelection(recommendedAddonsByType('persistence'), $event)" />
          <f7-block-footer class="margin-bottom">
            <small>{{ t('setupwizard.persistence.footer') }}</small>
          </f7-block-footer>
          <div>
            <f7-button v-if="addonSuggestionsReady && selectedAddons.length > 0"
                       large
                       fill
                       color="blue"
                       :text="t('setupwizard.persistence.install')"
                       @click="selectPersistence" />
            <f7-button large
                       color="blue"
                       :text="t('setupwizard.persistence.installLater')"
                       class="margin-top"
                       @click="skipPersistence" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="addons">
        <f7-block>
          <f7-link
            icon-ios="f7:arrow_left"
            icon-aurora="f7:arrow_left"
            icon-md="material:arrow_back"
            tab-link="#persistence"
            color="blue"
            tab-link-active />
          <f7-login-screen-title>
            <div class="padding">
              <f7-icon size="48" color="blue" f7="bag_badge_plus" />
            </div>
            {{ t('setupwizard.addons.title') }}
          </f7-login-screen-title>
        </f7-block>
        <f7-block strong>
          {{ t('setupwizard.addons.header1') }}<br>{{ t('setupwizard.addons.header2') }}<br>{{ t('setupwizard.addons.header3') }} <br><br>
          <a class="text-color-blue external"
             target="_blank"
             href="https://www.openhab.org/addons/">
            {{ t('setupwizard.addons.browseAddonsOnWebsite') }}</a>
        </f7-block>
        <f7-block class="padding">
          <f7-block v-if="waitingForAddonSuggestions">
            <div class="display-flex justify-content-center margin-bottom">
              <f7-progressbar id="suggestions-progress-bar-addons" :progress="0" />
            </div>
            <div>{{ t('setupwizard.addons.suggestionsWaitMessage') }}</div>
          </f7-block>
          <addons-setup-wizard v-if="addonSuggestionsReady && mainAddons.length"
                               :enableAddonSelection="true"
                               :addons="mainAddons"
                               :preSelectedAddons="selectedAddons"
                               @update="updateAddonSelection(mainAddonSelection, $event)" />
          <f7-block-footer class="margin-bottom">
            <small>{{ t('setupwizard.addons.footer') }}</small>
          </f7-block-footer>
          <div>
            <f7-button v-if="addonSuggestionsReady && toInstallAddons.filter(a => !preSelectedAddon(a) && !a.installed).length > 0"
                       large
                       fill
                       color="blue"
                       :text="t('setupwizard.addons.installAddons', toInstallAddons.filter(a => !preSelectedAddon(a) && !a.installed).length)"
                       @click="installAddons" />
            <f7-button large
                       color="blue"
                       :text="t('setupwizard.addons.installLater')"
                       class="margin-top"
                       @click="skipAddons" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="wait">
        <f7-block>
          <f7-link
            icon-ios="f7:arrow_left"
            icon-aurora="f7:arrow_left"
            icon-md="material:arrow_back"
            tab-link="#intro"
            color="blue"
            tab-link-active
            style="visibility: hidden" />
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

      <f7-tab id="finish">
        <f7-block style="margin-top: 8rem">
          <!-- no going back on this last screen!
                  <f7-link
                  icon-ios="f7:arrow_left"
                  icon-aurora="f7:arrow_left"
                  icon-md="material:arrow_back"
                  tab-link="#package"
                  color="blue"
                  tab-link-active
                ></f7-link>-->
          <f7-login-screen-title>{{ t('setupwizard.welcome.title') }}</f7-login-screen-title>
        </f7-block>
        <f7-block v-if="bindingInstalled">
          {{ t('setupwizard.welcome.bindingsInstalled') }}
        </f7-block>
        <f7-block class="display-flex flex-direction-column padding" style="margin-top: 4rem">
          <div>
            <f7-button large
                       color="blue"
                       :text="t('setupwizard.welcome.getStarted')"
                       @click="finish" />
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
    .block-header
      .item-label
        text-align left
        margin-left 0 !important
        margin-right 0 !important

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
import { mapStores } from 'pinia'

import i18n_mixin from '@/components/i18n-mixin'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n'
import AddonsSetupWizard from '@/components/addons/addons-setup-wizard.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

export default {
  mixins: [i18n_mixin],
  components: {
    'parameter-location': defineAsyncComponent(() => import('@/components/config/controls/parameter-location.vue')),
    'parameter-options': defineAsyncComponent(() => import('@/components/config/controls/parameter-options.vue')),
    AddonsSetupWizard
  },
  setup () {
    const { t, setLocaleMessage } = useI18n({ useScope: 'local' })

    loadLocaleMessages('setup-wizard', setLocaleMessage)

    return { t, theme, setLocaleMessage }
  },
  data () {
    return {
      i18nReady: false,
      availableLanguages: null,
      availableRegions: null,
      availableTimezones: null,
      language: null,
      region: null,
      timezone: null,
      location: null,
      networksReady: false,
      networkConfigDescription: null,
      network: null,
      networkChanged: false,
      waitingForAddonSuggestions: false,
      waitingTimeout: null,
      addonSuggestionsReady: false,
      addons: [],
      // all recommended addons, pre-defined
      recommendedAddons: ['persistence-rrd4j', 'persistence-mapdb', 'persistence-inmemory', 'automation-jsscripting', 'ui-basic', 'binding-astro'],
      // addon types that can be selected in wizard before main addon selection step, to be excluded from main selection step, pre-defined
      preSelectingAddonTypes: ['persistence'],
      // addons that can be selected in wizard before main addon selection step, to be excluded from main selection step, pre-defined
      preSelectingAddons: [],
      // all recommended and suggested addons, list created in code
      selectedAddons: [],
      // final list of addons to install
      toInstallAddons: [],
      installingAddons: false,
      bindingInstalled: false
    }
  },
  computed: {
    locale () {
      if (!this.language) return null
      if (!this.region) return this.language
      return this.language + '-' + this.region.toLowerCase()
    },
    /**
     * Add-ons that can be selected in the main add-on selection step, with add-on types handled before the main selection step excluded.
     * @returns {*[]}
     */
    mainAddons () {
      return this.addons.filter((a) => !this.preSelectingAddonTypes.includes(a.type))
    },
    /**
     * Add-ons that are currently selected in the main add-on selection step, with installed and pre-selected add-ons excluded.
     * @returns {*[]}
     */
    mainAddonSelection () {
      const addons = this.selectedAddons.concat(this.toInstallAddons).filter((a) => (!a.installed && !this.preSelectedAddon(a)))
      return [...new Set(addons)]
    }
  },
  watch: {
    locale (val) {
      useRuntimeStore().locale = this.locale
      loadLocaleMessages('setup-wizard', this.setLocaleMessage)
      // watch on useRuntimeStore().locale in App.vue will update globals
    }
  },
  methods: {
    beginSetup () {
      this.$oh.api.put('/rest/services/org.openhab.i18n/config', {
        language: this.language,
        region: this.region,
        timezone: this.timezone
      }).then(() => {
        f7.emit('localeChanged')
        f7.tab.show('#location')
      })
    },
    getCurrentPosition () {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.location = position.coords.latitude + ',' + position.coords.longitude
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
      this.$oh.api.put('/rest/services/org.openhab.i18n/config', {
        location: this.location
      }).then(() => {
        this.showNetwork()
      })
    },
    skipLocation () {
      this.showNetwork()
    },
    showNetwork () {
      if (this.networkConfigDescription?.options?.length > 1) {
        f7.tab.show('#network')
      } else {
        this.skipNetwork()
      }
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
        }).then(() => {
          this.addonSuggestionsReady = false
          this.getSuggestedAddons()
          this.showPersistence()
        })
      } else {
        this.skipNetwork()
      }
    },
    skipNetwork () {
      this.getSuggestedAddons()
      this.showPersistence()
    },
    showPersistence () {
      if (this.addonSuggestionsReady) {
        this.updateAddonSelection([], this.recommendedAddonsByType('persistence'))
      } else {
        f7.once('addonSuggestionsReady', () => {
          this.updateAddonSelection([], this.recommendedAddonsByType('persistence'))
        })
      }
      f7.tab.show('#persistence')
    },
    selectPersistence () {
      this.showAddons()
    },
    skipPersistence () {
      if (this.addonSuggestionsReady) {
        this.updateAddonSelection(this.recommendedAddonsByType('persistence'), [])
      } else {
        f7.once('addonSuggestionsReady', () => {
          this.updateAddonSelection(this.recommendedAddonsByType('persistence'), [])
        })
      }
      this.showAddons()
    },
    showAddons () {
      if (this.addonSuggestionsReady) {
        this.updateAddonSelection([], this.selectedAddons.filter((a) => !this.preSelectedAddon(a)))
      } else {
        f7.once('addonSuggestionsReady', () => {
          this.updateAddonSelection([], this.selectedAddons.filter((a) => !this.preSelectedAddon(a)))
        })
      }
      f7.tab.show('#addons')
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
        const suggestedAddons = suggestions.flatMap((s) => s.id)
        this.selectedAddons = this.addons.filter((a) => (this.recommendedAddons.includes(a.uid) || suggestedAddons.includes(a.id)))
          .sort((a, b) => a.uid.toUpperCase().localeCompare(b.uid.toUpperCase()))
        this.addonSuggestionsReady = true
        f7.emit('addonSuggestionsReady')
      })
    },
    preSelectedAddon (addon) {
      return (this.preSelectingAddonTypes.includes(addon.type) || this.preSelectingAddons.includes(addon.uid))
    },
    recommendedAddonsByType (type) {
      return this.addons.filter((a) => ((a.type === type) && this.recommendedAddons.includes(a.uid)))
    },
    updateAddonSelection (oldSelected, newSelected) {
      console.debug('Updating add-on selection:', oldSelected.map((a) => a.uid), newSelected.map((a) => a.uid))
      const addons = this.toInstallAddons.filter((a) => !oldSelected.includes(a)).concat(newSelected)
      this.toInstallAddons = [...new Set(addons)]
      console.log('Add-ons to install:', this.toInstallAddons.map((a) => a.uid))
    },
    installAddons () {
      const checkInterval = 2 // check the add-ons statuses every 2 seconds

      this.toInstallAddons = this.toInstallAddons.filter((a) => !a.installed)
      this.installingAddons = true
      f7.tab.show('#wait', false)

      this.bindingInstalled = this.toInstallAddons.find((a) => a.type === 'binding')
      const addonsCount = this.toInstallAddons.length
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
          this.showFinish()
          return
        }

        // install next add-on
        progressDialog.setText(this.t('setupwizard.addons.progress', { current: addonsCount - this.toInstallAddons.length + 1, total: addonsCount }))
        progressDialog.setProgress(((addonsCount - this.toInstallAddons.length + 1) / addonsCount) * 100)
        const addon = this.toInstallAddons.shift()
        console.log('Installing add-on: ' + addon.uid)
        progressDialog.setTitle(this.t('setupwizard.addons.installingAddon', { addon: addon.label }))

        this.$oh.api.post('/rest/addons/' + addon.uid + '/install', {}, 'text').then(() => {
          const checkTimer = setInterval(() => {
            checkAddonStatus(addon).then(() => {
              clearInterval(checkTimer)
              installNextAddon()
            }).catch(() => {
              // just keep going... TODO: implement failure mechanism after a number of failed checks?
            })
          }, checkInterval * 1000)
        })
      }

      progressDialog.open()
      installNextAddon()
    },
    skipAddons () {
      this.updateAddonSelection(this.mainAddons, [])
      if (this.toInstallAddons.filter((a) => !a.installed).length) {
        this.installAddons()
        return
      }
      this.showFinish()
    },
    showFinish () {
      this.$refs.finish.show()
    },
    finish () {
      f7.panel.get('left').enableVisibleBreakpoint()
      nextTick(() => {
        f7.views.main.router.navigate('/', { transition: 'f7-circle', clearPreviousHistory: true })
        if (f7.width >= 1280) {
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
    })
  }
}
</script>
