<template>
  <ul>
    <f7-list-item :title="title || 'Thing'" smart-select :smart-select-params="smartSelectParams" v-if="ready" ref="smartSelect">
      <select :name="name" :multiple="multiple" @change="select" :required="required">
        <option v-if="!multiple" value="" />
        <optgroup v-for="thing in things.filter((t) => (filterThing) ? t.UID === filterThing : true)" :label="thing.label" :key="thing.UID">
          <option v-for="channel in thing.triggerChannels" :value="channel.uid" :key="channel.uid" :selected="(multiple) ? value.indexOf(channel.uid) >= 0 : value === channel.uid">
            {{ channel.id }} ({{ channel.label }})
          </option>
        </optgroup>
      </select>
    </f7-list-item>
    <!-- for placeholder purposes before items are loaded -->
    <f7-list-item link v-show="!ready" :title="title" />
  </ul>
</template>

<script>
export default {
  props: ['title', 'name', 'value', 'multiple', 'required', 'filterThing'],
  data () {
    return {
      ready: false,
      things: [],
      icons: {},
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: 'Search channels'
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
    this.$oh.api.get('/rest/things?staticDataOnly=true').then((data) => {
      this.things = data.sort((a, b) => {
        const labelA = a.label
        const labelB = b.label
        return labelA.localeCompare(labelB)
      }).map((t) => {
        return {
          UID: t.UID,
          label: t.label,
          triggerChannels: t.channels.filter((c) => c.kind === 'TRIGGER')
        }
      }).filter((t) => t.triggerChannels.length > 0)
      this.ready = true
    })
  },
  methods: {
    select (e) {
      this.$f7.input.validateInputs(this.$refs.smartSelect.$el)
      this.$emit('input', e.target.value)
    }
  }
}
</script>
