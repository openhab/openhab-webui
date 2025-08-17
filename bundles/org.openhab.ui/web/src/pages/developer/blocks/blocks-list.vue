<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar title="Block Libraries"
               back-link="Developer Tools"
               back-link-url="/developer/"
               back-link-force>
      <f7-nav-right>
        <f7-link icon-md="material:done_all"
                 @click="toggleCheck()"
                 :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-blocks"
          :init="initSearchbar"
          search-container=".blocks-list"
          search-item=".blockslist-item"
          search-in=".item-title, .item-subtitle, .item-header, .item-footer"
          :disable-button="!$theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar"
                :class="{ 'navbar': $theme.md }"
                v-if="showCheckboxes"
                bottom-ios
                bottom-aurora>
      <f7-link color="red"
               v-show="selectedItems.length"
               v-if="!$theme.md"
               class="delete"
               icon-ios="f7:trash"
               icon-aurora="f7:trash"
               @click="removeSelected">
        Remove {{ selectedItems.length }}
      </f7-link>
      <f7-link v-if="$theme.md"
               icon-md="material:close"
               icon-color="white"
               @click="showCheckboxes = false" />
      <div class="title" v-if="$theme.md">
        {{ selectedItems.length }} selected
      </div>
      <div class="right" v-if="$theme.md">
        <f7-link v-show="selectedItems.length"
                 icon-md="material:delete"
                 icon-color="white"
                 @click="removeSelected" />
      </div>
    </f7-toolbar>

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found" />
    </f7-list>

    <!-- skeleton for not ready -->
    <f7-block class="block-narrow" v-show="!nowidgetEngine">
      <f7-col v-show="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list media-list class="col wide">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 20"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Title of the widget"
              subtitle="Tag1, Tag2, Tag3..." />
          </f7-list-group>
        </f7-list>
      </f7-col>
      <f7-col v-if="ready">
        <f7-block-title class="searchbar-hide-on-search">
          {{ blocks.length }} block libraries
        </f7-block-title>
        <f7-list
          v-show="blocks.length > 0"
          class="searchbar-found col blocks-list"
          ref="blocksList"
          media-list>
          <f7-list-item
            v-for="(b, index) in blocks"
            :key="index"
            media-item
            class="blockslist-item"
            :checkbox="showCheckboxes"
            :checked="isChecked(b.uid)"
            @click.ctrl="(e) => ctrlClick(e, b)"
            @click.meta="(e) => ctrlClick(e, b)"
            @click.exact="(e) => click(e, b)"
            link=""
            :title="b.uid">
            <div slot="subtitle">
              <f7-chip v-for="tag in b.tags"
                       :key="tag"
                       :text="tag"
                       media-bg-color="blue"
                       style="margin-right: 6px">
                <f7-icon slot="media"
                         ios="f7:tag_fill"
                         md="material:label"
                         aurora="f7:tag_fill" />
              </f7-chip>
            </div>
            <span slot="media" class="item-initial">{{ b.uid[0].toUpperCase() }}</span>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-fab v-show="ready && !showCheckboxes"
            position="right-bottom"
            slot="fixed"
            color="blue"
            href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      <f7-icon ios="f7:close" md="material:close" aurora="f7:close" />
    </f7-fab>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      ready: false,
      loading: false,
      nowidgetEngine: false,
      blocks: [],
      initSearchbar: false,
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
      this.$oh.api.get('/rest/ui/components/ui:blocks').then(data => {
        this.blocks = data.sort((a, b) => {
          return a.uid.localeCompare(b.uid)
        })
        this.loading = false
        this.ready = true
        setTimeout(() => {
          this.initSearchbar = true
          this.$nextTick(() => {
            if (this.$device.desktop && this.$refs.searchbar) {
              this.$refs.searchbar.f7Searchbar.$inputEl[0].focus()
            }
          })
        })
      })
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    click (event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.uid, item)
      } else {
        this.$f7router.navigate(item.uid, { animate: false })
      }
    },
    ctrlClick (event, item) {
      this.toggleItemCheck(event, item.uid, item)
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
    removeSelected () {
      const vm = this

      this.$f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected block libraries?`,
        'Remove block libraries',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      let dialog = this.$f7.dialog.progress('Deleting block libraries...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/ui/components/ui:blocks/' + i))
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: 'Block library removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
        this.$f7.emit('sidebarRefresh', null)
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while deleting: ' + err)
        this.$f7.emit('sidebarRefresh', null)
      })
    }
  }
}
</script>
