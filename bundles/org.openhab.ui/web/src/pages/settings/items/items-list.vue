<template>
  <f7-page>
    <f7-navbar title="Items" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
        :text="($theme.ios) ? ((showCheckboxes) ? 'Done' : 'Select') : ''"></f7-link>
      </f7-nav-right>
      <!-- <f7-nav-right>
        <f7-link
          class="searchbar-enable"
          data-searchbar=".searchbar-items"
          icon-ios="f7:search_strong"
          icon-md="material:search"
        ></f7-link>
      </f7-nav-right>
      <f7-searchbar
        v-if="initSearchbar"
        class="searchbar-items"
        :init="initSearchbar"
        expandable
        search-container=".contacts-list"
        search-in=".item-title"
        remove-diacritics
      ></f7-searchbar> -->
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          class="searchbar-items"
          :init="initSearchbar"
          search-container=".contacts-list"
          search-in=".item-title"
          remove-diacritics
          :disable-button="!$theme.aurora"
        ></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" v-if="showCheckboxes" bottom-ios>
      <f7-link icon-md="material:close" @click="showCheckboxes = false"></f7-link>
      <f7-link icon-md="material:delete"></f7-link>
    </f7-toolbar>

    <f7-list-index
      ref="listIndex"
      list-el=".items-list"
      :scroll-list="true"
      :label="true"
    ></f7-list-index>

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found"></f7-list-item>
    </f7-list>
    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-title>{{items.length}} items</f7-block-title>
      </f7-col>
      <f7-list v-if="loading" contacts-list class="col">
        <f7-list-group>
          <f7-list-item
            media-item
            v-for="n in 10"
            :key="n"
            :class="`skeleton-text skeleton-effect-blink`"
            title="Label of the item"
            subtitle="This contains the name of the item"
            after="The item type"
          >
          </f7-list-item>
        </f7-list-group>
      </f7-list>
      <f7-list v-else class="searchbar-found col items-list" contacts-list>
        <f7-list-group v-for="(itemsWithInitial, initial) in indexedItems" :key="initial">
          <f7-list-item v-if="itemsWithInitial.length" :title="initial" group-title></f7-list-item>
          <f7-list-item v-for="item in itemsWithInitial" :checkbox="showCheckboxes" :key="item.name"
              media-item
              :link="showCheckboxes ? null : item.name"
              :title="(item.label) ? item.label : item.name"
              :subtitle="(item.label) ? item.name : ''"
              :after="item.type"
          >
          </f7-list-item>
        </f7-list-group>
      </f7-list>
    </f7-block>
    <!-- <f7-block v-if="!items.length" class="service-config block-narrow">
      <f7-col>
        <f7-block strong>
          <p>No items.</p>
        </f7-block>
      </f7-col>
    </f7-block>-->
    <f7-fab position="right-bottom" slot="fixed" color="blue" href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus"></f7-icon>
      <f7-icon ios="f7:close" md="material:close" aurora="f7:close"></f7-icon>
    </f7-fab>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      loading: false,
      items: [], // [{ label: 'Staircase', name: 'Staircase'}],
      indexedItems: {},
      initSearchbar: false,
      vlData: {
        items: []
      },
      showCheckboxes: false
    }
  },
  mounted () {
    // this.$f7.preloader.show()
    this.loading = true
    this.$oh.api.get('/rest/items').then((data) => {
      this.items = data.sort((a, b) => {
        const labelA = a.label || a.name
        const labelB = b.label || b.name
        return labelA.localeCompare(labelB)
      })
      this.indexedItems = this.items.reduce((prev, item, i, items) => {
        const initial = (item.label) ? item.label.substring(0, 1).toUpperCase() : item.name.substring(0, 1).toUpperCase()
        if (!prev[initial]) {
          prev[initial] = []
        }
        prev[initial].push(item)

        return prev
      }, {})
      this.loading = false
      // this.$f7.preloader.hide()
      setTimeout(() => {
        this.initSearchbar = true
        this.$refs.listIndex.update()
      })
    })
  },
  methods: {
    searchAll (query, items) {
      const found = []
      for (let i = 0; i < items.length; i += 1) {
        var haystack = items[i].name
        if (items[i].label) haystack += ' ' + items[i].label
        if (haystack.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') {
          found.push(i)
        }
      }
      return found // return array with mathced indexes
    },
    renderExternal (vl, vlData) {
      this.vlData = vlData
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    }
  }
}
</script>

<style>
</style>
