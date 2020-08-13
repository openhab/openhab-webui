<template>
  <f7-page no-toolbar no-navbar no-swipeback no-swipe-panel login-screen class="setup-wizard" @page:init="pageBeforeIn" @page:beforeout="pageBeforeOut">
         <f7-tabs animated>
            <f7-tab id="intro" ref="intro" tab-active>
              <f7-login-screen-title>
                <img class="intro-logo" src="res/img/openhab-logo.png">
              </f7-login-screen-title>
              <f7-list form style="margin-top: 4rem">
                <f7-list-item
                  title="Language"
                  smart-select
                  :smart-select-params="{openIn: 'popup', searchbar: true, closeOnSelect: true}"
                >
                  <select name="language" @change="(evt) => language = evt.target.value">
                    <option
                      v-for="option in availableLanguages"
                      :key="option.value"
                      :value="option.value"
                    >{{option.label}}</option>
                  </select>
                </f7-list-item>
                <f7-list-item
                  title="Region"
                  smart-select
                  :smart-select-params="{openIn: 'popup', searchbar: true, closeOnSelect: true}"
                >
                  <select name="region" @change="(evt) => region = evt.target.value">
                    <option
                      v-for="option in availableRegions"
                      :key="option.value"
                      :value="option.value"
                    >{{option.label}}</option>
                  </select>
                </f7-list-item>
                <f7-list-item
                  title="Timezone"
                  smart-select
                  :smart-select-params="{openIn: 'popup', searchbar: true, virtualList: true, closeOnSelect: true, virtualListHeight: ($theme.aurora) ? 32 : undefined }"
                >
                  <select name="timezone" @change="(evt) => timezone = evt.target.value">
                    <option
                      v-for="option in availableTimezones"
                      :key="option.value"
                      :value="option.value"
                    >{{option.label}}</option>
                  </select>
                </f7-list-item>
              </f7-list>
              <f7-block class="display-flex flex-direction-column padding">
                <div>
                  <f7-button large fill color="blue" text="Start" @click="start" />
                  <f7-button large color="red" text="Skip Setup" class="margin-top" @click="skipSetup" />
                </div>
              </f7-block>
            </f7-tab>

            <f7-tab id="location" ref="location">
              <f7-block>
                <f7-link
                  icon-ios="f7:arrow_left"
                  icon-aurora="f7:arrow_left"
                  icon-md="material:arrow_back"
                  tab-link="#intro"
                  color="blue"
                  tab-link-active
                ></f7-link>
                <f7-login-screen-title>Set your location</f7-login-screen-title>
              </f7-block>
              <f7-block
                strong
              >Would you like to share your home's location?<br />It will help determining data dependent on your position, like sunrise/sunset times or the weather.
              </f7-block>
              <f7-list>
                <parameter-location :value="location" :config-description="{ label: 'Location of your home', name: 'Location' }" @input="(value) => location = value" />
              </f7-list>
              <f7-block class="padding">
                <f7-row>
                  <f7-col width="100">
                    <f7-button large icon-f7="location_fill" icon-size="24" @click="getCurrentPosition()" text="Retrieve from Device"></f7-button>
                  </f7-col>
                </f7-row>
                <f7-block-footer>
                  <small>This will ask your device for the permission to use its current location, only to help you fill in your current latitude and longitude above. You can revoke the permission afterwards.</small>
                </f7-block-footer>
              </f7-block>
              <f7-block class="display-flex flex-direction-column padding">
                <div>
                  <f7-button v-if="location" large fill color="blue" text="Set Location" @click="setLocation" />
                  <f7-button large color="blue" text="Configure in Settings Later" class="margin-top" @click="skipLocation" />
                </div>
              </f7-block>
            </f7-tab>

            <f7-tab id="addons" ref="addons">
              <f7-block>
                <f7-link
                  icon-ios="f7:arrow_left"
                  icon-aurora="f7:arrow_left"
                  icon-md="material:arrow_back"
                  tab-link="#location"
                  color="blue"
                  tab-link-active
                ></f7-link>
                <f7-login-screen-title ref="selectAddons">Install Add-ons</f7-login-screen-title>
              </f7-block>
              <f7-block
                strong
              >
                Most of openHAB's functionality is provided by add-ons.
                Choose which ones you'd like to install right away.<br /><br />
                <a class="text-color-blue external" target="_blank" href="https://next.openhab.org/addons/">Browse Add-ons on openhab.org</a>
              </f7-block>
              <f7-block class="padding">
                <f7-row>
                  <f7-col width="100">
                    <f7-button large icon-f7="checkmark_seal_fill" icon-size="24" @click="selectAddons" text="Select Add-ons to Install"></f7-button>
                  </f7-col>
                </f7-row>
                <f7-list class="search-list searchbar-found" ref="selectAddons" media-list>
                  <f7-list-item media-item v-for="addon in selectedAddons" :key="addon.id"
                    :header="addon.id" :title="addon.label" :footer="addon.version">
                    <f7-link slot="after" v-if="addon.link" icon-f7="doc_text_search" :external="true" color="gray" target="_blank" :href="addon.link"></f7-link>
                  </f7-list-item>
                </f7-list>
                <f7-block-footer class="margin-bottom">
                  <small>
                    To optimize your system resources, install only the add-ons you need! Installing add-ons can take a while. Please be patient and stay on this page until the operation finishes.
                  </small>
                </f7-block-footer>
                <div>
                  <f7-button v-if="selectedAddons.length > 0" large fill color="blue" :text="`Install ${selectedAddons.length} Add-on${selectedAddons.length > 1 ? 's' : ''}`" @click="installAddons" />
                  <f7-button large color="blue" text="Install Add-ons Later" class="margin-top" @click="skipAddons" />
                </div>
              </f7-block>
            </f7-tab>

            <f7-tab id="wait" ref="wait">
              <f7-block>
                <f7-link
                  icon-ios="f7:arrow_left"
                  icon-aurora="f7:arrow_left"
                  icon-md="material:arrow_back"
                  tab-link="#intro"
                  color="blue"
                  tab-link-active
                  style="visibility: hidden"
                ></f7-link>
                <f7-login-screen-title class="text-color-gray">Please Wait...</f7-login-screen-title>
                <div class="display-flex justify-content-center" style="margin-top: 4rem"><f7-preloader :size="42"></f7-preloader></div>
              </f7-block>
            </f7-tab>

            <f7-tab id="finish" ref="finish">
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
                <f7-login-screen-title>Welcome to openHAB!</f7-login-screen-title>
              </f7-block>

              <f7-block class="display-flex flex-direction-column padding" style="margin-top: 4rem">
                <div>
                  <f7-button large color="blue" text="Finish" @click="finish" />
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
  .tabs-animated-wrap
    overflow-y auto !important

