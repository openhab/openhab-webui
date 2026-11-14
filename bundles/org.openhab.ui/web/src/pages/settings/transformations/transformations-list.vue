<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Transformations" back-link="Settings" back-link-url="/settings/">
        <template #right>
          <f7-link
            icon-md="material:done_all"
            @click="selection.toggleSelectionMode()"
            :text="!theme.md ? (selection.selectionMode ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-transformations"
          :init="initSearchbar"
          search-container=".transformations-list"
          search-item=".transformationlist-item"
          search-in=".item-title, .item-subtitle, .item-footer"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar v-if="selection.selectionMode" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <list-selection-actions
        @close="selection.toggleSelectionMode"
        :remove-count="selectedDeletable.size"
        @remove="removeSelected"
        :copy-count="selection.selected.size" />
    </f7-toolbar>

    <f7-list-index
      v-if="$refs.transformationsList"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      ref="listIndex"
      listEl=".transformations-list"
      :scroll-list="true"
      :label="true" />

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready" v-deferred>
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col transformations-list">
          <f7-list-group>
            <f7-list-item
              v-for="n in 20"
              media-item
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the transformation"
              subtitle="Transformation type"
              footer="Transformation UID" />
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-show="transformations.length > 0">
        <f7-list class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <group-box full-width>
          <list-header>
            <template v-if="selection.selectionMode" #before-title>
              <f7-checkbox
                :indeterminate="selection.someSelected && !selection.allSelected"
                :checked="selection.allSelected"
                @change="selection.selectDeselectAll" />
            </template>
            <template #title>
              {{ transformations.length + ' transformations' }}
            </template>
            <template #view>
              <f7-segmented strong class="grouping-switch">
                <f7-button :active="groupBy === 'alphabetical'" @click="groupBy = 'alphabetical'">A-Z</f7-button>
                <f7-button :active="groupBy === 'type'" @click="groupBy = 'type'">Type</f7-button>
              </f7-segmented>
            </template>
          </list-header>
          <f7-list
            class="searchbar-found col transformations-list"
            ref="transformationsList"
            :contacts-list="groupBy === 'alphabetical'"
            media-list>
            <f7-list-group v-for="(transformationsWithInitial, initial) in indexedTransformations" :key="initial">
              <f7-list-item v-if="transformationsWithInitial.length" :title="initial" group-title />
              <f7-list-item
                v-for="transformation in transformationsWithInitial"
                :key="transformation.uid"
                media-item
                class="transformationlist-item"
                :checkbox="selection.selectionMode && transformation.editable"
                :checked="selection.isSelected(transformation.uid)"
                @click.ctrl="(e) => selection.ctrlClick(transformation.uid)"
                @click.meta="(e) => selection.ctrlClick(transformation.uid)"
                @click.exact="(e) => click(e, transformation)"
                link=""
                :title="transformation.label"
                :subtitle="transformation.type">
                <template #after-title>
                  <f7-icon v-if="!transformation.editable" f7="lock_fill" size="1rem" color="gray" />
                </template>
                <template #footer>
                  {{ transformation.uid }}
                  <clipboard-icon :value="transformation.uid" tooltip="Copy UID" />
                </template>
              </f7-list-item>
            </f7-list-group>
          </f7-list>
        </group-box>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !transformations.length" class="block-narrow">
      <empty-state-placeholder icon="arrow_2_squarepath" title="transformations.title" text="transformations.text" />
      <f7-row v-if="$f7dim.width < BREAKPOINTS.LG" class="display-flex justify-content-center">
        <f7-button
          large
          fill
          color="theme-alt"
          external
          :href="`${runtimeStore.websiteUrl}/link/transformations`"
          target="_blank"
          :text="$t('home.overview.button.documentation')" />
      </f7-row>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="ready && !selection.selectionMode" position="right-bottom" color="theme-alt" href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<style lang="stylus">
.searchbar-found
  @media (--media-MD-up)
    padding-left 0 !important
    padding-right 0 !important
</style>

<script>
import { computed, nextTick, reactive, shallowRef } from 'vue'
import { useStorage } from '@vueuse/core'
import { f7, theme } from 'framework7-vue'

