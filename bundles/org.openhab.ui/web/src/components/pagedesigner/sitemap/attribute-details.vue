<template>
  <f7-card v-if="widget">
    <f7-card-content v-if="attributes.length">
      <f7-list
        class="attribute-details-list"
        :class="{ disabled: disabled }"
        inline-labels
        :sortable="!disabled"
        :sortable-opposite="!disabled"
        :sortable-enabled="!disabled"
        @sortable:sort="onSort">
        <f7-list-item
          v-for="(attr, idx) in attributes"
          :key="JSON.stringify(attr.value)"
          :data-attribute-index="idx"
          @keydown.tab="onFieldTab($event, idx)">
          <f7-input
            v-if="!hasFields"
            style="flex: 1"
            inputStyle="width: 100%"
            type="text"
            :placeholder="placeholder"
            :value="attr.value"
            :disabled="disabled"
            @change="updateAttribute($event, idx, attr)" />
          <div v-else-if="hasArrayFields" style="flex: 1">
            <div
              v-if="disabled || !isArrayEditing(idx)"
              style="display: flex; align-items: center; width: 100%; min-height: 32px; cursor: pointer"
              :tabindex="disabled ? -1 : 0"
              @focus="!disabled && startArrayEditing(idx)"
              @click="!disabled && startArrayEditing(idx)">
              <div :style="collapsedArrayValueStyle(attr.value)">
                {{ arrayFieldDisplayValue(attr.value) }}
              </div>
            </div>
            <div v-else style="display: flex; flex-direction: column; gap: 5px">
              <div
                v-for="(nestedValue, nestedIdx) in arrayFieldValues(attr.value, arrayField)"
                :key="nestedIdx"
                :data-array-entry-index="nestedIdx"
                :style="nestedGridStyle(attr, nestedIdx)">
                <template v-if="nestedIdx === 0">
                  <field-input
                    v-for="(field, fieldidx) in leadingFields"
                    :key="`leading-${fieldidx}`"
                    v-bind="getFieldInputProps(field, fieldidx, attr.value, isItemField(field), isOperatorField(field))"
                    @input="updateAttributeValue($event, idx, attr, fieldKey(field))"
                    @change="updateAttribute($event, idx, attr, fieldKey(field))" />
                </template>
                <field-input
                  v-for="(field, fieldidx) in arrayFieldDefinition(arrayField)"
                  :key="`nested-${nestedIdx}-${fieldidx}`"
                  v-bind="getFieldInputProps(field, fieldidx, nestedValue, isItemField(field), isOperatorField(field))"
                  @input="updateNestedAttributeValue($event, idx, attr, arrayField, nestedIdx, fieldKey(field))"
                  @change="updateNestedAttribute($event, idx, attr, arrayField, nestedIdx, fieldKey(field))" />
                <div v-if="nestedIdx < arrayFieldValues(attr.value, arrayField).length - 1" style="padding-left: 0px">AND</div>
                <template v-if="nestedIdx === arrayFieldValues(attr.value, arrayField).length - 1">
                  <field-input
                    v-for="(field, fieldidx) in trailingFields"
                    :key="`trailing-${fieldidx}`"
                    v-bind="getFieldInputProps(field, fieldidx, attr.value, isItemField(field), isOperatorField(field))"
                    @input="updateAttributeValue($event, idx, attr, fieldKey(field))"
                    @change="updateAttribute($event, idx, attr, fieldKey(field))" />
                  <f7-button v-if="!disabled" :tabindex="-1" text="+" small @click="addArrayFieldEntry(idx, attr, arrayField)" />
                </template>
                <f7-button
                  v-if="!disabled && canRemoveArrayFieldEntry(attr.value, arrayField)"
                  :tabindex="-1"
                  text="-"
                  small
                  @click.stop.prevent="removeArrayFieldEntry(idx, arrayField, nestedIdx)" />
              </div>
            </div>
          </div>
          <div v-else style="flex: 1">
            <div
              v-if="disabled || !isArrayEditing(idx)"
              style="display: flex; align-items: center; width: 100%; min-height: 32px; cursor: pointer"
              @click="!disabled && startArrayEditing(idx)">
              <div :style="collapsedFieldValueStyle(attr.value)">{{ fieldDisplayValue(attr.value) }}</div>
            </div>
            <div v-else :style="gridStyle(fields)">
              <field-input
                v-for="(field, fieldidx) in fields"
                :key="fieldidx"
                v-bind="getFieldInputProps(field, fieldidx, attr.value, isItemField(field), isOperatorField(field))"
                @input="updateAttributeValue($event, idx, attr, fieldKey(field))"
                @change="updateAttribute($event, idx, attr, fieldKey(field))" />
            </div>
          </div>
          <f7-button v-if="!disabled" :tabindex="-1" text="" icon-material="clear" small @click="removeAttribute(idx)" />
        </f7-list-item>
      </f7-list>
    </f7-card-content>
    <f7-card-footer v-if="!disabled && widget.type !== 'Sitemap'" key="item-card-buttons-edit-mode">
      <f7-button color="blue" @click="addAttribute"> Add </f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.attribute-details-item-picker
  .item-content
    padding-left 0 !important
  .item-media
    display none
  .item-inner
    margin-left 0 !important
  .item-after
    color var(--f7-block-text-color)
  .sortable-handler
    display none

