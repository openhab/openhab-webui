<template>
  <f7-card v-if="widget">
    <f7-card-content>
      <f7-list class="widget-detail" inline-labels>
        <f7-list-input
          v-if="widget.type === 'Sitemap'"
          label="Name"
          type="text"
          placeholder="Sitemap name"
          :value="widget.name"
          @input="widget.name = $event.target.value"
          required
          validate
          pattern="[A-Za-z0-9_]+"
          error-message="Required. Alphanumeric &amp; underscores only"
          :disabled="!createMode || !editable" />
        <f7-list-input
          label="Label"
          type="text"
          placeholder="Label"
          :value="widget.label"
          @input="updateParameter('label', $event)"
          :clear-button="editable"
          :disabled="!editable" />
        <ul v-if="widget.type !== 'Sitemap'" class="format-editor-wrapper">
          <format-editor title="Format" :editable="editable" :value="widget.format" @input="(value) => (widget.format = value)" />
        </ul>
        <ul v-if="widget.type !== 'Sitemap' && !['Frame', 'Buttongrid'].includes(widget.type)">
          <item-picker
            label="Item"
            :value="widget.item"
            @input="(value) => (widget.item = value)"
            class="widget-item"
            :disabled="!editable" />
        </ul>
        <ul>
          <f7-list-input
            ref="icon"
            label="Icon"
            autocomplete="off"
            type="text"
            placeholder="temperature, firstfloor..."
            :value="widget.icon"
            @input="updateParameter('icon', $event)"
            :clear-button="editable"
            :disabled="!editable">
            <template #root-end>
              <div v-if="widget.icon" style="margin-left: calc(25% + 8px)">
                <oh-icon :icon="widget.icon || ''" height="32" width="32" />
              </div>
            </template>
          </f7-list-input>
        </ul>
        <ul v-if="widget.type !== 'Sitemap'">
          <f7-list-item title="Static icon" :disabled="!editable || widget.iconRules?.length > 0">
            <template #after>
              <f7-toggle
                :checked="widget.staticIcon && !widget.iconRules?.length ? true : false"
                @toggle:change="widget.staticIcon = $event" />
            </template>
          </f7-list-item>
        </ul>
        <ul id="additional" class="additional-controls">
          <!-- additional controls -->
          <f7-list-input
            v-if="supports('url')"
            label="URL"
            type="url"
            :value="widget.url"
            @input="updateParameter('url', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-input
            v-if="supports('refresh')"
            label="Refresh interval (ms)"
            type="number"
            min="1"
            :value="widget.refresh"
            @input="updateParameter('refresh', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-item
            v-if="supports('encoding')"
            title="Encoding"
            smart-select
            :smart-select-params="{ openIn: 'popover', closeOnSelect: true }"
            class="widget-smart-select"
            :no-chevron="!editable"
            :disabled="!editable">
            <select name="encodings" :value="widget.encoding?.toLowerCase() || ''" @change="updateParameter('encoding', $event)">
              <option key="" />
              <option v-for="def in ENCODING_DEFS" :key="def.key" :value="def.key">
                {{ def.value }}
              </option>
            </select>
          </f7-list-item>
          <persistence-picker
            v-if="supports('service')"
            style="padding-left: 0"
            title="Persistence service"
            :value="widget.service"
            class="widget-persistence"
            @input="(value) => (widget.service = value)" />
          <f7-list-input
            v-if="supports('period')"
            label="Period"
            type="text"
            placeholder="PnYnMnDTnHnMnS-PnYnMnDTnHnMnS"
            validate
            pattern="^((P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])-)?-?(P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])$"
            :value="widget.period"
            @input="updateParameter('period', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-input
            v-if="supports('height')"
            label="Height"
            type="number"
            min="1"
            :value="widget.height"
            @input="updateParameter('height', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-input
            v-if="supports('minValue')"
            label="Minimum"
            type="number"
            :value="widget.minValue"
            @input="updateParameter('minValue', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-input
            v-if="supports('maxValue')"
            label="Maximum"
            type="number"
            :value="widget.maxValue"
            @input="updateParameter('maxValue', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-input
            v-if="supports('step')"
            label="Step"
            type="number"
            min="0"
            :value="widget.step"
            @input="updateParameter('step', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-input
            v-if="supports('yAxisDecimalPattern')"
            label="Y-axis decimal pattern"
            type="text"
            placeholder="##0.0"
            validate
            pattern="^(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?(?:';'|[^;])*(?:;(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?.*)?$"
            :value="widget.yAxisDecimalPattern"
            @input="updateParameter('yAxisDecimalPattern', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-item
            v-if="supports('interpolation')"
            title="Interpolation"
            smart-select
            :smart-select-params="{ openIn: 'popover', closeOnSelect: true }"
            class="widget-smart-select"
            :no-chevron="!editable"
            :disabled="!editable">
            <select name="interpolations" :value="widget.interpolation?.toLowerCase() || ''" @change="updateParameter('interpolation', $event)">
              <option key="" />
              <option v-for="def in INTERPOLATION_DEFS" :key="def.key" :value="def.key">
                {{ def.value }}
              </option>
            </select>
          </f7-list-item>
          <f7-list-input
            v-if="supports('row')"
            label="Row"
            type="number"
            required
            validate
            min="1"
            :value="widget.row"
            @input="updateParameter('row', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-input
            v-if="supports('column')"
            label="Column"
            type="number"
            required
            validate
            min="1"
            max="12"
            :value="widget.column"
            @input="updateParameter('column', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-input
            v-if="supports('command')"
            label="Click command"
            type="text"
            required
            validate
            :value="widget.command"
            @input="updateParameter('command', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-input
            v-if="supports('releaseCommand')"
            label="Release command"
            type="text"
            :value="widget.releaseCommand"
            @input="updateParameter('releaseCommand', $event)"
            :clear-button="editable"
            :disabled="!editable" />
          <f7-list-item v-if="supports('stateless')" title="Stateless" :disabled="!editable">
            <template #after>
              <f7-toggle :checked="widget.stateless ? true : null" @toggle:change="widget.stateless = $event" />
            </template>
          </f7-list-item>
          <f7-list-item v-if="supports('switchSupport')" title="Switch enabled" :disabled="!editable">
            <template #after>
              <f7-toggle :checked="widget.switchSupport ? true : null" @toggle:change="widget.switchSupport = $event" />
            </template>
          </f7-list-item>
          <f7-list-item v-if="supports('releaseOnly')" title="Release only" :disabled="!editable">
            <template #after>
              <f7-toggle :checked="widget.releaseOnly ? true : null" @toggle:change="widget.releaseOnly = $event" />
            </template>
          </f7-list-item>
          <f7-list-item
            v-if="supports('legend')"
            title="Legend"
            smart-select
            :smart-select-params="{ openIn: 'popover', closeOnSelect: true }"
            class="widget-smart-select"
            :no-chevron="!editable"
            :disabled="!editable">
            <select
              name="legend"
              :value="triStateBooleanSelectValue(widget.legend)"
              @change="updateTriStateBooleanParameter('legend', $event)">
              <option key="" />
              <option v-for="def in LEGEND_DEFS" :key="def.key" :value="String(def.key)">
                {{ def.value }}
              </option>
            </select>
          </f7-list-item>
          <f7-list-item v-if="supports('forceAsItem')" title="Force as item" :disabled="!editable">
            <template #after>
              <f7-toggle :checked="widget.forceAsItem ? true : null" @toggle:change="widget.forceAsItem = $event" />
            </template>
          </f7-list-item>
          <f7-list-item
            v-if="supports('inputHint')"
            title="Hint"
            smart-select
            :smart-select-params="{ openIn: 'popover', closeOnSelect: true }"
            class="widget-smart-select"
            :no-chevron="!editable"
            :disabled="!editable">
            <select
              name="inputHints"
              required
              :value="widget.inputHint?.toLowerCase() || ''"
              @change="updateParameter('inputHint', $event)">
              <option key="" />
              <option v-for="def in INPUT_HINT_DEFS" :key="def.key" :value="def.key">
                {{ def.value }}
              </option>
            </select>
          </f7-list-item>
        </ul>
      </f7-list>
    </f7-card-content>
    <f7-card-footer v-if="editable || widget.type === 'Sitemap'" key="sitemap-widget-buttons-edit-mode" class="widget-details-footer">
      <!-- <f7-button v-if="!editMode && !createMode" color="blue" @click="editMode = true" icon-ios="material:expand_more" icon-md="material:expand_more" icon-aurora="material:expand_more">Edit</f7-button> -->
      <f7-segmented v-if="editable && widget.type !== 'Sitemap'">
        <f7-button color="blue" @click="$emit('moveup', widget)" icon-f7="chevron_up" />
        <f7-button color="blue" @click="$emit('movedown', widget)" icon-f7="chevron_down" />
      </f7-segmented>
      <f7-button v-if="editable || widget.type === 'Sitemap'" color="blue" @click="$emit('duplicate', widget)"> Duplicate </f7-button>
      <f7-button v-if="editable && widget.type !== 'Sitemap'" color="red" @click="$emit('remove', widget)"> Remove </f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.widget-detail
  .item-title
    width 25%
  .item-inner:after
    height 0 !important /* remove all lines between params */
  .additional-controls:before
    display block !important
  .widget-item .item-after
    color var(--f7-block-text-color)
  .widget-smart-select .item-after
    color var(--f7-block-text-color)
  .widget-persistence .item-after
    color var(--f7-block-text-color)
