<template>
  <ul class="sitemap-picker-container">
    <f7-list-item
      v-if="ready"
      :title="title || 'Sitemap'"
      smart-select
      :smart-select-params="smartSelectParams"
      ref="smartSelect"
      :no-chevron="disabled"
      :disabled="disabled">
      <select :name="name" @change="select" :required="required">
        <option value="" />
        <option v-for="sitemap in sitemaps" :value="sitemap.name" :key="sitemap.name" :selected="value === sitemap.name ? true : null">
          {{ sitemap.label ? sitemap.label + ' (' + sitemap.name + ')' : sitemap.name }}
        </option>
      </select>
    </f7-list-item>
    <!-- for placeholder purposes before sitemaps are loaded -->
    <f7-list-item v-show="!ready" link :title="title" />
  </ul>
</template>

<style lang="stylus">
.sitemap-picker-container
  .item-inner:after
    display none
</style>

<script>
import { f7 } from 'framework7-vue'
import { nextTick } from 'vue'

import * as api from '@/api'

export default {
  props: {
    title: String,
    name: String,
    value: String,
    required: Boolean,
    filterType: Array,
    openOnReady: Boolean,
    disabled: Boolean
  },
  emits: ['sitemapPicked', 'input'],
  data() {
    return {
      ready: false,
      sitemaps: [],
      smartSelectParams: {
        view: f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: this.$t('dialogs.search.sitemaps')
      }
    }
  },
  created() {
    this.smartSelectParams.closeOnSelect = true
    api
      .getSitemaps()
      .then((data) => {
        this.sitemaps = data
          .map((sitemap) => {
            return {
              name: sitemap.name,
              label: sitemap.label
            }
          })
          .sort((a, b) => {
            const labelA = a.label || a.name
            const labelB = b.label || b.name
            return labelA.localeCompare(labelB)
          })
        if (this.filterType) {
          this.sitemaps = this.sitemaps.filter((i) => this.filterType.indexOf(i.type) >= 0)
          if (this.sitemaps.length < 5) {
            this.smartSelectParams.openIn = 'sheet'
            this.smartSelectParams.searchbar = false
          }
        }
        this.ready = true
        if (this.openOnReady) {
          nextTick(() => {
            this.$refs.smartSelect.$el.children[0].f7SmartSelect.open()
          })
        }
      })
      .catch((err) => {
        console.error(err)
        showToast('An error occurred while loading sitemaps: ' + (err?.message || String(err)))
      })
  },
  methods: {
    open() {
      this.$refs.smartSelect.$el.children[0].f7SmartSelect.open()
    },
    select(e) {
      f7.input.validateInputs(this.$refs.smartSelect.$el)
      this.$emit('input', e.target.value)
      f7.emit('sitemapPicked', e.target.value)
    }
  }
}
</script>
