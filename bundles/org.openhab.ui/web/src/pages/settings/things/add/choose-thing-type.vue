<template>
  <f7-page class="choose-thing-type" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="`Add a new Thing: ${bindingId}`" back-link="Back">
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-things"
          :init="initSearchbar"
          search-container=".thing-type-list"
          search-item=".media-item"
          search-in=".item-title, .item-header, .item-footer"
          :disable-button="!$theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-block class="block-narrow">
      <f7-col>
        <div v-if="discoverySupported" class="display-flex justify-content-center">
          <div class="flex-shrink-0">
            <f7-button class="padding-left padding-right" style="width: 150px" :color="(scanning) ? 'red' : 'blue'" large raised fill @click="scan">
              {{ (scanning) ? 'Stop Scanning' : 'Scan' }}
            </f7-button>
          </div>
        </div>
        <p class="margin-left margin-right no-margin-bottom" style="height: 30px" id="scan-progress" />
        <f7-block-title v-if="inputSupported">
          Scan Input
        </f7-block-title>
        <config-sheet v-if="inputSupported" class="scan-input" :parameter-groups="[]" :parameters="inputParameters" :configuration="inputConfig" />
        <f7-block-title v-if="discoverySupported && scanResults.length">
          Discovered Things
        </f7-block-title>
        <f7-list class="col thing-type-list" v-if="scanResults.length">
          <f7-list-item v-for="entry in scanResults"
                        :key="entry.thingUID"
                        :link="true"
                        @click="openEntryActions(entry)"
                        media-item
                        :title="entry.label"
                        :subtitle="entry.representationProperty ? entry.properties[entry.representationProperty] : ''"
                        :footer="entry.thingUID" />
          <f7-list-button v-show="scanResults.length > 1" title="Add All" @click="approveAll" color="blue" />
        </f7-list>

        <f7-block-title>Add Manually</f7-block-title>
        <f7-list class="thing-type-list">
          <ul v-if="!ready">
            <f7-list-item
              v-for="n in 10"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the thing type"
              footer="This contains the description of the thing type"
              header="thingTypeUID"
              media-item />
          </ul>
          <ul v-else>
            <f7-list-item v-for="thingType in thingTypes"
                          :key="thingType.UID"
                          :link="thingType.UID"
                          :title="thingType.label"
                          :footer="getHeading(thingType.description)"
                          :header="thingType.UID"
                          :badge="thingType.bridge ? 'Bridge' : ''" badge-color="blue"
                          media-item />
          </ul>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block v-if="!loading && ready && !thingTypes.length" class="block-narrow">
      <f7-col>
        <f7-block strong>
          <p>No thing types can be added with this binding.</p>
        </f7-block>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<style lang="stylus">
.choose-thing-type
  .scan-input
    .list
      margin-top 0
</style>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'
import ThingInboxMixin from '@/pages/settings/things/thing-inbox-mixin'

