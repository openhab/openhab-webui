<template>
  <f7-popup ref="audiosinkPicker" class="audiosinkpicker-popup" close-on-escape
    @popup:open="onOpen" @popup:close="onClose">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
        </f7-nav-left>
        <f7-nav-title>{{popupTitle || 'Pick from available audio sinks'}}</f7-nav-title>
        <f7-nav-right>
          <f7-link v-if="ready && selectedItem" @click="pickItems">{{'Pick'}}</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block strong class="no-padding" v-if="ready">
        <f7-list media-list>
           <f7-list-item media-item selectable v-for="item in items" :model="item" :key="item.id" :title="item.label" link="#" :no-chevron="true" @click="pickItem(item)" />
        </f7-list>
      </f7-block>
      <f7-block v-else-if="!ready" class="text-align-center">
        <f7-preloader></f7-preloader>
        <div>Loading...</div>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>

export default {
  props: ['item', 'value', 'allowEmpty', 'popupTitle', 'actionLabel'],
  data () {
    return {
      ready: false,
      loading: false,
      items: [],
      rootItems: [],
      selectedItem: null,
      previousSelection: null
    }
  },
  computed: {
    rootNodes () {
      return [this.rootItems]
    }
  },
  methods: {
    onOpen () {
      this.selectedItem = null
      this.initSearchbar = false
      this.$set(this, 'checkedItems', [])
      this.load()
    },
    onClose () {
      this.ready = false
      this.$emit('closed')
      this.$f7.emit('audiosinkPickerClosed')
    },
    pickItem (item) {
      this.$emit('input',item)
      this.$f7.emit('itemPicked',item)
      this.$refs.audiosinkPicker.close()
    },
    audiosinkItem (item) {
      const audiosinkItem = {
        item: item,
        opened: (item.type.indexOf('Group') === 0) ? false : undefined,
        checked: undefined,
      }
      // if (this.value === item.name) {
        // this.selectItem(audiosinkItem)
      // } 
      return audiosinkItem
    },
    load (update) {
      // if (this.ready) return
      this.loading = true

      this.$oh.api.get('/rest/audio/sinks').then(data => {
        
        this.items = data.sort((a, b) => {
            const labelA = a.label
            const labelB = b.label
            return labelA.localeCompare(labelB)
          })
        this.rootItems = this.items

        this.loading = false
        this.ready = true
        
      }).catch((err, status) => {
        if (err === 'Not Found' || status === 404) {
          this.noRuleEngine = true
        }
      })
    }
  }
}
</script>
