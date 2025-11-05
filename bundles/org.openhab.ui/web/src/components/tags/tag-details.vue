<template>
  <f7-card v-if="tag">
    <f7-card-content>
      <f7-list class="tag-detail" inline-labels>
        <f7-list-input v-if="tag.component === 'Sitemap'"
                       label="Widget ID"
                       type="text"
                       placeholder="Widget ID"
                       :value="tag.uid"
                       @input="tag.uid = $event.target.value"
                       required
                       validate
                       pattern="[A-Za-z0-9_]+"
                       error-message="Required. Alphanumeric &amp; underscores only"
                       :disabled="!createMode" />
        <f7-list-input label="Label"
                       type="text"
                       placeholder="Label"
                       :value="tag.config.label"
                       @input="updateParameter('label', $event)"
                       clear-button />
        <item-picker v-if="tag.component !== 'Sitemap' && tag.component !== 'Frame'"
                     title="Item"
                     :value="tag.config.item"
                     @input="(value) => tag.config.item = value" />
        <ul v-if="tag.component !== 'Sitemap'">
          <f7-list-input ref="icon"
                         label="Icon"
                         autocomplete="off"
                         type="text"
                         placeholder="temperature, firstfloor..."
                         :value="tag.config.icon"
                         @input="updateParameter('icon', $event)"
                         clear-button>
            <template #root-end>
              <div style="margin-left: calc(35% + 8px)">
                <oh-icon :icon="tag.config.icon"
                         height="32"
                         width="32" />
              </div>
            </template>
          </f7-list-input>
          <f7-list-item title="Static icon">
            <template #after>
              <f7-toggle :checked="tag.config.staticIcon"
                         @toggle:change="tag.config.staticIcon = $event" />
            </template>
          </f7-list-item>
        </ul>
        <ul id="additional" class="additional-controls">
          <!-- additional controls -->
          <f7-list-input v-if="supports('url')"
                         label="URL"
                         type="url"
                         :value="tag.config.url"
                         @input="updateParameter('url', $event)"
                         clear-button />
          <f7-list-input v-if="supports('refresh')"
                         label="Refresh interval (ms)"
                         type="number"
                         min="1"
                         :value="tag.config.refresh"
                         @input="updateParameter('refresh', $event)"
                         clear-button />
          <f7-list-item v-if="supports('encoding')"
                        title="Encoding"
                        smart-select
                        :smart-select-params="{openIn: 'popover', closeOnSelect: true}">
            <select name="encodings"
                    :value="tag.config.encoding"
                    @change="updateParameter('encoding', $event)">
              <option v-for="def in ENCODING_DEFS"
                      :key="def.key"
                      :value="def.key">
                {{ def.value }}
              </option>
            </select>
          </f7-list-item>
          <persistence-picker v-if="supports('service')"
                              style="padding-left:0"
                              title="Persistence service"
                              :value="tag.config.service"
                              @input="(value) => tag.config.service = value" />
          <f7-list-input v-if="supports('period')"
                         label="Period"
                         type="text"
                         placeholder="PnYnMnDTnHnMnS-PnYnMnDTnHnMnS"
                         validate
                         pattern="^((P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])-)?-?(P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])$"
                         :value="tag.config.period"
                         @input="updateParameter('period', $event)"
                         clear-button />
          <f7-list-input v-if="supports('height')"
                         label="Height"
                         type="number"
                         min="1"
                         :value="tag.config.height"
                         @input="updateParameter('height', $event)"
                         clear-button />
          <f7-list-input v-if="supports('minValue')"
                         label="Minimum"
                         type="number"
                         :value="tag.config.minValue"
                         @input="updateParameter('minValue', $event)"
                         clear-button />
          <f7-list-input v-if="supports('maxValue')"
                         label="Maximum"
                         type="number"
                         :value="tag.config.maxValue"
                         @input="updateParameter('maxValue', $event)"
                         clear-button />
          <f7-list-input v-if="supports('step')"
                         label="Step"
                         type="number"
                         min="0"
                         :value="tag.config.step"
                         @input="updateParameter('step', $event)"
                         clear-button />
          <f7-list-input v-if="supports('yAxisDecimalPattern')"
                         label="Y-axis decimal pattern"
                         type="text"
                         placeholder="##0.0"
                         validate
                         pattern="^(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?(?:';'|[^;])*(?:;(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?.*)?$"
                         :value="tag.config.yAxisDecimalPattern"
                         @input="updateParameter('yAxisDecimalPattern', $event)"
                         clear-button />
          <f7-list-input v-if="supports('row')"
                         label="Row"
                         type="number"
                         required
                         validate
                         min="1"
                         :value="tag.config.row"
                         @input="updateParameter('row', $event)"
                         clear-button />
          <f7-list-input v-if="supports('column')"
                         label="Column"
                         type="number"
                         required
                         validate
                         min="1"
                         max="12"
                         :value="tag.config.column"
                         @input="updateParameter('column', $event)"
                         clear-button />
          <f7-list-input v-if="supports('cmd')"
                         label="Click command"
                         type="text"
                         required
                         validate
                         :value="tag.config.cmd"
                         @input="updateParameter('cmd', $event)"
                         clear-button />
          <f7-list-input v-if="supports('releaseCmd')"
                         label="Release command"
                         type="text"
                         :value="tag.config.releaseCmd"
                         @input="updateParameter('releaseCmd', $event)"
                         clear-button />
          <f7-list-item v-if="supports('stateless')"
                        title="Stateless">
            <template #after>
              <f7-toggle :checked="tag.config.stateless"
                         @toggle:change="tag.config.stateless = $event" />
            </template>
          </f7-list-item>
          <f7-list-item v-if="supports('switchEnabled')"
                        title="Switch enabled">
            <template #after>
              <f7-toggle :checked="tag.config.switchEnabled"
                         @toggle:change="tag.config.switchEnabled = $event" />
            </template>
          </f7-list-item>
          <f7-list-item v-if="supports('releaseOnly')"
                        title="Release only">
            <template #after>
              <f7-toggle :checked="tag.config.releaseOnly"
                         @toggle:change="tag.config.releaseOnly = $event" />
            </template>
          </f7-list-item>
          <f7-list-item v-if="supports('legend')"
                        title="Legend">
            <template #after>
              <f7-toggle :checked="tag.config.legend"
                         @toggle:change="tag.config.legend = $event" />
            </template>
          </f7-list-item>
          <f7-list-item v-if="supports('forceAsItem')"
                        title="Force as item">
            <template #after>
              <f7-toggle :checked="tag.config.forceAsItem"
                         @toggle:change="tag.config.forceAsItem = $event" />
            </template>
          </f7-list-item>
          <f7-list-item v-if="supports('inputHint')"
                        title="Hint"
                        smart-select
                        :smart-select-params="{openIn: 'popover', closeOnSelect: true}">
            <select name="inputHints"
                    required
                    :value="tag.config.inputHint"
                    @change="updateParameter('inputHint', $event)">
              <option v-for="def in INPUT_HINT_DEFS"
                      :key="def.key"
                      :value="def.key">
                {{ def.value }}
              </option>
            </select>
          </f7-list-item>
        </ul>
      </f7-list>
    </f7-card-content>
    <f7-card-footer key="sitemap-tag-buttons-edit-mode"
                    v-if="tag.component !== 'Sitemap'">
      <!-- <f7-button v-if="!editMode && !createMode" color="blue" @click="editMode = true" icon-ios="material:expand_more" icon-md="material:expand_more" icon-aurora="material:expand_more">Edit</f7-button> -->
      <f7-segmented>
        <f7-button color="blue"
                   @click="$emit('moveup', tag)"
                   icon-f7="chevron_up" />
        <f7-button color="blue"
                   @click="$emit('movedown', tag)"
                   icon-f7="chevron_down" />
      </f7-segmented>
      <f7-button v-if="tag.component !== 'Sitemap'"
                 color="red"
                 @click="$emit('remove', tag)">
        Remove
      </f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.tag-detail
  .item-inner:after
    height 0 !important /* remove all lines between params */
  .additional-controls:before
    display block !important
