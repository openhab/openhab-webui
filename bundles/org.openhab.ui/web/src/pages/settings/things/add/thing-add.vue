<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar :title="(ready) ? 'New ' + thingType.label : 'New Thing'" back-link="Back">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Add</f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block v-if="ready" class="block-narrow padding-left padding-right">
      <f7-col>
        <h3>{{thingType.label}}</h3>
        <div v-html="thingType.description"></div>
      </f7-col>
    </f7-block>
    <!-- skeletons for not ready -->
    <f7-block v-else class="block-narrow padding-left padding-right skeleton-text skeleton-effect-blink">
      <f7-col>
        <h3>____ _______</h3>
        <div>____ ____ ____ _____ ___ __ ____ __ ________ __ ____ ___ ____</div>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready" class="block-narrow">
      <thing-general-settings :thing="thing" :thing-type="thingType" :createMode="true" />
      <config-sheet
        :parameter-groups="thingType.parameterGroups"
        :parameters="thingType.configParameters"
        :configuration="thing.configuration"
      />
    </f7-block>

  </f7-page>
</template>

<style lang="stylus">
code.textual-definition pre {
  overflow-x: auto;
  white-space: normal;
}

pre.textual-definition {
  padding: 5px;
}

textarea.textual-definition {
  position: absolute;
  top: var(--f7-toolbar-height);
  left: 5px;
  right: 5px;
  bottom: 0;
  width: calc(100% - 10px);
  font-family: monospace;
}

.md .code-popup {
  margin-bottom: 0 !important;
}

.ios .code-popup {
  margin-bottom: 44px !important;
}

.code-popup {
  width: 100%;
  position: fixed;
  bottom: 0 !important;
  top: var(--f7-toolbar-height) !important;
  // margin -2px !important
  background-color: white !important;
  border-top: 2px solid #555;

  // z-index 1000 !important
  code {
    max-height: 50% !important;
    overflow-y: auto !important;
  }
}
</style>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

import ThingGeneralSettings from '@/components/thing/thing-general-settings.vue'

function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export default {
  components: {
    ConfigSheet,
    ThingGeneralSettings
  },
  props: ['thingTypeId'],
  data () {
    return {
      ready: false,
      currentTab: 'info',
      thing: {
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
  methods: {
    onPageAfterIn () {
      if (this.ready) return
      this.$oh.api.get('/rest/thing-types/' + this.thingTypeId).then(data => {
        this.thingType = data
        try {
          this.thing.ID = uuidv4().split('-')[0]
          this.thing.UID = this.thingTypeId + ':' + this.thing.ID
        } catch (e) {
          console.log('Cannot generate ID: ' + e)
        }
        this.thing.label = this.thingType.label
        this.ready = true
      })
    },
    save () {
      if (!this.thing.ID) {
        this.$f7.dialog.alert('Please give an unique identifier')
        return
      }
      if (!this.thing.label) {
        this.$f7.dialog.alert('Please give a name')
        return
      }
      this.thing.UID = this.thingTypeId + ':' + this.thing.ID

      this.$oh.api.post('/rest/things', this.thing).then(() => {
        this.$f7.toast.create({
          text: 'Thing created',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
      setTimeout(() => { this.$f7router.navigate('/settings/things/', { reloadCurrent: true }) }, 300)
    }
  }
}
</script>