import ClipboardIcon from '@/components/util/clipboard-icon.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import ListSelectionActions from '@/components/list/list-selection-actions.vue'
import ListHeader from '@/components/list/list-header.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useSelection } from '@/components/useSelection'

import * as api from '@/api'
import { showToast, showConfirmDialog } from '@/js/dialog-promises'
import { BREAKPOINTS } from '@/js/constants/breakpoints'

const storagePrefix = 'openhab.ui:transformations:'

export default {
  props: {
    f7router: Object
  },
  components: {
    EmptyStatePlaceholder,
    ClipboardIcon,
    ListSelectionActions,
    ListHeader
  },
  setup() {
    const transformations = shallowRef([])
    const lastSearchQuery = useStorage(storagePrefix + 'search', '', sessionStorage)
    const runtimeStore = useRuntimeStore()

    const transformationUids = computed(() => transformations.value.map((transformation) => transformation.uid))

    const selection = reactive(useSelection(transformationUids))

    return { f7, theme, lastSearchQuery, BREAKPOINTS, selection, transformations, runtimeStore }
  },
  data() {
    return {
      ready: false,
      loading: false,
      initSearchbar: false,
      groupBy: 'alphabetical'
    }
  },
  computed: {
    selectedDeletable() {
      return new Set(this.transformations.filter((t) => this.selection.selected.has(t.uid) && t.editable).map((t) => t.uid))
    },
    indexedTransformations() {
      if (this.groupBy === 'alphabetical') {
        return this.transformations.reduce((prev, transformation) => {
          const label = transformation.label || transformation.uid
          const initial = label.substring(0, 1).toUpperCase()
          if (!prev[initial]) {
            prev[initial] = []
          }
          prev[initial].push(transformation)

          return prev
        }, {})
      } else {
        const typeGroups = this.transformations.reduce((prev, transformation) => {
          const type = transformation.type.toUpperCase()
          if (!prev[type]) {
            prev[type] = []
          }
          prev[type].push(transformation)

          return prev
        }, {})
        return Object.keys(typeGroups)
          .sort((a, b) => a.localeCompare(b))
          .reduce((objEntries, key) => {
            objEntries[key] = typeGroups[key]
            return objEntries
          }, {})
      }
    }
  },
  watch: {
    groupBy(newValue, oldValue) {
      if (newValue === 'alphabetical' && this.$refs.listIndex) {
        this.$refs.listIndex.update()
      }
    }
  },
  methods: {
    async onPageAfterIn() {
      this.load()
    },
    onPageBeforeOut(event) {
      this.lastSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query ?? null
    },
    async load() {
      if (this.loading) return
      this.loading = true

      if (this.initSearchbar) {
        this.lastSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query ?? null
      }
      this.initSearchbar = false

      const _transformations = await api.getTransformations()
      this.transformations = _transformations.sort((a, b) => (a.label || a.uid).localeCompare(b.label || a.uid))

      this.loading = false
      this.ready = true
      this.initSearchbar = true

      nextTick(() => {
        if (this.$refs.listIndex) this.$refs.listIndex.update()
        if (this.$device.desktop && this.$refs.searchbar) this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
        this.$refs.searchbar?.$el.f7Searchbar.search(this.lastSearchQuery || '')
      })
    },
    click(event, transformation) {
      if (this.selection.selectionMode) {
        this.selection.toggleItemSelection(transformation.uid)
      } else {
        this.f7router.navigate(transformation.uid)
      }
    },
    async removeSelected() {
      if (this.selectedDeletable.size === 0) return
      if (!(await showConfirmDialog(`Remove ${this.selectedDeletable.size} selected transformations?`, 'Remove Transformations'))) return

      let dialog = f7.dialog.progress('Deleting Transformations...')
      const promises = [...this.selectedDeletable].map((p) => {
        return api.deleteTransformation({ uid: p })
      })
      try {
        await Promise.all(promises)
        showToast('Transformations removed')
      } catch (err) {
        console.error(err)
        f7.dialog.alert('An error occurred while deleting: ' + err)
      } finally {
        dialog.close()
        this.load()
        f7.emit('sidebarRefresh', null) // for what?
      }
    }
  }
}
</script>
