<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Widgets" back-link="Developer Tools" back-link-url="/developer/" :f7router>
        <template #right>
          <f7-link
            icon-md="material:done_all"
            @click="selection.toggleSelectionMode"
            :text="!theme.md ? (selection.selectionMode ? 'Done' : 'Select') : ''" />
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
          @update:tokenized-search="search.onUpdateTokenizedSearch" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="selection.selectionMode" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <list-selection-actions
        @close="selection.toggleSelectionMode"
        :remove-count="selectedDeletable.size"
        @remove="removeSelected"
        :copy-count="selection.selectedInFilter.size"
        @copy="copySelectedItemsToClipboard" />
    </f7-toolbar>

    <f7-block v-show="!nowidgetEngine" class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready" v-deferred>
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
        <f7-list v-if="search.filteredResults.length === 0 && widgets.length" class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <group-box
          :title="
            getListTitle(search.isFiltered, search.filteredResults.length, widgets.length, 'Widget', selection.selectedInFilter.size)
          ">
          <template v-if="selection.selectionMode && search.filteredResults.length" #after-title>
            <f7-link @click="selection.selectDeselectAll" :text="selection.allSelected ? 'Deselect all' : 'Select all'" />
          </template>
          <f7-list v-show="search.filteredResults.length > 0" class="col widgets-list" ref="widgetsList" media-list>
            <f7-list-item
              v-for="{ item: widget, matches } in search.filteredResults"
              :key="widget.uid"
              media-item
              class="widgetlist-item"
              :checkbox="selection.selectionMode"
              :checked="selection.isSelected(widget.uid)"
              prevent-router
              @click.ctrl="selection.ctrlClick(widget.uid)"
              @click.meta="selection.ctrlClick(widget.uid)"
              @click.exact="click($event, widget)"
              :link="`${encodeURIComponent(widget.uid)}`">
              <template #title>
                <span v-html="highlightMatches(widget.uid, matches, 'uid')"></span>
              </template>
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
        </group-box>
      </f7-col>
    </f7-block>
    <template #fixed>
      <f7-fab v-show="ready && !selection.selectionMode" position="right-bottom" color="theme-alt" href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:close" md="material:close" aurora="f7:close" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<script>
import { nextTick, reactive, shallowRef, toRaw, useTemplateRef } from 'vue'
import { f7, theme } from 'framework7-vue'
import { showToast, showConfirmDialog } from '@/js/dialog-promises'

import copyToClipboard from '@/js/clipboard'
import { toFileYAMLSyntax } from '@/pages/yaml-file-format'
import OhSearchbar from '@/pages/oh-searchbar.vue'
import ListSelectionActions from '@/components/list/list-selection-actions.vue'

import { useSearch } from '@/components/useSearch'
import { useSelection } from '@/components/useSelection'
import { getListTitle, findElementsInObject, highlightMatches } from '@/pages/list-helpers'

export default {
  components: {
    OhSearchbar,
    ListSelectionActions
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

    const searchState = useSearch(widgets, {
      filtersDefinitions,
      haystackFields,
      uidField: 'uid',
      includeMatches: true
    })
    const search = reactive(searchState)
    const selection = reactive(useSelection(searchState.filteredUids))

    filtersDefinitions.tag.options = () => search.getFuseValuesForField('tag')
    filtersDefinitions.component.options = () => search.getFuseValuesForField('component')

    return {
      theme,
      widgets,
      filtersDefinitions,
      search,
      selection,
      haystackFields,
      getListTitle,
      highlightMatches,
      ohSearchbarRef
    }
  },
  data() {
    return {
      ready: false,
      loading: false,
      nowidgetEngine: false,
      initSearchbar: false,
      eventSource: null
    }
  },
  computed: {
    selectedDeletable() {
      return new Set(
        this.widgets.filter((widget) => this.selection.selectedInFilter.has(widget.uid) && widget.editable).map((widget) => widget.uid)
      )
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
      this.initSearchbar = false

      this.widgets = []
      this.selection.clearSelection()
      this.selection.selectionMode = false

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
    click(event, item) {
      if (this.selection.selectionMode) {
        this.selection.toggleItemSelection(item.uid)
      } else {
        this.f7router.navigate(item.uid, { animate: false })
      }
    },
    async removeSelected() {
      if (this.selectedDeletable.size === 0) return
      if (
        !(await showConfirmDialog(
          `Remove ${this.selectedDeletable.size} of ${this.selection.selectedInFilter.size} selected widget(s)?`,
          'Remove Widgets'
        ))
      )
        return

      let dialog = f7.dialog.progress('Deleting widgets...')
      const promises = [...this.selectedDeletable].map((i) => this.$oh.api.delete('/rest/ui/components/ui:widget/' + i))
      try {
        await Promise.all(promises)
        showToast('Widgets removed')
      } catch (err) {
        console.error(err)
        f7.dialog.alert('An error occurred while deleting: ' + err)
      } finally {
        dialog.close()
        this.load()
        f7.emit('sidebarRefresh', null)
      }
    },
    copySelectedItemsToClipboard() {
      const itemsToCopy = this.widgets.filter((widget) => this.selection.selectedInFilter.has(widget.uid))
      const yaml = toFileYAMLSyntax('widgets', itemsToCopy)
      copyToClipboard(yaml, {
        onSuccess: () => showToast('Selected Widget definitions copied to clipboard'),
        onError: () => showToast('Failed to copy widget definitions to clipboard')
      })
    }
  }
}
</script>
