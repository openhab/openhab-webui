<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar title="Transformations" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
                 :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-transformations"
          :init="initSearchbar"
          search-container=".transformations-list"
          search-item=".transformationlist-item"
          search-in=".item-title, .item-subtitle, .item-footer"
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
      ref="listIndex"
      v-if="$refs.transformationsList"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      listEl=".transformations-list"
      :scroll-list="true"
      :label="true" />

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found" />
    </f7-list>

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col transformations-list">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 20"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the transformation"
              subtitle="Transformation type"
              footer="Transformation UID" />
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-else>
        <f7-block-title class="searchbar-hide-on-search">
          {{ transformations.length }} transformations
        </f7-block-title>
        <div class="padding-left padding-right searchbar-found" v-show="transformations.length > 0">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="switchGroupOrder('alphabetical')">
              Alphabetical
            </f7-button>
            <f7-button :active="groupBy === 'type'" @click="switchGroupOrder('type')">
              By type
            </f7-button>
          </f7-segmented>
        </div>

        <f7-list
          v-show="transformations.length > 0"
          class="searchbar-found col transformations-list"
          ref="transformationsList"
          :contacts-list="groupBy === 'alphabetical'">
          <f7-list-group v-for="(transformationsWithInitial, initial) in indexedTransformations" :key="initial">
            <f7-list-item v-if="transformationsWithInitial.length" :title="initial" group-title />
            <f7-list-item
              v-for="transformation in transformationsWithInitial"
              :key="transformation.uid"
              media-item
              class="transformationlist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(transformation.uid)"
              @click.ctrl="(e) => ctrlClick(e, transformation)"
              @click.meta="(e) => ctrlClick(e, transformation)"
              @click.exact="(e) => click(e, transformation)"
              link=""
              :title="transformation.label"
              :subtitle="transformation.type"
              :footer="transformation.uid">
              <f7-icon v-if="!transformation.editable" slot="after-title" f7="lock_fill" size="1rem" color="gray" />
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block v-if="ready && !transformations.length" class="service-config block-narrow">
      <empty-state-placeholder icon="arrow_2_squarepath" title="transformations.title" text="transformations.text" />
    </f7-block>
    <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" slot="fixed" color="blue" href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
    </f7-fab>
  </f7-page>
</template>

<script>

export default {
  components: {
    'empty-state-placeholder': () => import('@/components/empty-state-placeholder.vue')
  },
  data () {
    return {
      ready: false,
      loading: false,
      transformations: [],
      initSearchbar: false,
      selectedItems: [],
      groupBy: 'alphabetical',
      showCheckboxes: false
    }
  },
  computed: {
    indexedTransformations () {
      if (this.groupBy === 'alphabetical') {
        return this.transformations.reduce((prev, transformation, i, transformations) => {
          const label = transformation.label || transformation.uid
          const initial = label.substring(0, 1).toUpperCase()
          if (!prev[initial]) {
            prev[initial] = []
          }
          prev[initial].push(transformation)

          return prev
        }, {})
      } else {
        return this.transformations.reduce((prev, transformation, i, transformations) => {
          const type = transformation.type
          if (!prev[type]) {
            prev[type] = []
          }
          prev[type].push(transformation)

          return prev
        }, {})
      }
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
      this.loading = true
      this.$oh.api.get('/rest/transformations').then((data) => {
        this.transformations = data.sort((a, b) => (a.label || a.uid).localeCompare(b.label || a.uid))
        this.loading = false
        this.ready = true
        setTimeout(() => {
          this.initSearchbar = true
          if (this.$refs.listIndex) this.$refs.listIndex.update()
          if (this.$device.desktop && this.$refs.searchbar) this.$refs.searchbar.f7Searchbar.$inputEl[0].focus()
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
        this.$f7router.navigate(item.uid)
      }
    },
    ctrlClick (event, item) {
      this.toggleItemCheck(event, item.uid, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    toggleItemCheck (event, itemName, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(itemName)) {
        this.selectedItems.splice(this.selectedItems.indexOf(itemName), 1)
      } else {
        this.selectedItems.push(itemName)
      }
    },
    removeSelected () {
      const vm = this

      this.$f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected transformations?`,
        'Remove Transformations',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      let dialog = this.$f7.dialog.progress('Deleting Transformations...')

      const promises = this.selectedItems.map((p) => {
        return this.$oh.api.delete('/rest/transformations/' + p)
      })
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: 'Transformations removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
        this.$f7.emit('sidebarRefresh', null) // for what?
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while deleting: ' + err)
        this.$f7.emit('sidebarRefresh', null) // for what?
      })
    }
  }
}
</script>