.attribute-details-list
  .button.button-small
    padding-left 0
    padding-right 0
    flex-shrink 0
    min-width calc(var(--f7-button-min-width) * 0.6)

.attribute-details-collapsed-empty
  color var(--f7-list-item-footer-text-color)
  font-style italic
</style>

<script>
import FieldInput from './field-input.vue'

export default {
  components: {
    FieldInput
  },
  props: {
    widget: Object,
    attribute: String,
    placeholder: String,
    fields: {
      type: Array,
      default: () => []
    },
    disabled: Boolean
  },
  data() {
    return {
      fieldDefaults: {
        type: 'text',
        required: false
      },
      editingArrayIndex: null
    }
  },
  mounted() {
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true)
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true)
  },
  computed: {
    hasFields() {
      return Array.isArray(this.fields) && this.fields.length > 0
    },
    arrayFieldIndex() {
      return this.fields.findIndex((field) => this.isArrayField(field))
    },
    hasArrayFields() {
      return this.arrayFieldIndex >= 0
    },
    leadingFields() {
      return this.hasArrayFields ? this.fields.slice(0, this.arrayFieldIndex) : []
    },
    arrayField() {
      return this.hasArrayFields ? this.fields[this.arrayFieldIndex] : null
    },
    trailingFields() {
      return this.hasArrayFields ? this.fields.slice(this.arrayFieldIndex + 1) : []
    },
    attributes() {
      if (this.widget && this.widget[this.attribute]) {
        return this.widget[this.attribute].map((attr) => ({ value: attr }))
      }
      return []
    }
  },
  methods: {
    onDocumentPointerDown(event) {
      if (this.editingArrayIndex === null) {
        return
      }
      // Item picker popups are rendered outside this component subtree.
      // Treat interactions in that popup as "inside" to avoid collapsing edit mode
      // before the selected value event can propagate back.
      if (event.target?.closest?.('.item-picker-popup')) {
        return
      }
      if (this.$el?.contains(event.target)) {
        return
      }
      this.stopArrayEditing()
    },
    isFieldObject(field) {
      return !!field && typeof field === 'object' && !Array.isArray(field)
    },
    fieldKey(field) {
      return this.isFieldObject(field) ? Object.keys(field)[0] : undefined
    },
    fieldDefinition(field) {
      return this.isFieldObject(field) ? field[this.fieldKey(field)] : undefined
    },
    isArrayField(field) {
      return Array.isArray(this.fieldDefinition(field))
    },
    isOptionalArrayField(field, fields = this.fields) {
      if (!Array.isArray(fields) || !this.isArrayField(field)) {
        return false
      }
      const fieldIndex = fields.indexOf(field)
      if (fieldIndex < 0) {
        return false
      }
      return fields.some((candidateField, candidateFieldIdx) => candidateFieldIdx !== fieldIndex && this.isFieldObject(candidateField))
    },
    isOperatorField(field) {
      return this.isFieldObject(field) && this.fieldProp(field, 'type') === 'operator'
    },
    isItemField(field) {
      return this.isFieldObject(field) && this.fieldProp(field, 'type') === 'item'
    },
    fieldIsRequired(field) {
      if (!this.isFieldObject(field)) {
        return false
      }
      const fieldDefinition = this.fieldDefinition(field)
      if (fieldDefinition && !Array.isArray(fieldDefinition) && Object.prototype.hasOwnProperty.call(fieldDefinition, 'required')) {
        return fieldDefinition.required === true
      }
      return false
    },
    fieldProp(field, prop) {
      const fieldProps = this.fieldDefinition(field)
      if (!fieldProps || Array.isArray(fieldProps)) {
        if (prop === 'placeholder') {
          return this.placeholder
        }
        return this.fieldDefaults[prop]
      }
      if (fieldProps[prop] !== undefined) {
        return fieldProps[prop]
      }
      if (prop === 'placeholder') {
        return this.placeholder
      }
      return this.fieldDefaults[prop]
    },
    gridStyle(fields) {
      const gridTemplateColumns = fields
        .map((field) => {
          if (!this.fieldDefinition(field)) {
            return 'max-content'
          } else if (this.fieldProp(field, 'width') !== undefined) {
            return `minmax(${this.fieldProp(field, 'width')}, max-content)`
          } else {
            return '1fr'
          }
        })
        .join(' ')
      return {
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns,
        gridAutoFlow: 'column',
        width: '100%',
        alignItems: 'baseline',
        gap: '5px'
      }
    },
    nestedGridStyle(attr, nestedIdx) {
      let fields = []
      if (nestedIdx === 0) {
        fields = fields.concat(...this.leadingFields)
      }
      fields = fields.concat(...this.arrayFieldDefinition(this.arrayField))
      if (nestedIdx < this.arrayFieldValues(attr.value, this.arrayField).length - 1) {
        fields = fields.concat('AND')
      }
      if (nestedIdx === this.arrayFieldValues(attr.value, this.arrayField).length - 1) {
        fields = fields.concat(...this.trailingFields)
        fields = fields.concat('plusButton')
      }
      if (this.canRemoveArrayFieldEntry(attr.value, this.arrayField)) {
        fields = fields.concat('minusButton')
      }
      return this.gridStyle(fields)
    },
    inputFieldStyle(field) {
      const style = {}
      style.width = '100%'
      style.minWidth = '2ch'
      if (this.fieldProp(field, 'type') === 'number') {
        style.textAlign = 'end'
      }
      return style
    },
    fieldValue(source, field) {
      if (!this.isFieldObject(field) || !source || typeof source !== 'object') {
        return ''
      }
      return source[this.fieldKey(field)] ?? ''
    },
    itemFieldValue(source, field) {
      const value = this.fieldValue(source, field)
      return value || null
    },
    itemPickerTextColor(value) {
      return value ? 'var(--f7-list-item-text-color)' : 'var(--f7-input-placeholder-color, var(--f7-list-item-footer-text-color))'
    },
    isArrayEditing(idx) {
      return this.editingArrayIndex === idx
    },
    startArrayEditing(idx) {
      this.editingArrayIndex = idx
      this.$nextTick(() => {
        this.focusFirstEditableField(idx)
      })
    },
    stopArrayEditing() {
      this.editingArrayIndex = null
    },
    focusFirstEditableField(idx) {
      const listItem = this.getAttributeListItem(idx)
      if (!listItem) {
        return
      }
      const focusTarget = this.getRowFocusableElements(listItem)[0]
      if (focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus()
      }
    },
    getAttributeListItem(idx) {
      return this.$el?.querySelector(`[data-attribute-index="${idx}"]`)
    },
    getRowFocusableElements(listItem) {
      if (!listItem) {
        return []
      }
      return Array.from(
        listItem.querySelectorAll(
          '.attribute-details-item-picker a, .attribute-details-item-picker .item-link, input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        )
      ).filter((element) => {
        if (element.tabIndex < 0) {
          return false
        }
        return element.offsetParent !== null || document.activeElement === element
      })
    },
    focusArrayEntryField(idx, nestedIdx) {
      const listItem = this.getAttributeListItem(idx)
      const arrayEntry = listItem?.querySelector(`[data-array-entry-index="${nestedIdx}"]`)
      const focusTarget = this.getRowFocusableElements(arrayEntry)[0]
      if (focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus()
      }
    },
    onFieldTab(event, idx) {
      const listItem = this.getAttributeListItem(idx)
      if (!listItem) {
        return
      }
      const focusableElements = this.getRowFocusableElements(listItem)
      if (!focusableElements.length) {
        return
      }
      const currentIndex = focusableElements.indexOf(event.target)
      if (currentIndex < 0) {
        return
      }
      const direction = event.shiftKey ? -1 : 1
      const nextElement = focusableElements[currentIndex + direction]
      if (!nextElement) {
        if (this.focusAdjacentAttributeAfterTabOut(idx, direction)) {
          event.preventDefault()
          return
        }
        this.stopEditingAfterTabOut(listItem)
        return
      }
      event.preventDefault()
      nextElement.focus()
    },
    focusAdjacentAttributeAfterTabOut(idx, direction) {
      if (!this.hasFields || direction < 0 || !this.isArrayEditing(idx)) {
        return false
      }
      const nextIdx = idx + 1
      if (nextIdx >= this.attributes.length) {
        return false
      }
      this.startArrayEditing(nextIdx)
      return true
    },
    stopEditingAfterTabOut(listItem) {
      // Wait for the browser to move focus before deciding whether to collapse.
      setTimeout(() => {
        const activeElement = document.activeElement
        if (!listItem?.contains(activeElement)) {
          this.stopArrayEditing()
        }
      }, 0)
    },
    hasDisplayValue(value) {
      if (typeof value === 'string') {
        return value.trim() !== ''
      }
      if (Array.isArray(value)) {
        return value.some((entry) => this.hasDisplayValue(entry))
      }
      if (value && typeof value === 'object') {
        return Object.values(value).some((entry) => this.hasDisplayValue(entry))
      }
      return value !== null && value !== undefined && value !== ''
    },
    adjacentFieldValue(source, fields, fieldidx, direction, boundaryValue = '') {
      for (let idx = fieldidx + direction; idx >= 0 && idx < fields.length; idx += direction) {
        const field = fields[idx]
        if (this.isFieldObject(field)) {
          return this.fieldValue(source, field)
        }
      }
      return boundaryValue
    },
    adjacentField(fields, fieldidx, direction) {
      for (let idx = fieldidx + direction; idx >= 0 && idx < fields.length; idx += direction) {
        const field = fields[idx]
        if (this.isFieldObject(field)) {
          return field
        }
      }
      return null
    },
    showLiteral(
      source,
      fields,
      fieldidx,
      previousBoundaryValue = '',
      nextBoundaryValue = '',
      hideWhenAdjacentEmpty = true,
      previousBoundaryRequired = false,
      nextBoundaryRequired = false
    ) {
      const field = fields[fieldidx]
      if (typeof field !== 'string') {
        return true
      }
      if (!hideWhenAdjacentEmpty) {
        return true
      }
      const previousValue = this.adjacentFieldValue(source, fields, fieldidx, -1, previousBoundaryValue)
      const nextValue = this.adjacentFieldValue(source, fields, fieldidx, 1, nextBoundaryValue)
      const previousField = this.adjacentField(fields, fieldidx, -1)
      const nextField = this.adjacentField(fields, fieldidx, 1)
      const previousRequired = previousField ? this.fieldIsRequired(previousField) : previousBoundaryRequired
      const nextRequired = nextField ? this.fieldIsRequired(nextField) : nextBoundaryRequired
      if (previousRequired && nextRequired) {
        return true
      }
      return this.hasDisplayValue(previousValue) && this.hasDisplayValue(nextValue)
    },
    displayFieldValue(
      source,
      fields,
      fieldidx,
      previousBoundaryValue = '',
      nextBoundaryValue = '',
      previousBoundaryRequired = false,
      nextBoundaryRequired = false
    ) {
      const field = fields[fieldidx]
      if (this.isFieldObject(field)) {
        const value = this.fieldValue(source, field)
        return this.hasDisplayValue(value) ? String(value) : ''
      }
      if (
        !this.showLiteral(
          source,
          fields,
          fieldidx,
          previousBoundaryValue,
          nextBoundaryValue,
          true,
          previousBoundaryRequired,
          nextBoundaryRequired
        )
      ) {
        return ''
      }
      return typeof field === 'string' ? field : ''
    },
    displayFieldGroup(
      source,
      fields,
      previousBoundaryValue = '',
      nextBoundaryValue = '',
      previousBoundaryRequired = false,
      nextBoundaryRequired = false
    ) {
      return fields
        .map((field, fieldidx) =>
          this.displayFieldValue(
            source,
            fields,
            fieldidx,
            previousBoundaryValue,
            nextBoundaryValue,
            previousBoundaryRequired,
            nextBoundaryRequired
          )
        )
        .filter((part) => part !== '')
        .join(' ')
        .trim()
    },
    hasAnyFieldValues(source, fields) {
      return fields.some((field) => {
        if (!this.isFieldObject(field)) {
          return false
        }
        return this.hasDisplayValue(this.fieldValue(source, field))
      })
    },
    arrayFieldDisplayValue(value) {
      const arrayValues = this.arrayFieldValues(value, this.arrayField)
      const arrayRequired = this.fieldIsRequired(this.arrayField)
      const leading = this.displayFieldGroup(value, this.leadingFields, '', arrayValues, false, arrayRequired)
      const nested = arrayValues
        .map((entry) => this.displayFieldGroup(entry, this.arrayFieldDefinition(this.arrayField)))
        .filter((part) => part !== '')
        .join(' AND ')
      const trailing = this.displayFieldGroup(value, this.trailingFields, arrayValues, '', arrayRequired, false)
      const output = [leading, nested, trailing]
        .filter((part) => part !== '')
        .join(' ')
        .trim()
      return output || this.placeholder || '(empty)'
    },
    collapsedArrayValueStyle(value) {
      const output = this.arrayFieldDisplayValue(value)
      return {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
        color: output === '(empty)' ? 'var(--f7-list-item-footer-text-color)' : undefined,
        fontStyle: output === '(empty)' ? 'italic' : undefined
      }
    },
    fieldDisplayValue(value) {
      if (this.attribute === 'mappings' && this.widget?.type === 'Switch' && value && typeof value === 'object' && !Array.isArray(value)) {
        return this.switchMappingDisplayValue(value)
      }
      const output = this.displayFieldGroup(value, this.fields)
      return output || this.placeholder || '(empty)'
    },
    switchMappingDisplayValue(value) {
      const parts = []
      const command = this.hasDisplayValue(value.command) ? String(value.command).trim() : ''
      const releaseCommand = this.hasDisplayValue(value.releaseCommand) ? String(value.releaseCommand).trim() : ''
      const label = this.hasDisplayValue(value.label) ? String(value.label).trim() : ''
      const icon = this.hasDisplayValue(value.icon) ? String(value.icon).trim() : ''

      if (command) {
        parts.push(command)
      }
      if (releaseCommand) {
        if (command) {
          parts.push(':')
        }
        parts.push(releaseCommand)
      }
      if (label) {
        if (command || releaseCommand) {
          parts.push('=')
        }
        parts.push(label)
      }
      if (icon) {
        if (label || command || releaseCommand) {
          parts.push('=')
        }
        parts.push(icon)
      }

      return parts.join(' ').trim() || this.placeholder || '(empty)'
    },
    collapsedFieldValueStyle(value) {
      const output = this.fieldDisplayValue(value)
      return {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
        color: output === '(empty)' ? 'var(--f7-list-item-footer-text-color)' : undefined,
        fontStyle: output === '(empty)' ? 'italic' : undefined
      }
    },
    arrayFieldDefinition(field) {
      return this.isArrayField(field) ? this.fieldDefinition(field) : []
    },
    createFieldValue(fields) {
      if (!Array.isArray(fields)) {
        return ''
      }
      return fields.reduce((value, field) => {
        if (!this.isFieldObject(field)) {
          return value
        }
        value[this.fieldKey(field)] = this.isArrayField(field) ? [this.createFieldValue(this.fieldDefinition(field))] : ''
        return value
      }, {})
    },
    ensureAttributeValue(idx) {
      let value = this.widget[this.attribute][idx]
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        value = this.createFieldValue(this.fields)
        this.widget[this.attribute][idx] = value
      }
      return value
    },
    arrayFieldValues(value, field) {
      const fieldValue = this.fieldValue(value, field)
      if (Array.isArray(fieldValue) && fieldValue.length) {
        return fieldValue
      }
      return [this.createFieldValue(this.arrayFieldDefinition(field))]
    },
    updateAttribute($event, idx, attr, field) {
      let value = $event.target.value
      if (!field && !value) {
        this.removeAttribute(idx)
        return
      }
      if (field) {
        value = this.ensureAttributeValue(idx)
        value[field] = $event.target.value
      }
      this.widget[this.attribute][idx] = value
    },
    normalizeInputValue(input) {
      if (input && typeof input === 'object' && input.target) {
        return input.target.value ?? ''
      }
      return input ?? ''
    },
    updateAttributeValue(rawValue, idx, attr, field) {
      this.updateAttribute({ target: { value: this.normalizeInputValue(rawValue) } }, idx, attr, field)
    },
    updateNestedAttribute($event, idx, attr, arrayField, nestedIdx, field) {
      const value = this.ensureAttributeValue(idx)
      const arrayKey = this.fieldKey(arrayField)
      if (!Array.isArray(value[arrayKey])) {
        value[arrayKey] = []
      }
      if (!value[arrayKey][nestedIdx]) {
        value[arrayKey][nestedIdx] = this.createFieldValue(this.arrayFieldDefinition(arrayField))
      }
      value[arrayKey][nestedIdx][field] = $event.target.value
      this.widget[this.attribute][idx] = value
    },
    updateNestedAttributeValue(rawValue, idx, attr, arrayField, nestedIdx, field) {
      this.updateNestedAttribute({ target: { value: this.normalizeInputValue(rawValue) } }, idx, attr, arrayField, nestedIdx, field)
    },
    removeAttribute(idx) {
      this.widget[this.attribute].splice(idx, 1)
      if (this.editingArrayIndex === idx) {
        this.stopArrayEditing()
      } else if (this.editingArrayIndex > idx) {
        this.editingArrayIndex -= 1
      }
    },
    addAttribute() {
      if (this.widget && this.widget[this.attribute]) {
        this.widget[this.attribute].push(this.hasFields ? this.createFieldValue(this.fields) : '')
      } else {
        this.widget[this.attribute] = [this.hasFields ? this.createFieldValue(this.fields) : '']
      }
      if (this.hasFields) {
        this.startArrayEditing(this.widget[this.attribute].length - 1)
      }
    },
    addArrayFieldEntry(idx, attr, arrayField) {
      const value = this.ensureAttributeValue(idx)
      const arrayKey = this.fieldKey(arrayField)
      if (!Array.isArray(value[arrayKey])) {
        value[arrayKey] = []
      }
      value[arrayKey].push(this.createFieldValue(this.arrayFieldDefinition(arrayField)))
      this.widget[this.attribute][idx] = value
      this.$nextTick(() => {
        this.focusArrayEntryField(idx, value[arrayKey].length - 1)
      })
    },
    canRemoveArrayFieldEntry(value, arrayField) {
      const arrayKey = this.fieldKey(arrayField)
      if (!Array.isArray(value?.[arrayKey])) {
        return false
      }
      return this.isOptionalArrayField(arrayField) ? value[arrayKey].length > 0 : value[arrayKey].length > 1
    },
    removeArrayFieldEntry(idx, arrayField, nestedIdx) {
      const value = this.ensureAttributeValue(idx)
      const arrayKey = this.fieldKey(arrayField)
      const optionalArrayField = this.isOptionalArrayField(arrayField)
      if (!Array.isArray(value[arrayKey])) {
        value[arrayKey] = [this.createFieldValue(this.arrayFieldDefinition(arrayField))]
      }
      if ((!optionalArrayField && value[arrayKey].length <= 1) || nestedIdx < 0 || nestedIdx >= value[arrayKey].length) {
        return
      }
      value[arrayKey].splice(nestedIdx, 1)
      if (!optionalArrayField && !value[arrayKey].length) {
        value[arrayKey].push(this.createFieldValue(this.arrayFieldDefinition(arrayField)))
      }
      this.widget[this.attribute][idx] = value
    },
    onSort(ev) {
      const element = this.widget[this.attribute][ev.from]
      this.widget[this.attribute].splice(ev.from, 1)
      this.widget[this.attribute].splice(ev.to, 0, element)
      this.stopArrayEditing()
    },
    getFieldInputProps(field, fieldidx, value, isItemField, isOperatorField) {
      return {
        field,
        value: this.fieldValue(value, field),
        inputStyle: this.inputFieldStyle(field),
        disabled: this.disabled,
        type: this.fieldProp(field, 'type'),
        min: this.fieldProp(field, 'min'),
        max: this.fieldProp(field, 'max'),
        placeholder: this.fieldProp(field, 'placeholder'),
        isItemField,
        isOperatorField,
        isFieldObject: this.isFieldObject(field),
        textColor: isItemField ? this.itemPickerTextColor(this.fieldValue(value, field)) : undefined
      }
    },
    renderFieldsForRow(fields, value, emitHandler) {
      return fields.map((field, fieldidx) => ({
        field,
        fieldidx,
        isItemField: this.isItemField(field),
        isOperatorField: this.isOperatorField(field),
        props: this.getFieldInputProps(field, fieldidx, value, this.isItemField(field), this.isOperatorField(field)),
        showLiteral: this.showLiteral(value, fields, fieldidx, '', '', false),
        emitHandler
      }))
    }
  }
}
</script>
