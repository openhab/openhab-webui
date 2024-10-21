<template>
  <f7-popup ref="modulePopup" class="moduleconfig-popup">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close />
        </f7-nav-left>
        <f7-nav-title>
          {{ action.label }}
        </f7-nav-title>
        <f7-nav-right>
          <f7-link @click="close">
            Close
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block class="no-margin no-padding">
        <!-- Action Inputs -->
        <f7-col>
          <f7-block-title class="parameter-group-title">
            Action Input
          </f7-block-title>
          <config-sheet v-if="action.inputConfigDescriptions.length > 0" ref="configSheet"
                        :parameter-groups="[]" :parameters="action.inputConfigDescriptions"
                        :configuration="actionInput" :read-only="executing" />
          <div class="margin" v-else>
            There is no input to be configured for this action.
          </div>
        </f7-col>
        <!-- Executing Spinner -->
        <f7-block v-if="executing" class="text-align-center padding-top margin-top">
          <f7-block-title>
            <f7-preloader :size="30" />
            <div>Executing...</div>
          </f7-block-title>
        </f7-block>
        <!-- Execute Button -->
        <f7-col v-if="!executing">
          <f7-list>
            <f7-list-button color="blue" title="Execute Action" @click="execute" />
          </f7-list>
        </f7-col>
        <!-- Action Outputs -->
        <f7-col v-if="!executing && actionOutput">
          <f7-block-title class="parameter-group-title">
            Action Output
          </f7-block-title>
          <div v-if="Object.keys(actionOutput).length === 0" class="margin">
            There is either no output for this action or something went wrong - please check the logs.
          </div>
          <div v-else>
            <f7-list>
              <f7-list-item v-if="actionOutput.result" :floating-label="$theme.md" title="Result">
                {{ actionOutput.result }}
              </f7-list-item>
              <f7-list-item v-if="actionOutput.qrPairingCode" :floating-label="$theme.md" title="QR Pairing Code">
                <vue-qrcode :value="actionOutput.qrPairingCode" />
              </f7-list-item>
              <f7-list-item v-if="actionOutput.manualPairingCode" :floating-label="$theme.md" title="Manual Pairing Code">
                {{ actionOutput.manualPairingCode }}
              </f7-list-item>
              <f7-list-item accordion-item title="Raw Response">
                <f7-accordion-content class="thing-type-description">
                  <div class="margin">
                    <code> {{ actionOutput }} </code>
                  </div>
                </f7-accordion-content>
              </f7-list-item>
            </f7-list>
          </div>
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  components: {
    ConfigSheet,
    'vue-qrcode': () => import(/* webpackChunkName: "vue-qrcode" */ 'vue-qrcode')
  },
  props: ['thingUID', 'action'],
  data () {
    return {
      executing: false,
      actionInput: {},
      actionOutput: null
    }
  },
  methods: {
    execute () {
      if (this.$refs.configSheet?.isValid() === false) {
        this.$f7.dialog.alert('Please review the input and correct validation errors')
        return
      }
      this.executing = true
      this.$oh.api.post(`/rest/actions/${this.thingUID}/${this.action.actionUid}`, this.actionInput)
        .then((data) => {
          this.actionOutput = data
          this.executing = false
        })
    },
    close () {
      this.$refs.modulePopup.close()
    }
  }
}
</script>
