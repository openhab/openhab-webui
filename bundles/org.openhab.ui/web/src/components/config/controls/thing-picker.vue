<template>
  <f7-list-item v-if="ready"
                :title="title || 'Thing'"
                smart-select
                :smart-select-params="smartSelectParams"
                ref="smartSelect">
    <select :name="name"
            :multiple="multiple"
            @change="select"
            :required="required">
      <option v-if="!multiple" value="" />
      <option v-for="thing in things"
              :value="thing.UID"
              :key="thing.UID"
              :selected="multiple ? value.indexOf(thing.UID) >= 0 : value === thing.UID">
        {{ thing.label ? thing.label + ' (' + thing.UID + ')' : thing.UID }}
      </option>
    </select>
  </f7-list-item>
  <!-- for placeholder purposes before items are loaded -->
  <f7-list-item link v-show="!ready" :title="title" />
</template>

<script>
import { f7 } from 'framework7-vue'
import { nextTick } from 'vue'

export default {
  props: {
    title: String,
    name: String,
    value: [String, Array],
    multiple: Boolean,
    required: Boolean,
    filterType: Array,
    filterUid: Array,
    openOnReady: Boolean
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
        searchbarPlaceholder: this.$t('dialogs.search.things'),
        searchbar: true,

        renderItem: (item, index) => {
          let after = (index > 0) ? this.things[index - 1].location
            ? this.things[index - 1].location + '<i class="icon f7-icons color-gray" style="width: 16px; height: 16px; font-size: 16px;">placemark</i>'
            : '' : ''
          return `
                <li class="media-item">
                  <label class="item-${item.radio ? 'radio' : 'checkbox'} item-content">
                    <input type="${item.radio ? 'radio' : 'checkbox'}" name="${item.inputName}" value="${item.value}" ${item.selected ? 'checked' : ''}>
                    <i class="icon icon-${item.radio ? 'radio' : 'checkbox'}"></i>
                    <div class="item-inner">
                      <div class="item-title" style="font-weight: var(--f7-list-item-title-font-weight); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.text}</div>
                      <div class="item-footer">${after}</div>
                    </div>
                  </label>
                </li>
              `
        }
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
    this.$oh.api.get('/rest/things?staticDataOnly=true').then((data) => {
      this.things = data.sort((a, b) => {
        const labelA = a.label || a.UID
        const labelB = b.label || b.UID
        return labelA.localeCompare(labelB)
      })
      if (this.filterType) {
        this.things = this.things.filter((i) => this.filterType.indexOf(i.thingTypeUID) >= 0)
        if (this.things.length < 5) {
          this.smartSelectParams.openIn = 'sheet'
          this.smartSelectParams.searchbar = false
        }
      }
      if (this.filterUid && this.filterUid.length) {
        this.things = this.things.filter((t) => this.filterUid.indexOf(t.UID) >= 0)
      }
      this.ready = true
      if (this.openOnReady) {
        nextTick(() => {
          this.$refs.smartSelect.$el.children[0].f7SmartSelect.open()
        })
      }
    })
  },
  methods: {
    open () {
      this.$refs.smartSelect.$el.children[0].f7SmartSelect.open()
    },
    select (e) {
      f7.input.validateInputs(this.$refs.smartSelect.$el)
      this.$emit('input', e.target.value)
      f7.emit('thingPicked', e.target.value)
    }
  }
}
</script>
