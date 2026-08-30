<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Widgets" back-link="Developer Tools" back-link-url="/developer/" :f7router>
        <template #right>
          <f7-link icon-md="material:done_all" @click="toggleCheck()" :text="!theme.md ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <oh-searchbar
          v-if="initSearchbar"
          ref="oh-searchbar"
          class="searchbar-widgets"
          :persist-search-string-key="'widgets-search-string'"
          :haystack-fields="haystackFields"
          :filters-definitions="filtersDefinitions"
          @update:tokenized-search="onUpdateTokenizedSearch" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="showCheckboxes" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <div v-if="!theme.md && selected.length > 0" class="display-flex justify-content-center" style="width: 100%">
        <f7-link
          color="red"
          class="delete display-flex flex-direction-row margin-right"
          icon-ios="f7:trash"
          icon-aurora="f7:trash"
          @click="removeSelected">
          Remove {{ selected.length }}
        </f7-link>
        <f7-link
          color="theme-alt"
          class="copy display-flex flex-direction-row"
          @click="copySelectedItemsToClipboard"
          icon-ios="f7:square_on_square"
          icon-aurora="f7:square_on_square">
          &nbsp;Copy
        </f7-link>
      </div>
      <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">{{ selected.length }} selected</div>
      <div v-if="theme.md && selected.length" class="right">
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
        <f7-block-title>
          <span>{{ getListTitle(isFiltered, filteredList.length, widgets.length, 'Widget', selected.length) }}</span>
          <template v-if="showCheckboxes && filteredList.length">
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
        </f7-block-title>
        <f7-list v-if="!filteredList.length && widgets.length" class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <f7-list v-show="filteredList.length > 0" class="col widgets-list" ref="widgetsList" media-list>
          <f7-list-item
            v-for="widget in filteredList"
            :key="widget.uid"
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
                <f7-chip v-for="tag in widget.tags" :key="tag" :text="tag" media-bg-color="theme-alt" style="margin-right: 6px">
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
      <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" color="theme-alt" href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:close" md="material:close" aurora="f7:close" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<script>
import { f7, theme } from 'framework7-vue'
import { nextTick, shallowRef, toRaw, useTemplateRef } from 'vue'
import { showToast } from '@/js/dialog-promises'

import copyToClipboard from '@/js/clipboard'
import { toFileYAMLSyntax } from '@/pages/yaml-file-format'
import OhSearchbar from '@/pages/oh-searchbar.vue'

import { useSearch } from '@/components/useSearch'
import { getListTitle, findElementsInObject } from '@/pages/list-helpers'

const ITEM_KINDS = {
  editable: 'Editable',
  readonly: 'Non-editable',
  marketplace: 'Marketplace'
}

export default {
  components: {
    OhSearchbar
  },
  props: {
    f7router: Object
  },
  setup() {
    const widgets = shallowRef([])
    const haystackFields = ['uid', 'tags', 'title']
    const ohSearchbarRef = useTemplateRef('oh-searchbar')

    const filtersDefinitions = {
      is: {
        label: 'Kind',
        options: ['Editable', 'Readonly', 'Marketplace', 'Template'],
        getFn: (widget) =>
          widget.editable === true ? 'editable' : widget.tags?.some((t) => t.startsWith('marketplace:')) ? 'marketplace' : 'readonly'
      },
      uid: {
        label: 'UID'
      },
      tag: {
        label: 'Tag',
        path: 'tags'
      },
      title: {
        title: 'Title',
        path: 'config.title'
      },
      component: {
        label: 'Component',
        getFn: (widget) => findElementsInObject(toRaw(widget), 'component')
      }
    }

    const { filteredList, isFiltered, onUpdateTokenizedSearch, getFuseValuesForField } = useSearch(widgets, {
      filtersDefinitions,
      haystackFields
    })

    filtersDefinitions.tag.options = () => getFuseValuesForField('tag')
    filtersDefinitions.component.options = () => getFuseValuesForField('component')

    return {
      theme,
      widgets,
      filtersDefinitions,
      filteredList,
      isFiltered,
      onUpdateTokenizedSearch,
      getListTitle,
      ohSearchbarRef
    }
  },
  data() {
    return {
      ready: false,
      loading: false,
      nowidgetEngine: false,
      selected: [],
      initSearchbar: false,
      showCheckboxes: false,
      eventSource: null
    }
  },
  computed: {
    allSelected() {
      return this.selected.length >= this.filteredList.length && this.filteredList.length > 0
    }
  },
  methods: {
    async onPageAfterIn() {
      await this.load()
    },
    onPageBeforeOut() {
      this.ohSearchbarRef?.persistSearchbarQuery()
    },
    async load() {
      if (this.loading) return
      this.loading = true
      await this.$oh.api.get('/rest/ui/components/ui:widget').then((data) => {
        this.widgets = data.sort((a, b) => {
          return a.uid.localeCompare(b.uid)
        })

        this.initSearchbar = true
        this.loading = false
        this.ready = true
        nextTick(() => {
          if (this.$device.desktop) {
            this.ohSearchbarRef?.focus()
          }
        })
      })
    },
    toggleCheck() {
      this.showCheckboxes = !this.showCheckboxes
    },
    selectDeselectAll() {
      if (this.allSelected) {
        this.selected = []
      } else {
        this.selected = this.filteredList.map((widget) => widget.uid)
      }
    },
    isChecked(item) {
      return this.selected.indexOf(item) >= 0
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
      if (!this.selected.length) this.showCheckboxes = false
    },
    toggleItemCheck(event, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(item)) {
        this.selected.splice(this.selected.indexOf(item), 1)
      } else {
        this.selected.push(item)
      }
    },
    removeSelected() {
      const vm = this

      if (this.selected.some((i) => this.widgets.find((w) => w.uid === i)?.editable === false)) {
        f7.dialog.alert('Some of the selected widgets are not modifiable because they have been provisioned by files')
        return
      }

      f7.dialog.confirm(`Remove ${this.selected.length} selected widgets?`, 'Remove widgets', () => {
        vm.doRemoveSelected()
      })
    },
    doRemoveSelected() {
      let dialog = f7.dialog.progress('Deleting widgets...')

      const promises = this.selected.map((i) => this.$oh.api.delete('/rest/ui/components/ui:widget/' + i))
      Promise.all(promises)
        .then((data) => {
          showToast('Widgets removed')
          this.selected = []
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
      const itemsToCopy = this.widgets.filter((widget) => this.selected.includes(widget.uid))
      const yaml = toFileYAMLSyntax('widgets', itemsToCopy)
      copyToClipboard(yaml, {
        onSuccess: () => showToast('Selected Widget definitions copied to clipboard'),
        onError: () => showToast('Failed to copy widget definitions to clipboard')
      })
    }
  }
}
</script>
