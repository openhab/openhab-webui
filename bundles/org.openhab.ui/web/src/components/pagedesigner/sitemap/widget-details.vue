<template>
  <f7-card v-if="widget">
    <f7-card-content>
      <f7-list class="widget-detail" inline-labels>
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
        <ul id="additional" class="additional-controls">
          <!-- additional controls -->
          <f7-list-input v-if="supports('url')" label="URL" type="url" :value="widget.config.url" @input="updateParameter('url', $event)" clear-button />
          <f7-list-input v-if="supports('refresh')" label="Refresh interval (ms)" type="number" min="1" :value="widget.config.refresh" @input="updateParameter('refresh', $event)" clear-button />
          <f7-list-item v-if="supports('encoding')" title="Encoding" smart-select :smart-select-params="{openIn: 'popover', closeOnSelect: true}">
            <select name="encodings" :value="widget.config.encoding" @change="updateParameter('encoding', $event)">
              <option v-for="def in ENCODING_DEFS" :key="def.key" :value="def.key">
                {{ def.value }}
              </option>
            </select>
          </f7-list-item>
          <persistence-picker v-if="supports('service')" style="padding-left:0" title="Persistence service" :value="widget.config.service" @input="(value) => widget.config.service = value" />
          <f7-list-input v-if="supports('period')" label="Period" type="text"
                         placeholder="PnYnMnDTnHnMnS-PnYnMnDTnHnMnS"
                         validate pattern="^((P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])-)?-?(P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])$"
                         :value="widget.config.period" @input="updateParameter('period', $event)" clear-button />
          <f7-list-input v-if="supports('height')" label="Height" type="number" min="1" :value="widget.config.height" @input="updateParameter('height', $event)" clear-button />
          <f7-list-input v-if="supports('minValue')" label="Minimum" type="number" :value="widget.config.minValue" @input="updateParameter('minValue', $event)" clear-button />
          <f7-list-input v-if="supports('maxValue')" label="Maximum" type="number" :value="widget.config.maxValue" @input="updateParameter('maxValue', $event)" clear-button />
          <f7-list-input v-if="supports('step')" label="Step" type="number" min="0" :value="widget.config.step" @input="updateParameter('step', $event)" clear-button />
          <f7-list-input v-if="supports('yAxisDecimalPattern')" label="Y-axis decimal pattern" type="text"
                         placeholder="##0.0"
                         validate pattern="^(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?(?:';'|[^;])*(?:;(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?.*)?$"
                         :value="widget.config.yAxisDecimalPattern" @input="updateParameter('yAxisDecimalPattern', $event)" clear-button />
          <f7-list-item v-if="supports('switchEnabled')" title="Switch enabled">
            <f7-toggle slot="after" :checked="widget.config.switchEnabled" @toggle:change="widget.config.switchEnabled = $event" />
          </f7-list-item>
          <f7-list-item v-if="supports('releaseOnly')" title="Release only">
            <f7-toggle slot="after" :checked="widget.config.releaseOnly" @toggle:change="widget.config.releaseOnly = $event" />
          </f7-list-item>
          <f7-list-item v-if="supports('legend')" title="Legend">
            <f7-toggle slot="after" :checked="widget.config.legend" @toggle:change="widget.config.legend = $event" />
          </f7-list-item>
          <f7-list-item v-if="supports('forceAsItem')" title="Force as item">
            <f7-toggle slot="after" :checked="widget.config.forceAsItem" @toggle:change="widget.config.forceAsItem = $event" />
          </f7-list-item>
          <f7-list-item v-if="supports('inputHint')" title="Hint" smart-select :smart-select-params="{openIn: 'popover', closeOnSelect: true}">
            <select name="inputHints" required :value="widget.config.inputHint" @change="updateParameter('inputHint', $event)">
              <option v-for="def in INPUT_HINT_DEFS" :key="def.key" :value="def.key">
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

<style lang="stylus">
.widget-detail
  .item-inner:after
    height 0px !important /* remove all lines between params */
  .additional-controls:before
    display block !important
#additional:before
  display block !important /* need two selectors to override the important Vue card css */
</style>

<script>
import { Categories } from '@/assets/categories.js'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import PersistencePicker from '@/components/config/controls/persistence-picker.vue'

export default {
  components: {
    ItemPicker,
    PersistencePicker
  },
  props: ['widget', 'createMode'],
  data () {
    return {
      iconInputId: '',
      iconAutocomplete: null
    }
  },
  created () {
    this.ADDITIONAL_CONTROLS = {
      Image: ['url', 'refresh'],
      Video: ['url', 'encoding'],
      Chart: ['service', 'period', 'refresh', 'legend', 'forceAsItem', 'yAxisDecimalPattern'],
      Webview: ['url', 'height'],
      Mapview: ['height'],
      Slider: ['switchEnabled', 'releaseOnly', 'minValue', 'maxValue', 'step'],
      Setpoint: ['minValue', 'maxValue', 'step'],
      Input: ['inputHint'],
      Default: ['height']
    }
    this.ENCODING_DEFS = [
      { key: 'mjpeg', value: 'MJPEG Video' },
      { key: 'HLS', value: 'HTTP Live Streaming' }
    ]
    this.INPUT_HINT_DEFS = [
      { key: 'text', value: 'Text' },
      { key: 'number', value: 'Number' },
      { key: 'date', value: 'Date' },
      { key: 'time', value: 'Time' },
      { key: 'datetime', value: 'Date and Time' }
    ]
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
      if (!this.ADDITIONAL_CONTROLS[this.widget.component]) return false
      return (this.ADDITIONAL_CONTROLS[this.widget.component].indexOf(parameter) >= 0)
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
