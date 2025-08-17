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
        <f7-nav-title>
          Configure {{ filterType.label.toLowerCase() }} filter
        </f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="currentFilter.name" @click="updateModuleConfig">
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
                           :value="currentFilter.name"
                           @input="currentFilter.name = $event.target.value"
                           :disabled="!createMode"
                           :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                           required
                           validate
                           pattern="[A-Za-z0-9_]+"
                           error-message="Required. A-Z,a-z only" />
          </f7-list>
        </f7-col>
        <f7-col>
          <f7-block-title medium>
            Configuration
          </f7-block-title>
          <config-sheet ref="config-sheet"
                        :parameter-groups="[]"
                        :parameters="filterConfigDescriptionParameters"
                        :configuration="currentFilter" />
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  components: { ConfigSheet },
  props: ['filter', 'filterType', 'filterConfigDescriptionParameters'],
  emits: ['filterUpdate'],
  data () {
    return {
      createMode: !this.filter,
      currentFilter: this.filter || {
        name: null
      }
    }
  },
  methods: {
    updateModuleConfig () {
      if (!this.$refs['config-sheet'].isValid()) {
        this.$f7.dialog.alert('Please review the configuration and correct validation errors')
        return
      }
      if (this.filterType.name === 'includeFilters') {
        if (this.currentFilter.upper <= this.currentFilter.lower) {
          this.$f7.dialog.alert('The lower bound value must be less than the upper bound value')
          return
        }
      }
      this.$f7.emit('filterUpdate', this.currentFilter, this.filterType.name)
      this.$refs.modulePopup.close()
    }
  }
}
</script>
