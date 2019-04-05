<template>
  <q-modal-layout>
    <q-toolbar slot="header">
      <q-btn
        flat
        round
        dense
        v-close-overlay
        icon="arrow_back"
      />
      <q-toolbar-title>
        {{component.component}} <q-icon name="chevron_right" /> {{slotName}}
      </q-toolbar-title>
      <q-btn flat round icon="format_indent_increase" @click="format"><q-tooltip :disable="$q.platform.has.touch">Format</q-tooltip></q-btn>
      <q-btn flat round icon="done" @click="validate(false)"><q-tooltip :disable="$q.platform.has.touch">Validate</q-tooltip></q-btn>
      <q-btn flat round icon="system_update_alt" @click="update"><q-tooltip :disable="$q.platform.has.touch">Update</q-tooltip></q-btn>
    </q-toolbar>
    <div class="fit">
      <q-input class="json-editor" v-model="json" hide-underline type="textarea" />
    </div>
    <q-modal position="top" v-model="showValidationReport" :content-css="{padding: '20px'}">
      <div class="q-display-1 q-mb-md">Validation Report</div>
      <p>
        <span v-if="errors.length > 0">{{errors.length}} validation error(s) found.</span>
        <span v-else>No validation errors found.</span>
      </p>
      <ul v-if="errors.length > 0" v-for="error in errors" :key="error">
        <li class="text-negative">{{error}}</li>
      </ul>
      <q-btn color="secondary" @click="showValidationReport = false" label="Close" />
    </q-modal>
  </q-modal-layout>
</template>

<style lang="stylus" scoped>
.json-editor
  font-family monospace
</style>

<script>
import Components from 'assets/components.json'

export default {
  props: ['value', 'slotName', 'component'],
  data () {
    return {
      json: null,
      showValidationReport: false,
      errors: []
    }
  },
  created () {
    this.json = JSON.stringify(this.value, null, 2)
  },
  methods: {
    addError (idx, message) {
      this.errors.push(`At ${idx || '(root)'}: ${message}`)
    },
    validateComponent (component, parentSlotDescription, prefix, idx) {
      if (!component.component) {
        this.addError(`${prefix}[${idx}]`, 'No component name')
        return
      }
      if (!Components[component.component]) {
        this.addError(`${prefix}[${idx}]`, 'Unknown component: ' + component.component)
        return
      }
      let newprefix = `${prefix ? prefix + '.' : ''}${component.component}[${idx}]`
      if ((parentSlotDescription.allowedComponents && parentSlotDescription.allowedComponents.indexOf(component.component) === -1) ||
        (parentSlotDescription.deniedComponents && parentSlotDescription.deniedComponents.indexOf(component.component) !== -1)) {
        this.addError(newprefix, 'This component is not allowed in this slot')
        return
      }
      if (!component.config) {
        this.addError(newprefix, 'No component config')
        return
      }
      if (!(component.config instanceof Object && component.config.constructor === Object)) {
        this.addError(newprefix, 'config property is not an object')
        return
      }
      for (let config in component.config) {
        if (!Components[component.component].configDescriptions[config]) {
          this.addError(newprefix, `Unknown config attribute "${config}"`)
          return
        }
      }
      if (component.slots) {
        if (!Components[component.component].slotDescriptions) {
          this.addError(newprefix, 'Cannot define slots for this component')
          return
        }
        if (!(component.slots instanceof Object && component.slots.constructor === Object)) {
          this.addError(newprefix, 'slots property is not an object')
          return
        }
        for (let slotName in component.slots) {
          const slotDescription = Components[component.component].slotDescriptions[slotName]
          if (!slotDescription) {
            this.addError(newprefix, `Component does not have a "${slotName}" slot`)
            return
          }
          this.validateSlot(component.slots[slotName], newprefix + '.' + slotName, component.component, slotName)
        }
      }
    },
    validateSlot (slot, prefix, componentName, slotName) {
      if (!Array.isArray(slot)) {
        this.addError(prefix, 'Slot is not an array')
        return
      }
      let idx = 0
      const slotDescription = Components[componentName].slotDescriptions[slotName] // guaranteed to exist
      for (let component of slot) {
        this.validateComponent(component, slotDescription, prefix, idx++)
      }
    },
    validate (silent) {
      this.errors = []
      let parsed
      try {
        parsed = JSON.parse(this.json)
      } catch (e) {
        this.errors.push('JSON parse error: ' + e)
      }
      if (parsed) this.validateSlot(parsed, '', this.component.component, this.slotName)
      if (this.errors.length || !silent) {
        this.showValidationReport = true
      }
    },
    update () {
      this.validate(true)
      if (!this.errors.length) {
        this.$emit('update', JSON.parse(this.json))
      }
    },
    format () {
      try {
        let parsed = JSON.parse(this.json)
        this.json = JSON.stringify(parsed, null, 2)
      } catch (e) {
        this.$q.notify('JSON parse error:' + e)
      }
    }
  }
}
</script>
