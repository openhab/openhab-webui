<template>
  <f7-popup :opened="opened" class="moduleconfig-popup">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="$emit('close')" />
        </f7-nav-left>
        <f7-nav-title> Configure cron strategy </f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="currentCronStrategy.name && currentCronStrategy.cronExpression" @click="updateCronStrategy"> Done </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block class="no-margin no-padding">
        <f7-col>
          <f7-list>
            <f7-list-input
              ref="name"
              label="Name"
              type="text"
              placeholder="Required"
              :value="currentCronStrategy.name"
              @input="currentCronStrategy.name = $event.target.value"
              :disabled="!createMode ? true : null"
              :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
              required
              validate
              pattern="[A-Za-z0-9_]+"
              error-message="Required. A-Z,a-z only" />
          </f7-list>
        </f7-col>
        <f7-col>
          <f7-block-title medium class="padding-bottom"> Configuration </f7-block-title>
          <f7-list>
            <f7-list-group>
              <parameter-cronexpression
                ref="cronExpression"
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
import cloneDeep from 'lodash/cloneDeep'
import ParameterCronexpression from '@/components/config/controls/parameter-cronexpression.vue'

export default {
  components: {
    ParameterCronexpression
  },
  emits: ['close', 'cronStrategyConfigUpdate'],
  props: {
    opened: Boolean,
    persistence: Object,
    cronStrategy: Object
  },
  data () {
    return {
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
  computed: {
    createMode () {
      return !this.cronStrategy
    }
  },
  watch: {
    cronStrategy: {
      handler (newVal) {
        this.currentCronStrategy = newVal || {
          name: null,
          cronExpression: null
        }
      },
      immediate: true
    }
  },
  methods: {
    updateCronStrategy () {
      if (!f7.input.validateInputs(this.$refs.name.$el) || !f7.input.validateInputs(this.$refs.cronExpression.$el)) {
        f7.dialog.alert('Please review the configuration and correct validation errors')
        return
      }

      // Modify persistence directly and save the strategy
      if (!this.persistence.cronStrategies) this.persistence.cronStrategies = []

      // Check for duplicates (unless editing existing)
      const existingIndex = this.persistence.cronStrategies.findIndex((cs) => cs.name === this.currentCronStrategy.name)
      if (this.createMode && existingIndex !== -1) {
        f7.dialog.alert('A (cron) strategy with the same name already exists!')
        return
      }

      // Add or update in persistence
      if (this.createMode) {
        this.persistence.cronStrategies.push(cloneDeep(this.currentCronStrategy))
      } else if (existingIndex !== -1) {
        this.persistence.cronStrategies[existingIndex] = cloneDeep(this.currentCronStrategy)
      }

      // Emit via Vue event system so parent can listen directly
      this.$emit('cronStrategyConfigUpdate', this.currentCronStrategy)
      this.$emit('close')
    }
  }
}
</script>
