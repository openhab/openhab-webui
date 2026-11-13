<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar>
      <oh-nav-content title="Block Libraries" back-link="Developer Tools" back-link-url="/developer/" :f7router>
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
          class="searchbar-blocks"
          :init="initSearchbar"
          search-container=".blocks-list"
          search-item=".blockslist-item"
          search-in=".item-title, .item-subtitle, .item-header, .item-footer"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="selection.selectionMode" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <list-selection-actions
        @close="selection.toggleSelectionMode()"
        :remove-count="selectedDeletable.size"
        @remove="removeSelected"
        :copy-count="selection.selected.size"
        @copy="copySelected" />
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
              title="Title of the block library"
              subtitle="Tag1, Tag2, Tag3..." />
          </f7-list-group>
        </f7-list>
      </f7-col>
      <f7-col v-if="ready">
        <f7-list class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>

        <group-box v-if="ready" :title="blocks.length + ' block libraries'">
          <f7-list v-show="blocks.length > 0" class="searchbar-found col blocks-list" ref="blocksList" media-list>
            <f7-list-item
              v-for="(b, index) in blocks"
              :key="index"
              media-item
              class="blockslist-item"
              :checkbox="selection.selectionMode"
              :checked="selection.isSelected(b.uid)"
              prevent-router
              @click.ctrl="selection.ctrlClick(b.uid)"
              @click.meta="selection.ctrlClick(b.uid)"
              @click.exact="click($event, b)"
              :link="`${b.uid}`"
              :title="b.uid">
              <template #subtitle>
                <div>
                  <f7-chip v-for="tag in b.tags" :key="tag" :text="tag" media-bg-color="theme-alt" style="margin-right: 6px">
                    <template #media>
                      <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                    </template>
                  </f7-chip>
                </div>
              </template>
              <template #media>
                <span class="item-initial">{{ b.uid[0].toUpperCase() }}</span>
              </template>
              <template #after>
                <!-- This is here to push the after-title icon so it would appear immediately after the title
                    for consistency with Things, Items, and other lists that have the lock icon for non-editable entries -->
              </template>
              <template #after-title>
                <f7-icon v-if="b.editable === false" f7="lock_fill" color="gray" />
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
import { nextTick, shallowRef, reactive, computed } from 'vue'
import { f7, theme } from 'framework7-vue'
import { showToast, showConfirmDialog } from '@/js/dialog-promises'

import copyToClipboard from '@/js/clipboard'
import { toFileYAMLSyntax } from '@/pages/yaml-file-format'

import { useSelection } from '@/components/useSelection'
import ListSelectionActions from '@/components/list/list-selection-actions.vue'

export default {
  props: {
    f7router: Object
  },
  components: {
    ListSelectionActions
  },
  setup() {
    const blocks = shallowRef([])

    const blockUids = computed(() => blocks.value.map((b) => b.uid))
    const selection = reactive(useSelection(blockUids))

    return { theme, blocks, selection }
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
      return new Set(this.blocks.filter((b) => this.selection.selected.has(b.uid) && b.editable).map((b) => b.uid))
    }
  },
  methods: {
    onPageAfterIn() {
      this.load()
    },
    load() {
      if (this.loading) return
      this.loading = true
      this.$oh.api.get('/rest/ui/components/ui:blocks').then((data) => {
        this.blocks = data.sort((a, b) => {
          return a.uid.localeCompare(b.uid)
        })
        this.loading = false
        this.ready = true
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
    click(event, block) {
      if (this.selection.selectionMode) {
        this.selection.toggleItemSelection(block.uid)
      } else {
        this.f7router.navigate(block.uid, { animate: false })
      }
    },
    async removeSelected() {
      if (this.selectedDeletable.size === 0) return
      if (
        !(await showConfirmDialog(
          `Remove ${this.selectedDeletable.size} selected block librar${this.selectedDeletable.size === 1 ? 'y' : 'ies'}?`,
          'Remove block libraries'
        ))
      )
        return

      let dialog = f7.dialog.progress('Deleting block libraries...')
      const promises = [...this.selectedDeletable].map((i) => this.$oh.api.delete('/rest/ui/components/ui:blocks/' + i))
      try {
        await Promise.all(promises)
        showToast('Block library removed')
      } catch (err) {
        console.error(err)
        f7.dialog.alert('An error occurred while deleting: ' + err)
      } finally {
        dialog.close()
        this.load()
        f7.emit('sidebarRefresh', null)
      }
    },
    copySelected() {
      const itemsToCopy = this.blocks.filter((block) => this.selection.selected.has(block.uid))
      const yaml = toFileYAMLSyntax('blocks', itemsToCopy)
      copyToClipboard(yaml, {
        onSuccess: () => showToast(`${itemsToCopy.length} block library definitions copied to clipboard`),
        onError: () => showToast('Failed to copy block library definitions to clipboard')
      })
    }
  }
}
</script>
