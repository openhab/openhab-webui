<template>
  <ul>
    <f7-list-item :title="title || 'Thing'"
                  smart-select
                  :smart-select-params="smartSelectParams"
                  v-if="ready"
                  ref="smartSelect">
      <select :name="name"
              :multiple="multiple"
              @change="select"
              :required="required">
        <option v-if="!multiple" value="" />
        <optgroup v-for="thing in things.filter((t) => (filterThing) ? t.UID === filterThing : true)" :label="thing.label" :key="thing.UID">
          <option v-for="channel in thing.triggerChannels"
                  :value="channel.uid"
                  :key="channel.uid"
                  :selected="(multiple) ? value.indexOf(channel.uid) >= 0 : value === channel.uid ? true : null">
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
import { f7 } from 'framework7-vue'

export default {
  props: {
    title: String,
    name: String,
    value: [String, Array],
    multiple: Boolean,
    required: Boolean,
    filterThing: String
  },
  emits: ['input'],
  data () {
    return {
      ready: false,
      things: [],
      icons: {},
      smartSelectParams: {
        view: f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: 'Search channels',
        renderItem: (item, index) => {
          let html, value, thing, channel, description
          if (index > 0 && !item.isLabel) {
            value = item.value.substring(0, item.value.lastIndexOf(':'))
            thing = (index > 0) ? this.things.find((th) => th.UID === value) : ''
            channel = (thing && thing.triggerChannels.length > 0)
              ? thing.triggerChannels.find((ch) => ch.uid === item.value) : undefined
          }

          if (item.isLabel) {
            html = `
                      <li class="item-divider">
                      ${item.groupLabel}
                      </li>
                    `
          } else {
            description = (channel !== undefined) ? channel.description : ''
            html = `
                <li class="media-item">
                  <label class="item-radio item-content">
                    <input type="radio" name="${item.inputName}" value="${item.value}" ${item.selected ? 'checked' : ''}>
                    <i class="icon icon-radio"></i>
                    <div class="item-inner">
                      <div class="item-title" style="font-weight: var(--f7-list-item-title-font-weight);">${item.text}</div>
                      <div class="item-footer">${description}</div>
                    </div>
                  </label>
                </li>
              `
          }

          return html
        }
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
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
      f7.input.validateInputs(this.$refs.smartSelect.$el)
      this.$emit('input', e.target.value)
    }
  }
}
</script>
