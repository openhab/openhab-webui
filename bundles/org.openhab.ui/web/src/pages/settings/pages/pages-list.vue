<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <f7-nav-left>
        <f7-link icon-f7="chevron_left" href="/settings/">
          Settings
        </f7-link>
      </f7-nav-left>
      <f7-nav-title>
        Pages
      </f7-nav-title>
      <f7-nav-right>
        <developer-dock-icon />
        <f7-link icon-md="material:done_all"
                 @click="toggleCheck()"
                 :text="(!theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-pages"
          search-container=".pages-list"
          search-item=".pagelist-item"
          search-in=".item-title, .item-subtitle, .item-header, .item-footer"
          :placeholder="searchPlaceholder"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="showCheckboxes"
                class="contextual-toolbar"
                :class="{ navbar: theme.md }"
                bottom-ios
                bottom-aurora>
      <f7-link v-if="!theme.md"
               color="red"
               v-show="selectedItems.length"
               class="delete"
               icon-ios="f7:trash"
               icon-aurora="f7:trash"
               @click="removeSelected">
        Remove {{ selectedItems.length }}
      </f7-link>
      <f7-link v-if="theme.md"
               icon-md="material:close"
               icon-color="white"
               @click="showCheckboxes = false" />
      <div class="title" v-if="theme.md">
        {{ selectedItems.length }} selected
      </div>
      <div class="right" v-if="theme.md">
        <f7-link v-show="selectedItems.length"
                 icon-md="material:delete"
                 icon-color="white"
                 @click="removeSelected" />
      </div>
    </f7-toolbar>

    <f7-list-index
      v-if="ready"
      ref="listIndex"
      :key="'pages-index'"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      list-el=".pages-list"
      :scroll-list="true"
      :label="true" />

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list v-if="!ready" contacts-list class="col wide pages-list">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 20"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Title of the page"
              subtitle="Page type"
              after="The item state"
              footer="Page ID">
              <template #media>
                <f7-skeleton-block style="width: 32px; height: 32px; border-radius: 50%" />
              </template>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-show="ready">
        <f7-block-title class="searchbar-hide-on-search">
          {{ pages.length }} pages
        </f7-block-title>
        <div class="padding-left padding-right" v-show="!ready || pages.length > 0">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="switchGroupOrder('alphabetical')">
              Alphabetical
            </f7-button>
            <f7-button :active="groupBy === 'type'" @click="switchGroupOrder('type')">
              By type
            </f7-button>
          </f7-segmented>
        </div>

        <f7-list class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <f7-list v-show="pages.length > 0"
                 class="col pages-list"
                 ref="pagesList"
                 :contacts-list="groupBy === 'alphabetical'"
                 media-list>
          <f7-list-group v-for="(pagesWithInitial, initial) in indexedPages" :key="initial">
            <f7-list-item v-if="pagesWithInitial.length" :title="initial" group-title />
            <f7-list-item
              v-for="(page, index) in pagesWithInitial"
              :key="index"
              media-item
              class="pagelist-item"
              :checkbox="showCheckboxes && page.uid !== 'overview'"
              :checked="isChecked(((page.component === 'Sitemap') ? 'system:sitemap:' : 'ui:page:') + page.uid)"
              :disabled="showCheckboxes && page.uid === 'overview' ? true : null"
              @click.ctrl="(e) => ctrlClick(e, page)"
              @click.meta="(e) => ctrlClick(e, page)"
              @click.exact="(e) => click(e, page)"
              link=""
              :title="page.config.label"
              :subtitle="getPageType(page).label"
              :footer="page.uid"
              :badge="page.config.order">
              <template #subtitle>
                <div>
                  <f7-chip v-for="tag in page.tags"
                           :key="tag"
                           :text="tag"
                           media-bg-color="blue"
                           style="margin-right: 6px">
                    <template #media>
                      <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                    </template>
                  </f7-chip>
                  <f7-chip v-for="userrole in page.config.visibleTo || []"
                           :key="userrole"
                           :text="userrole"
                           media-bg-color="green"
                           style="margin-right: 6px">
                    <template #media>
                      <f7-icon f7="person_crop_circle_fill_badge_checkmark" />
                    </template>
                  </f7-chip>
                </div>
              </template>
              <!-- <span class="item-initial">{{page.config.label[0].toUpperCase()}}</span> -->
              <template #media>
                <oh-icon :color="page.config.sidebar || page.uid === 'overview' ? '' : 'gray'"
                         :icon="getPageIcon(page)"
                         :height="32"
                         :width="32" />
              </template>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>

    <!-- empty-state-placeholder not needed because the overview page cannot be deleted, so there is at least 1 page -->

    <template #fixed>
      <f7-fab v-show="ready && !showCheckboxes"
              position="right-bottom"
              color="blue">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply" />
        <f7-fab-buttons position="top">
          <f7-fab-button fab-close label="Create sitemap" href="sitemap/add">
            <f7-icon f7="menu" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create layout" href="layout/add">
            <f7-icon f7="rectangle_grid_2x2" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create tabbed page" href="tabs/add">
            <f7-icon f7="squares_below_rectangle" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create map view" href="map/add">
            <f7-icon f7="map" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create floor plan" href="plan/add">
            <f7-icon f7="square_stack_3d_up" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create chart" href="chart/add">
            <f7-icon f7="graph_square" />
          </f7-fab-button>
        </f7-fab-buttons>
      </f7-fab>
    </template>
  </f7-page>