#additional:before
  display block !important /* need two selectors to override the important Vue card css */
</style>

<script>
import { Categories } from '@/assets/categories.js'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import PersistencePicker from '@/components/config/controls/persistence-picker.vue'
import SitemapMixin from '@/components/pagedesigner/sitemap/sitemap-mixin'

export default {
  mixins: [SitemapMixin],
  components: {
    ItemPicker,
    PersistencePicker
  },
  props: ['tag', 'createMode'],
  emits: ['moveup', 'movedown', 'remove'],
  data () {
    return {
      iconInputId: '',
      iconAutocomplete: null
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
      if (!this.ADDITIONAL_CONTROLS[this.tag.component]) return false
      return (this.ADDITIONAL_CONTROLS[this.tag.component].indexOf(parameter) >= 0)
    },
    updateParameter (parameter, $event) {
      let value = $event.target.value
      if (value && $event.target.type === 'number' && !isNaN(value)) {
        value = parseFloat(value)
      }
      this.tag.config[parameter] = value
    },
    remove () {
      this.$emit('remove')
    }
  },
  mounted () {
    if (!this.tag) return
    if (!this.tag.config.icon) this.tag.config.icon = ''
    const iconControl = this.$refs.icon
    if (!iconControl || !iconControl.$el) return
    const inputElement = this.$$(iconControl.$el).find('input')
    this.initializeAutocomplete(inputElement)
  },
  beforeUnmount () {
    if (this.iconControl) {
      this.$f7.autocomplete.destroy(this.iconControl)
    }
  }
}
</script>
