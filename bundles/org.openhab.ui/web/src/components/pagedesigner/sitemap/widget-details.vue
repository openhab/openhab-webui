<template>
  <f7-card v-if="widget">
    <f7-card-content>
      <f7-list inline-labels>
        <f7-list-input v-if="widget.component === 'Sitemap'" label="Widget ID" type="text" placeholder="Widget ID" :value="widget.uid" @input="widget.uid = $event.target.value"
                       required validate pattern="[A-Za-z0-9_]+" error-message="Required. Alphanumeric &amp; underscores only" :disabled="!createMode" />
        <f7-list-input label="Label" type="text" placeholder="Label" :value="widget.config.label" @input="updateParameter('label', $event)" clear-button />
        <item-picker v-if="widget.component !== 'Sitemap' && widget.component !== 'Frame'" title="Item" :value="widget.config.item" @input="(value) => widget.config.item = value" />
        <ul v-if="widget.component !== 'Sitemap'">
          <f7-list-input ref="icon" label="Icon" autocomplete="off" type="text" placeholder="temperature, firstfloor..." :value="widget.config.icon"
                         @input="updateParameter('icon', $event)" clear-button>
            <div slot="root-end" style="margin-left: calc(35% + 8px)">
              <oh-icon :icon="widget.config.icon" height="32" width="32" />
            </div>
          </f7-list-input>
          <f7-list-item title="Static icon">
            <f7-toggle slot="after" :checked="widget.config.staticIcon" @toggle:change="widget.config.staticIcon = $event" />
          </f7-list-item>
        </ul>
        <ul>
          <!-- additional controls -->
          <f7-list-input v-if="supports('url')" label="URL" type="url" :value="widget.config.url" @input="updateParameter('url', $event)" clear-button />
          <f7-list-input v-if="supports('refresh')" label="Refresh interval" type="number" :value="widget.config.refresh" @input="updateParameter('refresh', $event)" clear-button />
          <f7-list-input v-if="supports('encoding')" label="Encoding" type="text" :value="widget.config.encoding" @input="updateParameter('encoding', $event)" clear-button />
          <f7-list-input v-if="supports('service')" label="Service" type="text" :value="widget.config.service" @input="updateParameter('service', $event)" clear-button />
          <f7-list-input v-if="supports('period')" label="Period" type="text"
                         placeholder="PnYnMnDTnHnMnS" validate pattern="^P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$|^\d*[YMWDh]$"
                         :value="widget.config.period" @input="updateParameter('period', $event)" clear-button />
          <f7-list-input v-if="supports('height')" label="Height" type="number" :value="widget.config.height" @input="updateParameter('height', $event)" clear-button />
          <f7-list-input v-if="supports('sendFrequency')" label="Frequency" type="number" :value="widget.config.sendFrequency" @input="updateParameter('sendFrequency', $event)" clear-button />
          <f7-list-input v-if="supports('minValue')" label="Minimum" type="number" :value="widget.config.minValue" @input="updateParameter('minValue', $event)" clear-button />
          <f7-list-input v-if="supports('maxValue')" label="Maximum" type="number" :value="widget.config.maxValue" @input="updateParameter('maxValue', $event)" clear-button />
          <f7-list-input v-if="supports('step')" label="Step" type="number" :value="widget.config.step" @input="updateParameter('step', $event)" clear-button />
          <f7-list-input v-if="supports('yAxisDecimalPattern')" label="Y-axis decimal pattern" type="text" :value="widget.config.separator" @input="updateParameter('yAxisDecimalPattern', $event)" clear-button />
          <f7-list-item v-if="supports('switchEnabled')" title="Switch enabled">
            <f7-toggle slot="after" :checked="widget.config.switchEnabled" @toggle:change="widget.config.switchEnabled = $event" />
          </f7-list-item>
          <f7-list-item v-if="supports('legend')" title="Legend">
            <f7-toggle slot="after" :checked="widget.config.legend" @toggle:change="widget.config.legend = $event" />
          </f7-list-item>
          <f7-list-item v-if="supports('forceAsItem')" title="Force as item">
            <f7-toggle slot="after" :checked="widget.config.forceAsItem" @toggle:change="widget.config.forceAsItem = $event" />
          </f7-list-item>
          <f7-list-item v-if="supports('inputHint')" title="Hint" smart-select :smart-select-params="{openIn: 'popover', closeOnSelect: true}">
            <select name="inputHints" required :value="widget.config.inputHint" @change="updateParameter('inputHint', $event)">
              <option v-for="def in inputHintDefs" :key="def.key" :value="def.key">
                {{ def.value }}
              </option>
            </select>
          </f7-list-item>
        </ul>
      </f7-list>
    </f7-card-content>
    <f7-card-footer key="sitemap-widget-buttons-edit-mode" v-if="widget.component !== 'Sitemap'">
      <!-- <f7-button v-if="!editMode && !createMode" color="blue" @click="editMode = true" icon-ios="material:expand_more" icon-md="material:expand_more" icon-aurora="material:expand_more">Edit</f7-button> -->
      <f7-segmented>
        <f7-button color="blue" @click="$emit('moveup', widget)" icon-f7="chevron_up" />
        <f7-button color="blue" @click="$emit('movedown', widget)" icon-f7="chevron_down" />
      </f7-segmented>
      <f7-button v-if="widget.component !== 'Sitemap'" color="red" @click="$emit('remove', widget)">
        Remove
      </f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<style>