.view-master-detail
  .setup-wizard
    .intro-logo
      visibility hidden
      // margin-top 25%
    .tab
      padding-top 10%
</style>

<script>
import ParameterLocation from '@/components/config/controls/parameter-location.vue'

export default {
  components: {
    ParameterLocation
  },
  data () {
    return {
      availableLanguages: null,
      availableRegions: null,
      availableTimezones: null,
      language: null,
      region: null,
      timezone: null,
      location: null,
      autocompleteAddons: null,
      addons: [],
      selectedAddons: []
    }
  },
  methods: {
    start () {
      this.$oh.api.put('/rest/services/org.openhab.i18n/config', {
        language: this.language,
        region: this.region,
        timezone: this.timezone
      }).then(() => {
        this.$refs.location.show()
      })
    },
    getCurrentPosition () {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.location = position.coords.latitude + ',' + position.coords.longitude
        }, (error) => {
          this.$f7.dialog.alert(
            error.message,
            'Error while retrieving current position'
          )
        })
      } else {
        this.$f7.dialog.alert('Geolocation is not available', 'Sorry')
      }
    },
    skipSetup () {
      const self = this
      this.$f7.dialog.confirm(
        `Are you sure? If you skip the setup wizard, you will only have a minimal system and will still need to configure it.`,
        'Skip Setup',
        () => {
          self.$f7.panel.get('left').enableVisibleBreakpoint()
          this.$nextTick(() => {
            self.$f7.views.main.router.navigate('/', { clearPreviousHistory: true })
          })
        })
    },
    setLocation () {
      this.$oh.api.put('/rest/services/org.openhab.i18n/config', {
        location: this.location
      }).then(() => {
        this.$refs.addons.show()
      })
    },
    skipLocation () {
      this.$refs.addons.show()
    },
    selectAddons () {
      if (this.autocompleteAddons) this.autocompleteAddons.open()
    },
    installAddons () {
      const self = this
      const checkInterval = 2 // check the add-ons statuses every 2 seconds

      this.$refs.wait.show(false)

      const addonsCount = this.selectedAddons.length
      let progress = 0

      const progressDialog = this.$f7.dialog.progress('Installing add-ons...', progress)

      const checkAddonStatus = function (addon) {
        return new Promise((resolve, reject) => {
          self.$oh.api.get('/rest/addons/' + addon.id).then((data) => {
            if (data.installed) {
              console.log(`Add-on ${addon.id} installed!`)
              resolve(data)
            } else {
              console.log(`Add-on ${addon.id} still not installed. Trying again in ${checkInterval} secs...`)
              reject(data)
            }
          }).catch((err) => {
            console.log(`Error while querying API to check addon: ${addon.id}: ${err}'. Trying again in ${checkInterval} secs...`)
            reject(err)
          })
        })
      }

      const installNextAddon = function () {
        // no more add-ons to install => go to next screen
        if (!self.selectedAddons.length) {
          progressDialog.close()
          progressDialog.destroy()
          self.$refs.finish.show()
          return
        }

        // install next add-on
        progressDialog.setText(`${addonsCount - self.selectedAddons.length + 1} of ${addonsCount}`)
        progressDialog.setProgress(((addonsCount - self.selectedAddons.length + 1) / addonsCount) * 100)
        const addon = self.selectedAddons.shift()
        console.log('Installing add-on: ' + addon.id)
        progressDialog.setTitle(`Installing ${addon.label}...`)

        self.$oh.api.post('/rest/addons/' + addon.id + '/install', {}, 'text').then((data) => {
          const checkTimer = setInterval(() => {
            checkAddonStatus(addon).then((addon) => {
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
      this.$refs.finish.show()
    },
    finish () {
      this.$f7.panel.get('left').enableVisibleBreakpoint()
      this.$nextTick(() => {
        this.$f7.views.main.router.navigate('/', { clearPreviousHistory: true })
      })
    },
    pageBeforeIn () {
      this.$f7.panel.get('left').disableVisibleBreakpoint()
    },
    pageBeforeOut (e, page) {
      this.$f7.panel.get('left').enableVisibleBreakpoint()
      // create the overview page to prevent this setup wizard from being launched again
      this.$oh.api.post('/rest/ui/components/ui:page', {
        uid: 'overview',
        component: 'oh-layout-page',
        config: {
          label: 'Overview'
        },
        slots: {
          default: null,
          masonry: null
        }
      }).then((data) => {
        // this will force the pages to be refreshed
        this.$f7.emit('sidebarRefresh', null)
      })
    }
  },
  mounted () {
    this.$oh.api.get('/rest/config-descriptions/system:i18n').then((data) => {
      this.availableLanguages = data.parameters.find(p => p.name === 'language').options
      this.availableRegions = data.parameters.find(p => p.name === 'region').options
      this.availableTimezones = data.parameters.find(p => p.name === 'timezone').options
    })
    this.$oh.api.get('/rest/addons').then((data) => {
      this.addons = data
      const self = this
      this.autocompleteAddons = this.$f7.autocomplete.create({
        openIn: 'popup',
        pageTitle: 'Select Add-ons to Install',
        searchbarPlaceholder: 'Try: astro, mqtt, hue, knx...',
        openerEl: this.$refs.selectAddons,
        multiple: true,
        autoFocus: true,
        source: (query, render) => {
          if (query.length === 0) {
            render(self.addons.filter((a) => !a.installed).map((a) => a.label))
          } else {
            render(self.addons.filter((a) => !a.installed && (a.label.indexOf(query) >= 0 || a.id.indexOf(query) >= 0)).map((a) => a.label))
          }
        },
        on: {
          change (value) {
            const selected = value.map((label) => self.addons.find((a) => a.label === label))
            self.$set(self, 'selectedAddons', selected)
          }
        }
      })
    })
  }
}
</script>
