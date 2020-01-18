<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="`Add a new Thing: ${bindingId}`" back-link="Back">
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          class="searchbar-things"
          :init="initSearchbar"
          search-container=".thing-type-list"
          search-in=".item-title, .item-header, .item-footer"
          remove-diacritics
          :disable-button="!$theme.aurora"
        ></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <!-- <f7-list-index
      ref="listIndex"
      list-el=".thing-type-list"
      :scroll-list="true"
      :label="true"
    ></f7-list-index> -->
    <f7-block class="block-narrow">
      <f7-col>
        <div v-if="discoverySupported" class="display-flex justify-content-center">
          <div class="flex-shrink-0">
            <f7-button class="padding-left padding-right" style="width: 150px" color="blue" large raised fill :disabled="scanning" @click="scan">{{(scanning) ? 'Scanning...' : 'Rescan'}}</f7-button>
          </div>
        </div>
        <p class="margin-left margin-right" style="height: 30px" id="scan-progress"></p>
        <f7-block-title v-if="discoverySupported && scanResults.length">Discovered Things</f7-block-title>
        <!-- <f7-list class="col thing-type-list" v-if="scanning">
          <f7-list-item title="Scanning for things...">
            <f7-preloader slot="media" :size="42"></f7-preloader>
          </f7-list-item>
        </f7-list> -->
        <!-- <f7-list class="col thing-type-list" v-if="ready && discoverySupported && !scanning && !scanResults.length">
          <f7-list-item
            title="No discovery results.">
            <f7-button slot="after" @click="scan()">Retry</f7-button>
          </f7-list-item>
        </f7-list> -->
        <f7-list class="col thing-type-list" v-if="scanResults.length">
          <f7-list-item v-for="entry in scanResults"
            :key="entry.thingUID"
            :link="true"
            @click="approve(entry)"
            media-item
            :title="entry.label"
            :subtitle="entry.representationProperty ? entry.properties[entry.representationProperty] : ''"
            :footer="entry.thingTypeUID">
          </f7-list-item>
          <f7-list-button v-show="scanResults.length > 1" title="Add All" @click="approveAll" color="blue"></f7-list-button>
        </f7-list>

        <f7-block-title>Add Manually</f7-block-title>
        <f7-list>
          <ul v-if="!ready">
          <f7-list-item
            v-for="n in 10"
            :key="n"
            :class="`skeleton-text skeleton-effect-blink`"
            title="Label of the thing type"
            footer="This contains the description of the thing type"
            header="thingTypeUID"
            media-item
          >
          </f7-list-item>
          </ul>
          <f7-list-item v-else v-for="thingType in thingTypes"
            :key="thingType.UID"
            :link="thingType.UID"
            :title="thingType.label"
            :footer="thingType.description"
            :header="thingType.UID"
            :badge="thingType.bridge ? 'Bridge' : ''" badge-color="blue"
            media-item
          >
          </f7-list-item>
        </f7-list>

      </f7-col>
    </f7-block>
    <f7-block v-if="!loading && !thingTypes.length" class="block-narrow">
      <f7-col>
        <f7-block strong>
          <p>No thing types can be added with this binding.</p>
        </f7-block>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
  props: ['bindingId'],
  data () {
    return {
      ready: false,
      loading: false,
      initSearchbar: false,
      thingTypes: [],
      discoverySupported: false,
      scanning: false,
      scanResults: [],
      scanTimeout: 0,
      scanProgress: 0,
      intervalId: 0
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
      this.loading = true
      this.$oh.api.get('/rest/thing-types').then((data) => {
        this.thingTypes = data.filter((tt) => tt.UID.split(':')[0] === this.bindingId && tt.listed)
          .sort((a, b) => {
            if (a.bridge && !b.bridge) return -1
            if (b.bridge && !a.bridge) return 1
            return a.label.localeCompare(b.label)
          })
        this.loading = false
        this.ready = true
        this.initSearchbar = true
        this.$oh.api.get('/rest/discovery').then((data) => {
          if (data.indexOf(this.bindingId) >= 0) {
            this.discoverySupported = true
            this.scan()
          }
        })
      })
    },
    scan () {
      this.scanning = true
      this.$oh.api.postPlain('/rest/discovery/bindings/' + this.bindingId + '/scan', null, 'text/plain', 'text/plain').then((data) => {
        try {
          this.loadInbox()
          this.scanTimeout = parseInt(data)
          this.scanProgress = 0
          let progressBarEl = this.$f7.progressbar.show('#scan-progress', 0, 'blue')
          this.intervalId = setInterval(() => {
            this.scanProgress += 1
            this.$f7.progressbar.set(progressBarEl, this.scanProgress * 100 / this.scanTimeout)
          }, 1000)
          setTimeout(() => {
            this.scanning = false
            clearInterval(this.intervalId)
            this.intervalId = 0
            this.$f7.progressbar.hide(progressBarEl)
            this.loadInbox()
          }, this.scanTimeout * 1000)
        } catch (e) {
          this.scanning = false
        }
      })
    },
    loadInbox () {
      if (this.loading) return
      this.loading = true
      this.$oh.api.get('/rest/inbox').then((data) => {
        this.loading = false
        this.scanResults = data.filter((e) => e.thingTypeUID.split(':')[0] === this.bindingId && e.flag !== 'IGNORED')
      })
    },
    approve (entry) {
      console.log(`Add ${entry.thingUID} as thing`)
      this.$f7.dialog.prompt(`This will create a new Thing ${entry.thingUID} with the following name:`,
        'Add as Thing',
        (name) => {
          this.$oh.api.postPlain(`/rest/inbox/${entry.thingUID}/approve`, name).then((res) => {
            this.$f7.toast.create({
              text: 'Entry approved',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
            this.$f7router.back('/settings/things/', { force: true })
          }).catch((err) => {
            this.$f7.toast.create({
              text: 'Error during thing creation: ' + err,
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          })
        },
        null,
        entry.label)
    },
    approveAll () {
      this.$f7.dialog.confirm('Add all discovered Things?', 'Add Things', () => {
        const promises = this.scanResults.map((i) => this.$oh.api.postPlain('/rest/inbox/' + i.thingUID + '/approve', i.label))
        let dialog = this.$f7.dialog.progress(`Adding Things`)
        Promise.all(promises).then((data) => {
          this.$f7.toast.create({
            text: `Things added`,
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          dialog.close()
          this.$f7router.back('/settings/things/', { force: true })
        }).catch((err) => {
          dialog.close()
          console.error(err)
          this.$f7.dialog.alert('An error occurred: ' + err)
        })
      })
    }
  }
}
</script>

<style>
</style>
