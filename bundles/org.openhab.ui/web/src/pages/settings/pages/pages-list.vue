<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar title="Pages" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
        :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''"></f7-link>
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          class="searchbar-pages"
          :init="initSearchbar"
          search-container=".pages-list"
          search-item=".pagelist-item"
          search-in=".item-title, .item-subtitle, .item-header, .item-footer"
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
        <f7-link icon-md="material:more_vert" icon-color="white" @click="removeSelected"></f7-link>
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
              title="Title of the page"
              subtitle="Type of the page"
              after="status badge"
            >
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
      <f7-col v-if="ready">
        <f7-block-title class="searchbar-hide-on-search">{{pages.length}} pages</f7-block-title>
        <f7-list
          v-show="pages.length > 0"
          class="searchbar-found col pages-list"
          ref="pagesList"
          media-list>
          <f7-list-item
            v-for="(page, index) in pages"
            :key="index"
            media-item
            class="pagelist-item"
            :checkbox="showCheckboxes"
            :checked="isChecked(page.uid)"
            @change="(e) => toggleItemCheck(e, page.uid, page)"
            :link="showCheckboxes ? null : getPageType(page).type + '/' + page.uid"
            :title="page.config.label"
            :subtitle="getPageType(page).label"
            :footer="page.uid"
          >
            <div slot="subtitle">
              <f7-chip v-for="tag in page.tags" :key="tag" :text="tag" media-bg-color="blue" style="margin-right: 6px">
                <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" ></f7-icon>
              </f7-chip>
            </div>
            <!-- <span slot="media" class="item-initial">{{page.config.label[0].toUpperCase()}}</span> -->
            <f7-icon slot="media" color="gray" :f7="getPageIcon(page)" :size="32"></f7-icon>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block v-if="ready && !pages.length" class="service-config block-narrow">
      <empty-state-placeholder icon="tv" title="pages.title" text="pages.text" />
    </f7-block>
    <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" slot="fixed" color="blue">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus"></f7-icon>
      <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply"></f7-icon>
      <f7-fab-buttons position="top">
        <f7-fab-button fab-close label="Create sitemap" href="sitemap/add"><f7-icon f7="menu"></f7-icon></f7-fab-button>
        <f7-fab-button fab-close label="Create layout" href="layout/add"><f7-icon f7="rectangle_grid_2x2"></f7-icon></f7-fab-button>
        <f7-fab-button fab-close label="Create tabbed page" href="tabs/add"><f7-icon f7="squares_below_rectangle"></f7-icon></f7-fab-button>
        <f7-fab-button fab-close label="Create map view" href="map/add"><f7-icon f7="map"></f7-icon></f7-fab-button>
        <f7-fab-button fab-close label="Create floor plan" href="plan/add"><f7-icon f7="square_stack_3d_up"></f7-icon></f7-fab-button>
        <!-- <f7-fab-button fab-close label="Create chart" href="add"><f7-icon f7="graph_square"></f7-icon></f7-fab-button> -->
      </f7-fab-buttons>
    </f7-fab>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      ready: false,
      loading: false,
      pages: [],
      initSearchbar: false,
      selectedItems: [],
      showCheckboxes: false,
      pageTypes: [
        { type: 'sitemap', label: 'Sitemap', componentType: 'Sitemap', icon: 'menu' },
        { type: 'layout', label: 'Layout', componentType: 'oh-layout-page', icon: 'rectangle_grid_2x2' },
        { type: 'tabs', label: 'Tabbed', componentType: 'oh-tabs-page', icon: 'squares_below_rectangle' },
        { type: 'map', label: 'Map', componentType: 'oh-map-page', icon: 'map' },
        { type: 'plan', label: 'Floor plan', componentType: 'oh-plan-page', icon: 'square_stack_3d_up' }
      ]
    }
  },
  created () {

  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    onPageAfterOut () {

    },
    load () {
      if (this.loading) return
      this.loading = true
      var promises = [
        this.$oh.api.get('/rest/ui/components/system:sitemap'),
        this.$oh.api.get('/rest/ui/components/ui:page')
      ]
      Promise.all(promises).then(data => {
        const pagesAndSitemaps = data[0].concat(data[1])
        this.pages = pagesAndSitemaps.sort((a, b) => {
          return a.config.label.localeCompare(b.config.label)
        })
        this.loading = false
        this.ready = true
        setTimeout(() => { this.initSearchbar = true })
      })
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    toggleItemCheck (event, itemName, item) {
      console.log('toggle check')
      itemName = (item.component === 'Sitemap') ? 'system:sitemap:' + itemName : 'ui:page:' + itemName
      if (this.isChecked(itemName)) {
        this.selectedItems.splice(this.selectedItems.indexOf(itemName), 1)
      } else {
        this.selectedItems.push(itemName)
      }
    },
    getPageType (page) {
      return this.pageTypes.find(t => t.componentType === page.component)
    },
    getPageIcon (page) {
      const pageType = this.pageTypes.find(t => t.componentType === page.component)
      return (pageType) ? pageType.icon : 'tv'
    },
    removeSelected () {
      const vm = this

      this.$f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected pages?`,
        'Remove Pages',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      let dialog = this.$f7.dialog.progress('Deleting Pages...')

      const promises = this.selectedItems.map((p) => {
        if (p.startsWith('system:sitemap')) {
          return this.$oh.api.delete('/rest/ui/components/system:sitemap/' + p.replace('system:sitemap:', ''))
        } else {
          return this.$oh.api.delete('/rest/ui/components/ui:page/' + p.replace('ui:page:', ''))
        }
      })
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: 'Pages removed',
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
  },
  asyncComputed: {
    iconUrl () {
      return icon => this.$oh.media.getIcon(icon)
    }
  }
}
</script>
