<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar title="Pages" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <f7-link v-if="$store.state.developerDock && $f7.width >= 1280" icon-f7="question_circle_fill" @click="$f7.emit('toggleDeveloperDock')" />
        <f7-link v-else-if="$f7.width >= 1280" icon-f7="question_circle" @click="$f7.emit('selectDeveloperDock',{'dock':'help','helpTab':'current'})" />
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
                 :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-pages"
          :init="initSearchbar"
          search-container=".pages-list"
          search-item=".pagelist-item"
          search-in=".item-title, .item-subtitle, .item-header, .item-footer"
          :placeholder="searchPlaceholder"
          :disable-button="!$theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" :class="{ 'navbar': $theme.md }" v-if="showCheckboxes" bottom-ios bottom-aurora>
      <f7-link color="red" v-show="selectedItems.length" v-if="!$theme.md" class="delete" icon-ios="f7:trash" icon-aurora="f7:trash" @click="removeSelected">
        Remove {{ selectedItems.length }}
      </f7-link>
      <f7-link v-if="$theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div class="title" v-if="$theme.md">
        {{ selectedItems.length }} selected
      </div>
      <div class="right" v-if="$theme.md">
        <f7-link v-show="selectedItems.length" icon-md="material:delete" icon-color="white" @click="removeSelected" />
      </div>
    </f7-toolbar>

    <f7-list-index
      v-if="ready"
      ref="listIndex" :key="'pages-index'"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      list-el=".pages-list"
      :scroll-list="true"
      :label="true" />

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found" />
    </f7-list>

    <!-- skeleton for not ready -->
    <f7-block class="block-narrow">
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
              footer="Page UID">
              <f7-skeleton-block style="width: 32px; height: 32px; border-radius: 50%" slot="media" />
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-else>
        <f7-block-title class="searchbar-hide-on-search">
          {{ pages.length }} pages
        </f7-block-title>
        <div class="searchbar-found" v-show="!ready || pages.length > 0">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="switchGroupOrder('alphabetical')">
              Alphabetical
            </f7-button>
            <f7-button :active="groupBy === 'type'" @click="switchGroupOrder('type')">
              By type
            </f7-button>
          </f7-segmented>
        </div>

        <f7-list v-show="pages.length > 0"
                 class="searchbar-found col pages-list"
                 ref="pagesList"
                 :contacts-list="groupBy === 'alphabetical'" media-list>
          <f7-list-group v-for="(pagesWithInitial, initial) in indexedPages" :key="initial">
            <f7-list-item v-if="pagesWithInitial.length" :title="initial" group-title />
            <f7-list-item
              v-for="(page, index) in pagesWithInitial"
              :key="index"
              media-item
              class="pagelist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(((page.component === 'Sitemap') ? 'system:sitemap:' : 'ui:page:') + page.uid)"
              :disabled="showCheckboxes && page.uid === 'overview'"
              @click.ctrl="(e) => ctrlClick(e, page)"
              @click.meta="(e) => ctrlClick(e, page)"
              @click.exact="(e) => click(e, page)"
              link=""
              :title="page.config.label"
              :subtitle="getPageType(page).label"
              :footer="page.uid"
              :badge="page.config.order">
              <div slot="subtitle">
                <f7-chip v-for="tag in page.tags" :key="tag" :text="tag" media-bg-color="blue" style="margin-right: 6px">
                  <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                </f7-chip>
                <f7-chip v-for="userrole in page.config.visibleTo || []" :key="userrole" :text="userrole" media-bg-color="green" style="margin-right: 6px">
                  <f7-icon slot="media" f7="person_crop_circle_fill_badge_checkmark" />
                </f7-chip>
              </div>
              <!-- <span slot="media" class="item-initial">{{page.config.label[0].toUpperCase()}}</span> -->
              <oh-icon slot="media" :color="page.config.sidebar || page.uid === 'overview' ? '' : 'gray'" :icon="getPageIcon(page)" :height="32" :width="32" />
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>

    <!-- empty-state-placeholder not needed because the overview page cannot be deleted, so there is at least 1 page -->

    <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" slot="fixed" color="blue">
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
    onPageAfterOut () {

    },
    load () {
      if (this.loading) return
      this.loading = true
      this.$set(this, 'selectedItems', [])
      this.showCheckboxes = false
      let promises = [
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
        setTimeout(() => {
          this.initSearchbar = true
          this.$refs.listIndex.update()
          this.$nextTick(() => {
            if (this.$device.desktop && this.$refs.searchbar) {
              this.$refs.searchbar.f7Searchbar.$inputEl[0].focus()
            }
          })
        })
      })
    },
    switchGroupOrder (groupBy) {
      this.groupBy = groupBy
      const searchbar = this.$refs.searchbar.$el.f7Searchbar
      const filterQuery = searchbar.query
      this.$nextTick(() => {
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
        this.$f7router.navigate(this.getPageType(item).type + '/' + item.uid)
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
      return this.pageTypes.find(t => t.componentType === page.component)
    },
    getPageIcon (page) {
      if (page.uid === 'overview') return 'f7:house'
      if (page.config && page.config.icon) return page.config.icon
      const pageType = this.pageTypes.find(t => t.componentType === page.component)
      return (pageType) ? pageType.icon : 'f7:tv'
    },
    removeSelected () {
      const vm = this

      if (this.selectedItems.indexOf('ui:page:overview') >= 0) {
        this.$f7.dialog.alert('The overview page cannot be deleted!')
        return
      }

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
