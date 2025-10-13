<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar title="Transformations">
      <f7-nav-left>
        <f7-link icon-f7="chevron_left" href="/settings/">
          Settings
        </f7-link>
      </f7-nav-left>
      <f7-nav-right>
        <developer-dock-icon />
        <f7-link icon-md="material:done_all"
                 @click="toggleCheck()"
                 :text="(!theme.md) ? (showCheckboxes ? 'Done' : 'Select') : ''" />
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
               v-show="selectedTransformations.length"
               class="delete"
               icon-ios="f7:trash"
               icon-aurora="f7:trash"
               @click="removeSelected">
        Remove {{ selectedTransformations.length }}
      </f7-link>
      <f7-link v-if="theme.md"
               icon-md="material:close"
               icon-color="white"
               @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">
        {{ selectedTransformations.length }} selected
      </div>
      <div v-if="theme.md" class="right">
        <f7-link v-show="selectedTransformations.length"
                 icon-md="material:delete"
                 icon-color="white"
                 @click="removeSelected" />
      </div>
    </f7-toolbar>

    <f7-list-index
      v-if="$refs.transformationsList"
      ref="listIndex"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      listEl=".transformations-list"
      :scroll-list="true"
      :label="true" />

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
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
        <f7-block-title class="searchbar-hide-on-search">
          <span>{{ transformations.length }} transformations</span>
        </f7-block-title>
        <div class="searchbar-found padding-left padding-right">
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
              :checkbox="showCheckboxes && transformation.editable"
              :checked="isChecked(transformation.uid) ? true : null"
              @click.ctrl="(e) => ctrlClick(e, transformation)"
              @click.meta="(e) => ctrlClick(e, transformation)"
              @click.exact="(e) => click(e, transformation)"
              link=""
              :title="transformation.label"
              :subtitle="transformation.type">
              <template #after-title>
                <f7-icon v-if="!transformation.editable"
                         f7="lock_fill"
                         size="1rem"
                         color="gray" />
              </template>
              <template #footer>
                {{ transformation.uid }}
                <clipboard-icon :value="transformation.uid" tooltip="Copy UID" />
              </template>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !transformations.length" class="block-narrow">
      <empty-state-placeholder icon="arrow_2_squarepath" title="transformations.title" text="transformations.text" />
      <f7-row v-if="f7.width < 1280" class="display-flex justify-content-center">
        <f7-button large
                   fill
                   color="blue"
                   external
                   :href="`${runtimeStore.websiteUrl}/link/transformations`"
                   target="_blank"
                   :text="$t('home.overview.button.documentation')" />
      </f7-row>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="ready && !showCheckboxes"
              position="right-bottom"
              color="blue"
              href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<style lang="stylus">
.searchbar-found
  @media (min-width 960px)
    padding-left 0 !important
    padding-right 0 !important
</style>

<script>
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import ClipboardIcon from '@/components/util/clipboard-icon.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

export default {
  props: {
    f7router: Object
  },
  components: {
    EmptyStatePlaceholder,
    ClipboardIcon
  },
  setup () {
    return { f7, theme }
  },
  data () {
    return {
      ready: false,
      loading: false,
      transformations: [],
      initSearchbar: false,
      selectedTransformations: [],
      groupBy: 'alphabetical',
      showCheckboxes: false,
      searchQuery: ''    // TODO-V3.1 - this was never implemented in exisitng UI
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
        const typeGroups = this.transformations.reduce((prev, transformation, i, transformations) => {
          const type = transformation.type.toUpperCase()
          if (!prev[type]) {
            prev[type] = []
          }
          prev[type].push(transformation)

          return prev
        }, {})
        return Object.keys(typeGroups).sort((a, b) => a.localeCompare(b)).reduce((objEntries, key) => {
          objEntries[key] = typeGroups[key]
          return objEntries
        }, {})
      }
    },
    ...mapStores(useRuntimeStore)
  },
  methods: {
    onPageAfterIn () {
      this.load()
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
          if (this.$device.desktop && this.$refs.searchbar) this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
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
    isChecked (transformation) {
      return this.selectedTransformations.indexOf(transformation) >= 0
    },
    click (event, transformation) {
      if (this.showCheckboxes) {
        this.toggleTransformationCheck(event, transformation.uid, transformation)
      } else {
        this.f7router.navigate(transformation.uid)
      }
    },
    ctrlClick (event, transformation) {
      this.toggleTransformationCheck(event, transformation.uid, transformation)
      if (!this.selectedTransformations.length) this.showCheckboxes = false
    },
    toggleTransformationCheck (event, transformationUid, transformation) {
      if (!transformation.editable) return
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(transformationUid)) {
        this.selectedTransformations.splice(this.selectedTransformations.indexOf(transformationUid), 1)
      } else {
        this.selectedTransformations.push(transformationUid)
      }
    },
    removeSelected () {
      const vm = this

      f7.dialog.confirm(
        `Remove ${this.selectedTransformations.length} selected transformations?`,
        'Remove Transformations',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      let dialog = f7.dialog.progress('Deleting Transformations...')

      const promises = this.selectedTransformations.map((p) => {
        return this.$oh.api.delete('/rest/transformations/' + p)
      })
      Promise.all(promises).then((data) => {
        f7.toast.create({
          text: 'Transformations removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedTransformations = []
        dialog.close()
        this.load()
        f7.emit('sidebarRefresh', null) // for what?
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        f7.dialog.alert('An error occurred while deleting: ' + err)
        f7.emit('sidebarRefresh', null) // for what?
      })
    }
  }
}
</script>
