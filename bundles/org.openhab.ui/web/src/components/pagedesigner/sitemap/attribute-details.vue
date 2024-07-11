<template>
  <f7-card v-if="widget">
    <f7-card-content v-if="attributes.length">
      <f7-list inline-labels sortable sortable-opposite sortable-enabled @sortable:sort="onSort">
        <f7-list-item v-for="(attr, idx) in attributes" :key="attr.key">
          <f7-input v-if="!fields" style="flex: 1" inputStyle="width: 100%" type="text" :placeholder="placeholder" :value="attr.value" @change="updateAttribute($event, idx, attr)" />
          <f7-input v-for="(field, fieldidx) in fieldDefs" :key="JSON.stringify(field)"
                    :style="fieldStyle(field, fieldidx)"
                    :inputStyle="inputFieldStyle(field, fieldidx)"
                    :type="fieldProp(field, 'type')"
                    :min="fieldProp(field, 'min')"
                    :max="fieldProp(field, 'max')"
                    :placeholder="fieldProp(field, 'placeholder')"
                    :value="attr.value[Object.keys(field)[0]]"
                    validate @change="updateAttribute($event, idx, attr, Object.keys(field)[0])" />
          <f7-button style="padding-left: 5px; padding-right: 0; flex-shrink: 0" text="" icon-material="clear" small @click="removeAttribute(idx)" />
        </f7-list-item>
      </f7-list>
    </f7-card-content>
    <f7-card-footer key="item-card-buttons-edit-mode" v-if="widget.component !== 'Sitemap'">
      <f7-button color="blue" @click="addAttribute">
        Add
      </f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<script>
export default {
  props: ['widget', 'attribute', 'placeholder', 'fields'],
  data () {
    return {
      fieldDefaults: {
        type: 'text'
      }
    }
  },
  computed: {
    fieldDefs () {
      return this.fields ? JSON.parse(this.fields) : []
    },
    attributes () {
      if (this.widget && this.widget.config && this.widget.config[this.attribute]) {
        return this.widget.config[this.attribute].map((attr, idx) => ({ key: idx + ': ' + JSON.stringify(attr), value: attr }))
      }
      return []
    }
  },
  methods: {
    fieldProp (field, prop) {
      const fieldProps = field[Object.keys(field)[0]]
      if (fieldProps[prop] !== undefined) {
        return fieldProps[prop]
      }
      if (prop === 'placeholder') {
        return this.placeholder
      }
      return this.fieldDefaults[prop]
    },
    fieldStyle (field, fieldidx) {
      let style = {}
      if (this.fieldProp(field, 'width') !== undefined) {
        style.flexGrow = '0'
        style.flexShrink = '0'
        style.flexBasis = this.fieldProp(field, 'width')
      } else {
        style.flex = 1
      }
      if (fieldidx > 0) {
        style.paddingLeft = '5px'
      }
      return style
    },
    inputFieldStyle (field, fieldidx) {
      let style = {}
      style.width = '100%'
      if (this.fieldProp(field, 'type') === 'number') {
        style.textAlign = 'end'
      }
      return style
    },
    updateAttribute ($event, idx, attr, field) {
      let value = $event.target.value
      if (!value) {
        this.removeAttribute(idx)
        return
      }
      if (field) {
        value = attr.value ? attr.value : {}
        value[field] = $event.target.value
      }
      this.$set(this.widget.config[this.attribute], idx, value)
    },
    removeAttribute (idx) {
      this.widget.config[this.attribute].splice(idx, 1)
    },
    addAttribute () {
      if (this.widget && this.widget.config && this.widget.config[this.attribute]) {
        this.widget.config[this.attribute].push('')
      } else {
        this.$set(this.widget.config, this.attribute, [''])
      }
    },
    onSort (ev) {
      const element = this.widget.config[this.attribute][ev.from]
      this.widget.config[this.attribute].splice(ev.from, 1)
      this.widget.config[this.attribute].splice(ev.to, 0, element)
    }
  }
}
</script>
