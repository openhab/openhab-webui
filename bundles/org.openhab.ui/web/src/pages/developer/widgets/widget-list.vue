<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar>
      <oh-nav-content title="Widgets" back-link="Developer Tools" back-link-url="/developer/" :f7router>
        <template #right>
          <f7-link icon-md="material:done_all" @click="toggleCheck()" :text="!theme.md ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-widgets"
          custom-search
          @searchbar:search="search"
          @searchbar:clear="clearSearch"
          @searchbar:disable="clearSearch"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="showCheckboxes" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <div v-if="!theme.md && selectedItems.length > 0" class="display-flex justify-content-center" style="width: 100%">
        <f7-link
          color="red"
          class="delete display-flex flex-direction-row margin-right"
          icon-ios="f7:trash"
          icon-aurora="f7:trash"
          @click="removeSelected">
          Remove {{ selectedItems.length }}
        </f7-link>
        <f7-link
          color="blue"
          class="copy display-flex flex-direction-row"
          @click="copySelectedItemsToClipboard"
          icon-ios="f7:square_on_square"
          icon-aurora="f7:square_on_square">
          &nbsp;Copy
        </f7-link>
      </div>
      <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">{{ selectedItems.length }} selected</div>
      <div v-if="theme.md && selectedItems.length" class="right">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected" />
        <f7-link tooltip="Copy selected" icon-md="material:content_copy" icon-color="white" @click="copySelectedItemsToClipboard" />
      </div>
    </f7-toolbar>

    <f7-block v-show="!nowidgetEngine" class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-show="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list media-list class="col wide">
          <f7-list-group>
            <f7-list-item
              v-for="n in 20"
              media-item
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Title of the widget"
              subtitle="Tag1, Tag2, Tag3..." />
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-if="ready">
        <f7-block-title> {{ listTitle }} </f7-block-title>
        <list-filter v-if="ready" ref="filters" :filters="filters" @toggled="updateFilteredItems" @reset="updateFilteredItems" />
        <f7-list v-if="!listedItems.length && widgets.length" class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <f7-list v-show="listedItems.length > 0" class="col widgets-list" ref="widgetsList" media-list>
          <f7-list-item
            v-for="(widget, index) in listedItems"
            :key="index"
            media-item
            class="widgetlist-item"
            :checkbox="showCheckboxes"
            :checked="isChecked(widget.uid)"
            prevent-router
            @click.ctrl="ctrlClick($event, widget)"
            @click.meta="ctrlClick($event, widget)"
            @click.exact="click($event, widget)"
            :link="`${encodeURIComponent(widget.uid)}`"
            :title="widget.uid">
            <template #subtitle>
              <div>
                <f7-chip v-for="tag in widget.tags" :key="tag" :text="tag" media-bg-color="blue" style="margin-right: 6px">
                  <template #media>
                    <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                  </template>
                </f7-chip>
              </div>
            </template>
            <template #media>
              <span class="item-initial">{{ widget.uid[0].toUpperCase() }}</span>
            </template>
            <template #after>
              <!-- This is here to push the after-title icon so it would appear immediately after the title
                    for consistency with Things, Items, and other lists that have the lock icon for non-editable entries -->
            </template>
            <template #after-title>
              <f7-icon v-if="widget.editable === false" f7="lock_fill" size="1rem" color="gray" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
    <template #fixed>
      <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" color="blue" href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:close" md="material:close" aurora="f7:close" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<script>
import { f7, theme } from 'framework7-vue'
import { nextTick, toRaw } from 'vue'
import { showToast } from '@/js/dialog-promises'

import copyToClipboard from '@/js/clipboard'
import { toFileYAMLSyntax } from '@/pages/yaml-file-format'
import ListFilter from '@/components/util/list-filter.vue'

const ITEM_KINDS = {
  editable: 'Editable',
  readonly: 'Non-editable',
  marketplace: 'Marketplace'
}

