<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar title="Items" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <developer-dock-icon />
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
                 :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <!-- Only render searchbar, if page is ready. Otherwise searchbar is broken after changes to the Items list. -->
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-items"
          search-container=".virtual-list"
          @searchbar:search="filterSelectedItems"
          :placeholder="searchPlaceholder"
          :disable-button="!$theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" :class="{ 'navbar': $theme.md }" v-if="showCheckboxes" bottom-ios bottom-aurora>
      <f7-link color="red" v-show="selectedItems.length" v-if="!$theme.md" class="delete right-margin" icon-ios="f7:trash" icon-aurora="f7:trash" @click="removeSelected">
        Remove {{ selectedItems.length }}
      </f7-link>
      <f7-link color="blue" v-show="selectedItems.length" v-if="!$theme.md" class="copy" icon-ios="f7:square_on_square" icon-aurora="f7:square_on_square" @click="copySelected">
        &nbsp;Copy DSL Definitions
      </f7-link>
      <f7-link v-if="$theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div class="title" v-if="$theme.md">
        {{ selectedItems.length }} selected
      </div>
      <div class="right" v-if="$theme.md && selectedItems.length">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected" />
        <f7-link icon-md="material:content_copy" icon-color="white" @click="copySelected" />
      </div>
    </f7-toolbar>

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found" />
    </f7-list>

    <f7-block class="block-narrow margin-top-half">
      <f7-col>
        <div>
          <f7-block-footer class="no-margin-top margin-bottom" style="padding-left: 16px; padding-right: 16px">
            Note: Item states are not updated in real-time. Click the refresh button to update.
          </f7-block-footer>
        </div>
      </f7-col>

      <!-- skeleton for not ready -->
      <f7-col v-show="!ready">
        <f7-block-title class="no-margin-top">
          &nbsp;Loading...
        </f7-block-title>
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
              footer="This contains the type of the item">
              <f7-skeleton-block style="width: 32px; height: 32px; border-radius: 50%" slot="media" />
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-show="ready && items.length > 0">
        <f7-block-title class="no-margin-top">
          <span>{{ getListSize() }} <template v-if="$refs.searchbar?.f7Searchbar.query">of {{ items.length }} </template>Items<template v-if="$refs.searchbar?.f7Searchbar.query"> found</template></span>
          <template v-if="showCheckboxes && getListSize() > 0">
            -
            <f7-link @click="selectDeselectAll()" :text="areAllSelected() ? 'Deselect all' : 'Select all'" />
          </template>
        </f7-block-title>
        <f7-list
          v-show="items.length > 0"
          class="searchbar-found col"
          ref="itemsList"
          media-list
          virtual-list
          :virtual-list-params="vlParams">
          <ul>
            <f7-list-item
              v-for="(item, index) in vlData.items"
              :key="index"
              media-item
              class="itemlist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(item.name)"
              @click.ctrl="(e) => ctrlClick(e, item)"
              @click.meta="(e) => ctrlClick(e, item)"
              @click.exact="(e) => click(e, item)"
              link=""
              :title="(item.label) ? item.label : item.name"
              :footer="(item.label) ? item.name : '\xa0'"
              :subtitle="getItemTypeAndMetaLabel(item)"
              :style="`top: ${vlData.topPosition}px`"
              :after="(item.state) ? item.state : '\xa0'">
              <!-- Note: Using dynamic states is not possible since state tracking has a heavy performance impact -->
              <oh-icon v-if="item.category" slot="media" :icon="item.category" :state="item.type === 'Image' ? null : item.state" height="32" width="32" />
              <span v-else slot="media" class="item-initial">{{ item.name[0] }}</span>
              <f7-icon v-if="!item.editable" slot="after-title" f7="lock_fill" size="1rem" color="gray" />
              <!-- <f7-button slot="after-start" color="blue" icon-f7="compose" icon-size="24px" :link="`${item.name}/edit`"></f7-button> -->
              <div slot="subtitle">
                <f7-chip v-for="tag in getNonSemanticTags(item)" :key="tag" :text="tag" media-bg-color="blue" style="margin-right: 6px">
                  <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                </f7-chip>
              </div>
            </f7-list-item>
          </ul>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !items.length" class="block-narrow">
      <empty-state-placeholder icon="square_on_circle" title="items.title" text="items.text" />
      <f7-row v-if="$f7.width < 1280" class="display-flex justify-content-center">
        <f7-button large fill color="blue" external :href="`${$store.state.websiteUrl}/link/items`" target="_blank" v-t="'home.overview.button.documentation'" />
      </f7-row>
    </f7-block>

    <f7-fab v-show="!showCheckboxes" position="center-bottom" text="Refresh" slot="fixed" color="blue" @click="load()">
      <f7-icon ios="f7:arrow_clockwise" md="material:refresh" aurora="f7:arrow_clockwise" />
    </f7-fab>
    <f7-fab v-show="!showCheckboxes" position="right-bottom" slot="fixed" color="blue" href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
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
import Vue from 'vue'
import Clipboard from 'v-clipboard'

