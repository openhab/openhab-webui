<template>
  <f7-page @page:afterin="onPageAfterIn" class="thing-add-page">
    <f7-navbar :title="(ready) ? 'New ' + thingType.label : 'New Thing'" back-link="Back">
      <f7-nav-right class="if-not-aurora">
        <f7-link v-if="theme.md"
                 @click="save()"
                 icon-md="material:save"
                 icon-only />
        <f7-link v-if="!theme.md" @click="save()">
          Add
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block v-if="ready" class="block-narrow">
      <f7-col>
        <thing-general-settings :thing="thing"
                                :thing-type="thingType"
                                :createMode="true"
                                :things="things"
                                :ready="true" />
        <f7-block-title medium>
          {{ thingType.label }}
        </f7-block-title>
        <div class="margin thing-type-description" v-html="thingType.description" />
      </f7-col>
    </f7-block>
    <!-- skeletons for not ready -->
    <f7-block v-else class="block-narrow skeleton-text skeleton-effect-blink">
      <thing-general-settings :thing="thing"
                              :thing-type="thingType"
                              :createMode="true"
                              :ready="false" />
      <f7-col>
        <f7-block-title>____ _______</f7-block-title>
        <div class="margin">
          ____ ____ ____ _____ ___ __ ____ __ ________ __ ____ ___ ____
        </div>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready" class="block-narrow">
      <config-sheet ref="parameters"
                    :parameter-groups="thingType.parameterGroups"
                    :parameters="thingType.configParameters"
                    :configuration="thing.configuration" />
    </f7-block>

    <div v-if="ready" class="if-aurora display-flex justify-content-center margin">
      <div class="flex-shrink-0">
        <f7-button class="padding-left padding-right"
                   style="width: 150px"
                   color="blue"
                   large
                   raised
                   fill
                   @click="save">
          Create Thing
        </f7-button>
      </div>
    </div>
  </f7-page>
</template>

<style lang="stylus">
.thing-add-page
  .thing-type-description
    h1
      font-size 16px
    h2
      font-size 12px
    h3
      font-size 11px
</style>

<script>
import { utils } from 'framework7'
import { f7, theme } from 'framework7-vue'

import ConfigSheet from '@/components/config/config-sheet.vue'

import ThingGeneralSettings from '@/components/thing/thing-general-settings.vue'
import ThingMixin from '@/components/thing/thing-mixin'

export default {
  mixins: [ThingMixin],
  props: {
    thingTypeId: String,
    thingCopy: Object,
    f7router: Object
  },
  components: {
    ConfigSheet,
    ThingGeneralSettings
  },
  setup () {
    return { theme }
  },
  data () {
    if (this.thingCopy) {
      delete this.thingCopy.editable
      delete this.thingCopy.properties
      delete this.thingCopy.statusInfo
    }
    return {
      ready: false,
      currentTab: 'info',
      things: [],
      thing: this.thingCopy || {
        UID: '',
        label: '',
        configuration: {},
        channels: [],
        thingTypeUID: this.thingTypeId
      },
      thingType: {},
      codePopupOpened: false
    }
  },
  computed: {
    isExtensible () {
      if (!this.thingType || !this.thingType.extensibleChannelTypeIds) return false
      return this.thingType.extensibleChannelTypeIds.length > 0
    }
  },
  methods: {
    onPageAfterIn () {
      if (this.ready) return
      this.$oh.api.get('/rest/thing-types/' + this.thingTypeId).then((data) => {
        this.thingType = data
        try {
          this.thing.ID = utils.id()
          this.thing.UID = this.thingTypeId + ':' + this.thing.ID
        } catch (e) {
          console.log('Cannot generate ID: ' + e)
        }
        if (!this.thingCopy) this.thing.label = this.thingType.label

        if (this.thingCopy) {
          if (this.thing.bridgeUID) this.thing.UID = [this.thing.thingTypeUID, this.thing.bridgeUID.substring(this.thing.bridgeUID.lastIndexOf(':') + 1), this.thing.ID].join(':')
          if (this.isExtensible) {
            this.thing.channels.forEach((ch) => {
              ch.uid = this.thing.UID + ':' + ch.id
            })
          } else {
            this.thing.channels = []
          }
        }

        this.$oh.api.get('/rest/things?summary=true&staticDataOnly=true').then((things) => {
          this.things = things
          this.ready = true
        })
      })
    },
    save () {
      if (!this.thing.ID) {
        f7.dialog.alert('Please give a unique identifier')
        return
      }
      const uidValidationError = this.validateThingUID(this.thing.UID, this.thing.ID)
      if (uidValidationError !== '') {
        f7.dialog.alert('Invalid Thing ID: ' + uidValidationError)
        return
      }
      if (!this.thing.label) {
        f7.dialog.alert('Please give a name')
        return
      }
      if (!this.$refs.parameters.isValid()) {
        f7.dialog.alert('Please review the configuration and correct validation errors')
        return
      }
      if (this.thingCopy) {
        this.thing.channels.forEach((ch) => {
          ch.uid = this.thing.UID + ':' + ch.id
        })
      }

      this.$oh.api.post('/rest/things', this.thing)
        .then(() => {
          f7.toast.create({
            text: 'Thing created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.f7router.navigate('/settings/things/' + this.thing.UID)
        })
        .catch((error) => {
          f7.dialog.alert('Error creating Thing: ' + error)
        })
    }
  }
}
</script>