export default {
  components: {
    ListFilter
  },
  props: {
    f7router: Object
  },
  setup() {
    return { theme }
  },
  data() {
    return {
      ready: false,
      loading: false,
      nowidgetEngine: false,
      widgets: [],
      filteredItems: [],
      filters: {
        kinds: {
          label: 'Kind',
          options: { ...ITEM_KINDS }
        },
        tags: {
          label: 'Tag',
          options: {}
        }
      },
      searchQuery: null,
      initSearchbar: false,
      selectedItems: [],
      showCheckboxes: false,
      eventSource: null
    }
  },
  computed: {
    listedItems() {
      if (!this.searchQuery) return this.filteredItems
      const query = this.searchQuery.toLowerCase()
      return this.filteredItems.filter((widget) => {
        const haystack = [widget.uid, ...(widget.tags || [])].join(' ').toLowerCase()
        return haystack.includes(query)
      })
    },
    listTitle() {
      let title = this.listedItems.length
      if (this.searchQuery || this.$refs.filters?.filtered) {
        title += ` of ${this.widgets.length} widgets found`
      } else {
        title += ' widgets'
      }
      return title
    }
  },
  methods: {
    onPageAfterIn() {
      this.load()
    },
    load() {
      if (this.loading) return
      this.loading = true
      this.$oh.api.get('/rest/ui/components/ui:widget').then((data) => {
        this.widgets = data.sort((a, b) => {
          return a.uid.localeCompare(b.uid)
        })

        const uniqueTags = new Set()
        this.widgets.forEach((widget) => {
          ;(widget.tags || []).forEach((t) => {
            if (t.startsWith('marketplace:')) return
            uniqueTags.add(t)
          })
        })
        const sortedTags = Array.from(uniqueTags).sort((a, b) => a.localeCompare(b))
        this.filters.tags.options = Object.fromEntries(sortedTags.map((tag) => [tag, tag]))

        this.loading = false
        this.ready = true
        this.updateFilteredItems()
        setTimeout(() => {
          this.initSearchbar = true
          nextTick(() => {
            if (this.$device.desktop && this.$refs.searchbar) {
              this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
            }
          })
        })
      })
    },
    search(searchbar, query) {
      this.searchQuery = query.trim().toLowerCase() || null
    },
    clearSearch() {
      this.searchQuery = null
    },
    updateFilteredItems() {
      const filters = this.$refs.filters
      if (!filters || !filters.filtered) {
        this.filteredItems = this.widgets
        return
      }

      const selected = filters.selected
      this.filteredItems = this.widgets.filter((widget) => {
        const widgetKinds = new Set()
        widgetKinds.add(widget.editable === false ? 'readonly' : 'editable')
        if ((widget.tags || []).some((t) => t.startsWith('marketplace:'))) widgetKinds.add('marketplace')
        const kindMatch = !selected.kinds.size || toRaw(selected.kinds).intersection(widgetKinds).size > 0

        const tagsMatch = !selected.tags.size || (widget.tags || []).some((t) => selected.tags.has(t))

        return kindMatch && tagsMatch
      })
    },
    toggleCheck() {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked(item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    click(event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.uid, item)
      } else {
        this.f7router.navigate(item.uid, { animate: false })
      }
    },
    ctrlClick(event, item) {
      this.toggleItemCheck(event, item.uid, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    toggleItemCheck(event, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    removeSelected() {
      const vm = this

      if (this.selectedItems.some((i) => this.widgets.find((w) => w.uid === i)?.editable === false)) {
        f7.dialog.alert('Some of the selected widgets are not modifiable because they have been provisioned by files')
        return
      }

      f7.dialog.confirm(`Remove ${this.selectedItems.length} selected widgets?`, 'Remove widgets', () => {
        vm.doRemoveSelected()
      })
    },
    doRemoveSelected() {
      let dialog = f7.dialog.progress('Deleting widgets...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/ui/components/ui:widget/' + i))
      Promise.all(promises)
        .then((data) => {
          showToast('Widgets removed')
          this.selectedItems = []
          dialog.close()
          this.load()
          f7.emit('sidebarRefresh', null)
        })
        .catch((err) => {
          dialog.close()
          this.load()
          console.error(err)
          f7.dialog.alert('An error occurred while deleting: ' + err)
          f7.emit('sidebarRefresh', null)
        })
    },
    copySelectedItemsToClipboard() {
      const itemsToCopy = this.widgets.filter((widget) => this.selectedItems.includes(widget.uid))
      const yaml = toFileYAMLSyntax('widgets', itemsToCopy)
      copyToClipboard(yaml, {
        onSuccess: () => showToast('Selected Widget definitions copied to clipboard'),
        onError: () => showToast('Failed to copy widget definitions to clipboard')
      })
    }
  }
}
</script>
