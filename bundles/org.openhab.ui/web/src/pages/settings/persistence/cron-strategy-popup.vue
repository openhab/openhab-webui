<template>
  <f7-popup ref="modulePopup" class="moduleconfig-popup">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left"
                   icon-md="material:arrow_back"
                   icon-aurora="f7:arrow_left"
                   popup-close />
        </f7-nav-left>
        <f7-nav-title> Configure cron strategy </f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="currentCronStrategy.name && currentCronStrategy.cronExpression"
                   @click="updateModuleConfig">
            Done
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block class="no-margin no-padding">
        <f7-col>
          <f7-list>
            <f7-list-input ref="name"
                           label="Name"
                           type="text"
                           placeholder="Required"
                           :value="currentCronStrategy.name"
                           @input="currentCronStrategy.name = $event.target.value"
                           :disabled="!createMode ? true : null"
                           :info="createMode ? 'Note: cannot be changed after the creation' : ''"
                           required
                           validate
                           pattern="[A-Za-z0-9_]+"
                           error-message="Required. A-Z,a-z only" />
          </f7-list>
        </f7-col>
        <f7-col>
          <f7-block-title medium class="padding-bottom">
            Configuration
          </f7-block-title>
          <f7-list>
            <f7-list-group>
              <parameter-cronexpression ref="cronExpression"
                                        :configDescription="cronExpressionConfigDescription"
                                        :value="currentCronStrategy.cronExpression"
                                        @input="currentCronStrategy.cronExpression = $event" />
            </f7-list-group>
          </f7-list>
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>
import { f7 } from 'framework7-vue'

import ParameterCronexpression from '@/components/config/controls/parameter-cronexpression.vue'

export default {
  components: {
    ParameterCronexpression
  },
  props: {
    cronStrategy: Object
  },
  emits: ['cronStrategyConfigUpdate'],
  data () {
    return {
      createMode: !this.cronStrategy,
      currentCronStrategy: this.cronStrategy || {
        name: null,
        cronExpression: null
      },

      cronExpressionConfigDescription: {
        label: 'Cron Expression',
        name: 'cronExpression',
        required: true
      }
    }
  },
  methods: {
    updateModuleConfig () {
      if (!f7.input.validateInputs(this.$refs.name.$el) && !f7.input.validateInputs(this.$refs.cronExpression.$el)) {
        f7.dialog.alert('Please review the configuration and correct validation errors')
        return
      }
      f7.emit('cronStrategyConfigUpdate', this.currentCronStrategy)
      this.$refs.modulePopup.$el.f7Modal.close()
    }
  }
}
</script>
