<template>
  <f7-card v-if="widget">
    <f7-card-content v-if="attributes.length">
      <f7-list inline-labels sortable sortable-opposite sortable-enabled @sortable:sort="onSort">
        <f7-list-item v-for="(attr, idx) in attributes" :key="attr.key">
          <f7-input v-if="attribute === 'buttons'" type="number" min="1" placeholder="0" validate :value="attr.value.position" @change="updatePositionAttribute(idx, attr, $event)" />
          <f7-input v-if="attribute === 'buttons'" type="text" :placeholder="placeholder" :value="attr.value.command" @change="updateAttribute(idx, attr, $event)" clear-button />
          <f7-input v-if="attribute !== 'buttons'" type="text" :placeholder="placeholder" :value="attr.value" @change="updateAttribute(idx, attr, $event)" clear-button />
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
  props: ['widget', 'attribute', 'placeholder'],
  computed: {
    attributes () {
      if (this.widget && this.widget.config && this.widget.config[this.attribute]) {
        return this.widget.config[this.attribute].map((attr, idx) => ({ key: idx + ': ' + JSON.stringify(attr), value: attr }))
      }
      return []
    }
  },
  methods: {
    updateAttribute (idx, attr, $event) {
      const value = $event.target.value
      if (!value) {
        this.widget.config[this.attribute].splice(idx, 1)
      } else if (this.attribute === 'buttons') {
        const position = (attr.value && attr.value.position) ? attr.value.position : undefined
        this.$set(this.widget.config[this.attribute], idx, { position: position, command: value })
      } else {
        this.$set(this.widget.config[this.attribute], idx, value)
      }
    },
    updatePositionAttribute (idx, attr, $event) {
      const position = $event.target.value
      const command = (attr.value && attr.value.command) ? attr.value.command : undefined
      this.$set(this.widget.config[this.attribute], idx, { position: position, command: command })
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
