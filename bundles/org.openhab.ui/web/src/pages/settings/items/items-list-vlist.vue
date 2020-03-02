<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="stopEventSource">
    <f7-navbar title="Items" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
        :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''"></f7-link>
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          class="searchbar-items"
          :init="initSearchbar"
          search-container=".virtual-list"
          search-in=".item-title, .item-subtitle, .item-footer"
          remove-diacritics
          :disable-button="!$theme.aurora"
        ></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" :class="{ 'navbar': $theme.md }" v-if="showCheckboxes" bottom-ios bottom-aurora>
      <f7-link color="red" v-show="selectedItems.length" v-if="!$theme.md" class="delete" icon-ios="f7:trash" icon-aurora="f7:trash" @click="removeSelected">Remove {{selectedItems.length}}</f7-link>
      <f7-link v-if="$theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false"></f7-link>
      <div class="title" v-if="$theme.md">
        {{selectedItems.length}} selected
      </div>
      <div class="right" v-if="$theme.md">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected"></f7-link>
      </div>
    </f7-toolbar>

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found"></f7-list-item>
    </f7-list>
    <!-- skeleton for not ready -->
    <f7-block class="block-narrow">
      <f7-col v-show="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list media-list class="col wide">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 20"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the item"
              subtitle="type, semantic metadata"
              after="The item state"
              footer="This contains the type of the item"
            >
              <f7-skeleton-block style="width: 32px; height: 32px; border-radius: 50%" slot="media"></f7-skeleton-block>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
      <f7-col v-if="ready">
        <f7-block-title class="searchbar-hide-on-search">{{items.length}} items</f7-block-title>
        <f7-list
          v-show="items.length > 0"
          class="searchbar-found col"
          ref="itemsList"
          media-list
          virtual-list
          :virtual-list-params="{ items, searchAll, renderExternal, height: $theme.ios ? 78 : $theme.aurora ? 60 : 87}"
        >
          <ul>
            <f7-list-item
              v-for="(item, index) in vlData.items"
              :key="index"
              media-item
              class="itemlist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(item.name)"
              @change="(e) => toggleItemCheck(e, item.name)"
              :link="showCheckboxes ? null : item.name"
              :title="(item.label) ? item.label : item.name"
              :footer="(item.label) ? item.name : '\xa0'"
              :subtitle="getItemTypeAndMetaLabel(item)"
              :style="`top: ${vlData.topPosition}px`"
              :after="item.state"
            >
              <oh-icon v-if="item.category" slot="media" :icon="item.category" height="32" width="32" />
              <span v-else slot="media" class="item-initial">{{item.name[0]}}</span>
              <f7-icon v-if="!item.editable" slot="after-title" f7="lock_fill" size="1rem" color="gray"></f7-icon>
              <!-- <f7-button slot="after-start" color="blue" icon-f7="compose" icon-size="24px" :link="`${item.name}/edit`"></f7-button> -->
            </f7-list-item>
          </ul>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block v-if="ready && !items.length" class="service-config block-narrow">
      <empty-state-placeholder icon="square_on_circle" title="items.title" text="items.text" />
    </f7-block>
    <f7-fab v-show="!showCheckboxes" position="right-bottom" slot="fixed" color="blue">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus"></f7-icon>
      <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply"></f7-icon>
      <f7-fab-buttons position="top">
        <f7-fab-button fab-close label="Add Item" href="add"><f7-icon ios="material:label_outline" md="material:label_outline" aurora="material:label_outline"></f7-icon></f7-fab-button>
        <f7-fab-button fab-close label="Add Items from Textual Definition" href="add-from-textual-definition"><f7-icon ios="f7:document_text" md="material:assignment" aurora="f7:text_badge_plus"></f7-icon></f7-fab-button>
      </f7-fab-buttons>
    </f7-fab>
  </f7-page>
</template>

<style lang="stylus">
.itemlist-item .item-after
  overflow hidden
  max-width 30%
  span
    overflow hidden
    text-overflow ellipsis
</style>

<script>
export default {
  data () {
    return {
      ready: false,
      loading: false,
      items: [], // [{ label: 'Staircase', name: 'Staircase'}],
      indexedItems: {},
      initSearchbar: false,
      vlData: {
        items: []
      },
      selectedItems: [],
      showCheckboxes: false,
      eventSource: null
    }
  },
  created () {

  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    load () {
      if (this.loading) return
      this.loading = true
      this.$oh.api.get('/rest/items?metadata=semantics').then(data => {
        this.items = data.sort((a, b) => {
          const labelA = a.label || a.name
          const labelB = b.label || b.name
          return labelA.localeCompare(labelB)
        })
        this.loading = false
        if (this.ready) {
          this.$refs.itemsList.f7VirtualList.replaceAllItems(this.items)
          // this.$refs.itemsList.f7VirtualList.clearCache()
          // this.$refs.itemsList.f7VirtualList.update()
        } else {
          this.ready = true
        }

        setTimeout(() => { this.initSearchbar = true })
        if (!this.eventSource) this.startEventSource()
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=smarthome/items/*/added,smarthome/items/*/removed,smarthome/items/*/updated', null, (event) => {
        console.log(event)
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'added':
          case 'removed':
          case 'updated':
            this.load()
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    searchAll (query, items) {
      const found = []
      for (let i = 0; i < items.length; i += 1) {
        var haystack = items[i].name
        if (items[i].label) haystack += ' ' + items[i].label
        haystack += this.getItemTypeAndMetaLabel(items[i])
        if (
          haystack.toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
          query.trim() === ''
        ) { found.push(i) }
      }
      return found // return array with mathced indexes
    },
    renderExternal (vl, vlData) {
      this.vlData = vlData
    },
    getItemTypeAndMetaLabel (item) {
      let ret = item.type
      if (item.metadata && item.metadata.semantics) {
        ret += ' · '
        const classParts = item.metadata.semantics.value.split('_')
        ret += classParts[0]
        if (classParts.length > 1) {
          ret += '>' + classParts.pop()
        }
      }
      return ret
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    toggleItemCheck (event, item) {
      console.log('toggle check')
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    removeSelected () {
      const vm = this

      this.$f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected items?`,
        'Remove Items',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      if (this.selectedItems.some((i) => i.editable === false)) {
        this.$f7.dialog.alert('Some of the selected items are not modifiable because they have been created by textual configuration')
        return
      }

      let dialog = this.$f7.dialog.progress('Deleting Items...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/items/' + i))
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: 'Items removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while deleting: ' + err)
      })
    }
  },
  asyncComputed: {
    iconUrl () {
      return icon => this.$oh.media.getIcon(icon)
    }
  }
}
</script>
