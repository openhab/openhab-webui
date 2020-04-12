<template>
<ul>
  <f7-list-item :title="title || 'Thing'" smart-select :smart-select-params="smartSelectParams" v-if="ready">
    <select :name="name" :multiple="multiple" @change="select">
      <option value=""></option>
      <optgroup v-for="thing in things" :label="thing.label" :key="thing.UID">
        <option v-for="channel in thing.triggerChannels" :value="channel.uid" :key="channel.uid" :selected="(multiple) ? value.indexOf(channel.uid) >= 0 : value === channel.uid">
          {{channel.id}} ({{channel.label}})
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
  props: ['title', 'name', 'value', 'multiple', 'filterType'],
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
    // TODO use a Vuex store
    this.$oh.api.get('/rest/things').then((data) => {
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
      this.$emit('input', e.target.value)
    }
  }
}
</script>