Vue.use(Clipboard)

import ItemMixin from '@/components/item/item-mixin'

export default {
  mixins: [ItemMixin],
  components: {
    'empty-state-placeholder': () => import('@/components/empty-state-placeholder.vue')
  },
  data () {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      items: [], // [{ label: 'Staircase', name: 'Staircase'}],
      vlData: {
        items: []
      },
      vlParams: {
        items: [],
        searchAll: this.searchAll,
        renderExternal: this.renderExternal,
        height: this.height
      },
      selectedItems: [],
      showCheckboxes: false,
      eventSource: null
    }
  },
  methods: {
    onPageAfterIn (event) {
      this.load()
    },
    onPageBeforeOut (event) {
      this.stopEventSource()
      this.$f7.data.lastItemSearchQuery = this.$refs.searchbar?.f7Searchbar.query
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.initSearchbar) this.$f7.data.lastItemSearchQuery = this.$refs.searchbar?.f7Searchbar.query
      this.initSearchbar = false

      this.$oh.api.get('/rest/items?metadata=semantics').then(data => {
        this.items = data.sort((a, b) => {
          const labelA = a.label || a.name
          const labelB = b.label || b.name
          return labelA.localeCompare(labelB)
        })
        this.$refs.itemsList.f7VirtualList.replaceAllItems(this.items)
        this.initSearchbar = true
        this.loading = false

        if (!this.eventSource) this.startEventSource()
        this.ready = true

        this.$nextTick(() => {
          if (this.$device.desktop) {
            this.$refs.searchbar?.f7Searchbar.$inputEl[0].focus()
          }
          this.$refs.searchbar?.f7Searchbar.search(this.$f7.data.lastItemSearchQuery || '')
        })
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/items/*/added,openhab/items/*/removed,openhab/items/*/updated', null, (event) => {
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
    filterSelectedItems (query) {
      if (!this.$refs.itemsList.f7VirtualList.filteredItems) {
        return
      }
      this.selectedItems = this.selectedItems.filter((i) => this.$refs.itemsList.f7VirtualList.filteredItems.find((item) => item.name === i))
    },
    searchAll (query, items) {
      const found = []
      for (let i = 0; i < items.length; i += 1) {
        let haystack = items[i].name
        if (items[i].label) haystack += ' ' + items[i].label
        if (items[i].tags) for (let j = 0; j < items[i].tags.length; j += 1) haystack += ' ' + items[i].tags[j]
        haystack += ' ' + this.getItemTypeAndMetaLabel(items[i])
        if (
          haystack.toLowerCase().indexOf(query.toLowerCase()) >= 0 ||
          query.trim() === ''
        ) { found.push(i) }
      }
      return found // return array with matched indexes
    },
    renderExternal (vl, vlData) {
      this.vlData = vlData
    },
    getListSize () {
      if (this.$refs.searchbar?.f7Searchbar.query) {
        return this.$refs.itemsList.f7VirtualList.filteredItems.length
      }
      return this.items.length
    },
    height (item) {
      let vlHeight
      if (this.$theme.ios) vlHeight = 78
      if (this.$theme.aurora) vlHeight = 60.77
      if (this.$theme.md) vlHeight = 87.4
      if (this.$device.macos) {
        if (window.navigator.userAgent.includes('Safari') && !window.navigator.userAgent.includes('Chrome')) vlHeight -= 0.77
      }

      const nonSemanticTags = this.getNonSemanticTags(item)
      if (nonSemanticTags.length > 0) {
        vlHeight += 24
        if (this.$theme.ios) vlHeight += 4
        if (this.$theme.md) vlHeight += 12
      }
      return vlHeight
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    click (event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.name, item)
      } else {
        this.$f7router.navigate(item.name)
      }
    },
    ctrlClick (event, item) {
      this.toggleItemCheck(event, item.name, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    toggleItemCheck (event, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    areAllSelected () {
      return this.selectedItems.length >= this.getListSize()
    },
    selectDeselectAll () {
      if (this.areAllSelected()) {
        this.selectedItems = []
      } else if (this.$refs.itemsList.f7VirtualList.filteredItems?.length > 0) {
        this.selectedItems = this.$refs.itemsList.f7VirtualList.filteredItems.map((i) => i.name)
      } else {
        this.selectedItems = this.items.map((i) => i.name)
      }
    },
    copySelected () {
      const promises = this.selectedItems.map((itemName) => this.$oh.api.getPlain({
        url: '/rest/file-format/items/' + itemName,
        headers: { accept: 'text/vnd.openhab.dsl.item' }
      }))
      Promise.all(promises).then((data) => {
        if (this.$clipboard(data.join('\n'))) {
          this.$f7.toast.create({
            text: 'DSL definitions copied to clipboard',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
      })
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
  computed: {
    searchPlaceholder () {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    }
  }
}
</script>
