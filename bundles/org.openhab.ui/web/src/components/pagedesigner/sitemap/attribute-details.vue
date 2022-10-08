<template>
  <f7-card v-if="widget">
    <f7-card-content v-if="attributes.length">
      <f7-list inline-labels sortable sortable-opposite sortable-enabled @sortable:sort="onSort">
        <f7-list-input v-for="(attr, idx) in attributes" :key="attr.key"
                       type="text" :placeholder="placeholder" :value="attr.value" @change="updateAttribute(idx, $event)" clear-button />
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
        return this.widget.config[this.attribute].map((attr, idx) => ({ key: idx + ': ' + attr, value: attr }))
      }
      return []
    }
  },
  methods: {
    updateAttribute (idx, $event) {
      const value = $event.target.value
      if (!value) {
        this.widget.config[this.attribute].splice(idx, 1)
      } else {
        this.$set(this.widget.config[this.attribute], idx, value)
      }
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