#additional:before
  display block !important /* need two selectors to override the important Vue card css */

.format-editor-wrapper
  margin 0
  padding 0

.widget-details-footer > :only-child
  margin-left auto
  margin-right auto
</style>

<script>
import { f7 } from 'framework7-vue'
import { Categories } from '@/assets/categories.js'
import FormatEditor from '@/components/config/controls/format-editor.vue'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import PersistencePicker from '@/components/config/controls/persistence-picker.vue'
import SitemapMixin from '@/components/pagedesigner/sitemap/sitemap-mixin'

export default {
  mixins: [SitemapMixin],
  components: {
    FormatEditor,
    ItemPicker,
    PersistencePicker
  },
  props: {
    widget: Object,
    editable: Boolean,
    createMode: Boolean
  },
  emits: ['moveup', 'movedown', 'duplicate', 'remove'],
  data() {
    return {
      iconInputId: '',
      iconAutocomplete: null
    }
  },
  methods: {
    initializeAutocomplete(inputElement) {
      this.iconAutocomplete = f7.autocomplete.create({
        inputEl: inputElement,
        openIn: 'dropdown',
        source(query, render) {
          if (!query || !query.length) {
            render([])
          } else {
            render(Categories.filter((c) => c.toLowerCase().indexOf(query.toLowerCase()) >= 0))
          }
        }
      })
    },
    supports(parameter) {
      if (!this.ADDITIONAL_CONTROLS[this.widget.type]) return false
      return this.ADDITIONAL_CONTROLS[this.widget.type].indexOf(parameter) >= 0
    },
    updateParameter(parameter, $event) {
      let value = $event.target.value
      if (value && $event.target.type === 'number' && !isNaN(value)) {
        value = parseFloat(value)
      }
      this.widget[parameter] = value
    },
    triStateBooleanSelectValue(value) {
      if (value === true) return 'true'
      if (value === false) return 'false'
      return ''
    },
    updateTriStateBooleanParameter(parameter, $event) {
      const value = $event.target.value
      if (value === 'true') {
        this.widget[parameter] = true
      } else if (value === 'false') {
        this.widget[parameter] = false
      } else {
        delete this.widget[parameter]
      }
    },
    remove() {
      this.$emit('remove')
    }
  },
  mounted() {
    if (!this.widget) return
    const iconControl = this.$refs.icon
    if (!iconControl || !iconControl.$el) return
    const inputElement = this.$$(iconControl.$el).find('input')
    this.initializeAutocomplete(inputElement)
  },
  beforeUnmount() {
    if (this.iconControl) {
      f7.autocomplete.destroy(this.iconControl)
    }
  }
}
</script>