</template>

<script>
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'

import { useLastSearchQueryStore } from '@/js/stores/useLastSearchQueryStore'

export default {
  props: {
    f7router: Object
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      pages: [],
      selectedItems: [],
      groupBy: 'alphabetical',
      showCheckboxes: false,
      pageTypes: [
        { type: 'sitemap', label: 'Sitemap', componentType: 'Sitemap', icon: 'f7:menu' },
        { type: 'layout', label: 'Layout', componentType: 'oh-layout-page', icon: 'f7:rectangle_grid_2x2' },
        { type: 'home', label: 'Home', componentType: 'oh-home-page', icon: 'f7:house' },
        { type: 'tabs', label: 'Tabbed', componentType: 'oh-tabs-page', icon: 'f7:squares_below_rectangle' },
        { type: 'map', label: 'Map', componentType: 'oh-map-page', icon: 'f7:map' },
        { type: 'plan', label: 'Floor plan', componentType: 'oh-plan-page', icon: 'f7:square_stack_3d_up' },
        { type: 'chart', label: 'Chart', componentType: 'oh-chart-page', icon: 'f7:graph_square' }
      ]
    }
  },
  computed: {
    indexedPages () {
      if (this.groupBy === 'alphabetical') {
        return this.pages.reduce((prev, page, i, pages) => {
          const label = page.config.label || page.uid
          const initial = label.substring(0, 1).toUpperCase()
          if (!prev[initial]) {
            prev[initial] = []
          }
          prev[initial].push(page)

          return prev
        }, {})
      } else {
        const typeGroups = this.pages.reduce((prev, page, i, things) => {
          const type = this.getPageType(page).label
          if (!prev[type]) {
            prev[type] = []
          }
          prev[type].push(page)

          return prev
        }, {})
        return Object.keys(typeGroups).sort((a, b) => a.localeCompare(b)).reduce((objEntries, key) => {
          objEntries[key] = typeGroups[key]
          return objEntries
        }, {})
      }
    },
    searchPlaceholder () {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    onPageBeforeOut () {
      useLastSearchQueryStore().lastPagesSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.initSearchbar)
        useLastSearchQueryStore().lastPagesSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
      this.initSearchbar = false

      this.selectedItems = []
      this.showCheckboxes = false
      let promises = [
        this.$oh.api.get('/rest/ui/components/system:sitemap'),
        this.$oh.api.get('/rest/ui/components/ui:page')
      ]
      Promise.all(promises).then((data) => {
        const pagesAndSitemaps = data[0].concat(data[1])
        this.pages = pagesAndSitemaps.sort((a, b) => {
          return a.config.label.localeCompare(b.config.label)
        })
        this.initSearchbar = true

        this.loading = false
        this.ready = true

        nextTick(() => {
          if (this.$refs.listIndex) this.$refs.listIndex.update()
          if (this.$device.desktop && this.$refs.searchbar) {
            this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
          }
          this.$refs.searchbar?.$el.f7Searchbar.search(useLastSearchQueryStore().lastPagesSearchQuery || '')
        })
      })
    },
    switchGroupOrder (groupBy) {
      this.groupBy = groupBy
      const searchbar = this.$refs.searchbar.$el.f7Searchbar
      const filterQuery = searchbar.query
      nextTick(() => {
        if (filterQuery) {
          searchbar.clear()
          searchbar.search(filterQuery)
        }
        if (groupBy === 'alphabetical') this.$refs.listIndex.update()
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
        this.f7router.navigate(this.getPageType(item).type + '/' + item.uid)
      }
    },
    ctrlClick (event, item) {
      this.toggleItemCheck(event, item.uid, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    toggleItemCheck (event, itemName, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      itemName = (item.component === 'Sitemap') ? 'system:sitemap:' + itemName : 'ui:page:' + itemName
      if (this.isChecked(itemName)) {
        this.selectedItems.splice(this.selectedItems.indexOf(itemName), 1)
      } else {
        this.selectedItems.push(itemName)
      }
    },
    getPageType (page) {
      return this.pageTypes.find((t) => t.componentType === page.component)
    },
    getPageIcon (page) {
      if (page.uid === 'overview') return 'f7:house'
      if (page.config && page.config.icon) return page.config.icon
      const pageType = this.pageTypes.find((t) => t.componentType === page.component)
      return pageType ? pageType.icon : 'f7:tv'
    },
    removeSelected () {
      const vm = this

      if (this.selectedItems.indexOf('ui:page:overview') >= 0) {
        f7.dialog.alert('The overview page cannot be deleted!')
        return
      }

      f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected pages?`,
        'Remove Pages',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      let dialog = f7.dialog.progress('Deleting Pages...')

      const promises = this.selectedItems.map((p) => {
        if (p.startsWith('system:sitemap')) {
          return this.$oh.api.delete('/rest/ui/components/system:sitemap/' + p.replace('system:sitemap:', ''))
        } else {
          return this.$oh.api.delete('/rest/ui/components/ui:page/' + p.replace('ui:page:', ''))
        }
      })
      Promise.all(promises).then((data) => {
        f7.toast.create({
          text: 'Pages removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
        f7.emit('sidebarRefresh', null)
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        f7.dialog.alert('An error occurred while deleting: ' + err)
        f7.emit('sidebarRefresh', null)
      })
    }
  },
  asyncComputed: {
    iconUrl () {
      return (icon) => this.$oh.media.getIcon(icon)
    }
  }
}
</script>