export default {
  mixins: [ThingInboxMixin],
  components: {
    ConfigSheet
  },
  props: ['bindingId'],
  data () {
    return {
      ready: false,
      loading: false,
      initSearchbar: false,
      things: [], // This is used for Thing UID validation inside thing-mixin.js
      thingTypes: [],
      discoverySupported: false,
      inputSupported: null,
      inputParameters: [],
      inputConfig: {},
      scanning: false,
      scanResults: [],
      scanTimeout: 0,
      scanProgress: 0,
      intervalId: 0,
      scanTimeoutId: 0
    }
  },
  created () {

  },
  methods: {
    onPageBeforeOut () {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = 0
      }
    },
    onPageAfterIn () {
      this.$oh.api.get('/rest/thing-types?bindingId=' + this.bindingId).then((data) => {
        this.thingTypes = data.filter((tt) => tt.UID.split(':')[0] === this.bindingId && tt.listed)
          .sort((a, b) => {
            if (a.bridge && !b.bridge) return -1
            if (b.bridge && !a.bridge) return 1
            return a.label.localeCompare(b.label)
          })
        return Promise.resolve()
      }).then(() => {
        Promise.all([this.loadDiscoveryInfo(), this.loadInbox()]).then(() => {
          this.initSearchbar = true
          this.ready = true
        })
      })
      this.$oh.api.get('/rest/things?summary=true&staticDataOnly=true').then((things) => {
        this.things = things
      })
    },
    finishScanning () {
      this.scanning = false
      if (this.intervalId) clearInterval(this.intervalId)
      if (this.scanTimeoutId) clearTimeout(this.scanTimeoutId)
      this.intervalId = 0
      this.scanTimeoutId = 0
      this.$f7.progressbar.hide('#scan-progress')
      this.loadInbox()
    },
    scan () {
      if (this.scanning) {
        this.finishScanning()
        return
      }
      this.scanning = true
      const query = this.inputConfig.input ? `?input=${encodeURIComponent(this.inputConfig.input)}` : ''
      this.$oh.api.postPlain(`/rest/discovery/bindings/${this.bindingId}/scan${query}`, null, 'text/plain', 'text/plain').then((data) => {
        try {
          this.scanTimeout = parseInt(data)
          this.scanProgress = 0
          let progressBarEl = this.$f7.progressbar.show('#scan-progress', 0, 'blue')
          this.intervalId = setInterval(() => {
            this.scanProgress += 1
            this.$f7.progressbar.set(progressBarEl, this.scanProgress * 100 / this.scanTimeout)
            this.loadInbox()
          }, 1000)
          this.scanTimeoutId = setTimeout(this.finishScanning, this.scanTimeout * 1000)
        } catch (e) {
          this.scanning = false
        }
      })
    },
    /**
     * Load discovery information for the binding.
     *
     * @returns {Promise<void>}
     */
    loadDiscoveryInfo () {
      return this.$oh.api.get(`/rest/discovery/bindings/${this.bindingId}/info`).then((data) => {
        this.discoverySupported = true
        this.inputSupported = data.inputSupported
        if (this.inputSupported) {
          this.inputParameters = [
            {
              advanced: false,
              description: data.inputDescription,
              label: data.inputLabel,
              name: 'input',
              required: false,
              type: 'TEXT'
            }
          ]
        }
        return Promise.resolve()
      }).catch((e) => {
        if (e === 404 || e === 'Not Found') {
          this.discoverySupported = false
          return Promise.resolve()
        } else {
          return Promise.reject(e)
        }
      })
    },
    /**
     * Load discovery inbox entries for the binding.
     *
     * @returns {Promise<void>}
     */
    loadInbox () {
      if (this.loading) return
      this.loading = true
      return this.$oh.api.get('/rest/inbox?includeIgnored=false').then((data) => {
        this.loading = false
        this.scanResults = data.filter((e) => e.thingTypeUID.split(':')[0] === this.bindingId)
        const filterQuery = this.$refs.searchbar?.f7Searchbar.query
        this.initSearchbar = false
        this.$nextTick(() => {
          this.initSearchbar = true
          if (!filterQuery) return
          this.$nextTick(() => {
            const searchbar = this.$refs.searchbar?.f7Searchbar
            searchbar.clear()
            searchbar.search(filterQuery)
          })
        })
        Promise.resolve()
      }).catch((e) => {
        Promise.reject('Failed to load inbox: ' + e)
      })
    },
    openEntryActions (entry) {
      let actions = this.$f7.actions.create({
        convertToPopover: true,
        closeOnEscape: true,
        buttons: [
          [
            {
              text: entry.label,
              label: true
            }
          ],
          [
            this.entryActionsAddAsThingButton(entry, this.loadInbox),
            this.entryActionsCopyThingDefinitionButton(entry, 'DSL', 'text/vnd.openhab.dsl.thing'),
            this.entryActionsCopyThingDefinitionButton(entry, 'YAML File', 'application/yaml')
          ]
        ]
      })

      actions.open()
    },
    approveAll () {
      this.$f7.dialog.confirm('Add all discovered Things?', 'Add Things', () => {
        const promises = this.scanResults.map((i) => this.$oh.api.postPlain('/rest/inbox/' + i.thingUID + '/approve', i.label))
        let dialog = this.$f7.dialog.progress('Adding Things')
        Promise.all(promises).then((data) => {
          this.$f7.toast.create({
            text: 'Things added',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          dialog.close()
          setTimeout(() => { this.$f7router.navigate('/settings/things/', { reloadCurrent: true }) }, 300)
        }).catch((err) => {
          dialog.close()
          console.error(err)
          this.$f7.dialog.alert('An error occurred: ' + err)
        })
      })
    },
    getHeading (description) {
      const subDocument = document.createElement('div')
      subDocument.innerHTML = description

      if (subDocument.childElementCount > 0) {
        return subDocument.firstElementChild.textContent
      } else {
        return description
      }
    }
  }
}
</script>
