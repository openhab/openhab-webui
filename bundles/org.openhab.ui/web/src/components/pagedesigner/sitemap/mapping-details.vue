<template>
  <f7-card v-if="widget">
    <f7-card-content v-if="mappings.length">
      <f7-list inline-labels sortable @sortable:sort="onSort">
        <f7-list-input v-for="(mapping, idx) in mappings" :key="idx"
            :label="`#${idx+1}`" type="text" placeholder="command=Label" :value="mapping" @input="updateMapping(idx, $event)" clear-button>
        </f7-list-input>
      </f7-list>
    </f7-card-content>
    <f7-card-footer key="item-card-buttons-edit-mode" v-if="widget.component !== 'Sitemap'">
      <f7-button color="blue" @click="addMapping">Add</f7-button>
    </f7-card-footer>

  </f7-card>
</template>

<script>
export default {
  props: ['widget'],
  computed: {
    mappings () {
      if (this.widget && this.widget.config && this.widget.config.mappings) {
        return this.widget.config.mappings
      }
      return []
    }
  },
  methods: {
    updateMapping (idx, $event) {
      const value = $event.target.value
      if (!value) {
        this.widget.config.mappings.splice(idx, 1)
      } else {
        this.$set(this.widget.config.mappings, idx, value)
      }
    },
    addMapping () {
      if (this.widget && this.widget.config && this.widget.config.mappings) {
        this.widget.config.mappings.push('')
      } else {
        this.$set(this.widget.config, 'mappings', [''])
      }
    },
    onSort (ev) {
      const element = this.widget.config.mappings[ev.from]
      this.widget.config.mappings.splice(ev.from, 1)
      this.widget.config.mappings.splice(ev.to, 0, element)
    }
  }
}
</script>