</style>

<script>
import { Categories } from '@/assets/categories.js'
import ItemPicker from '@/components/config/controls/item-picker.vue'

export default {
  components: {
    ItemPicker
  },
  props: ['widget', 'createMode'],
  data () {
    return {
      iconInputId: '',
      iconAutocomplete: null,
      additionalControls: {
        Image: ['url', 'refresh'],
        Video: ['url', 'encoding'],
        Chart: ['service', 'period', 'refresh', 'legend', 'forceAsItem', 'yAxisDecimalPattern'],
        Webview: ['url', 'height'],
        Mapview: ['height'],
        Slider: ['sendFrequency', 'switchEnabled', 'minValue', 'maxValue', 'step'],
        Setpoint: ['minValue', 'maxValue', 'step'],
        Colorpicker: ['sendFrequency'],
        Input: ['inputHint'],
        Default: ['height']
      },
      inputHintDefs: [
        { key: 'text', value: 'Text' },
        { key: 'number', value: 'Number' },
        { key: 'date', value: 'Date' },
        { key: 'time', value: 'Time' },
        { key: 'datetime', value: 'Date and Time' }
      ]
    }
  },
  methods: {
    initializeAutocomplete (inputElement) {
      this.iconAutocomplete = this.$f7.autocomplete.create({
        inputEl: inputElement,
        openIn: 'dropdown',
        source (query, render) {
          if (!query || !query.length) {
            render([])
          } else {
            render(Categories.filter((c) => c.toLowerCase().indexOf(query.toLowerCase()) >= 0))
          }
        }
      })
    },
    supports (parameter) {
      if (!this.additionalControls[this.widget.component]) return false
      return (this.additionalControls[this.widget.component].indexOf(parameter) >= 0)
    },
    updateParameter (parameter, $event) {
      let value = $event.target.value
      if (value && $event.target.type === 'number' && !isNaN(value)) {
        value = parseFloat(value)
      }
      this.$set(this.widget.config, parameter, value)
    },
    remove () {
      this.$emit('remove')
    }
  },
  mounted () {
    if (!this.widget) return
    if (!this.widget.config.icon) this.$set(this.widget.config, 'icon', '')
    const iconControl = this.$refs.icon
    if (!iconControl || !iconControl.$el) return
    const inputElement = this.$$(iconControl.$el).find('input')
    this.initializeAutocomplete(inputElement)
  },
  beforeDestroy () {
    if (this.iconControl) {
      this.$f7.autocomplete.destroy(this.iconControl)
    }
  }
}
</script>
