<template>
  <div class="after-big-title">
    <f7-block v-if="loading" class="text-align-center">
      <f7-preloader />
      <div>Loading...</div>
    </f7-block>
    <f7-block v-else-if="!searchResults.items.length && !searchResults.things.length && !searchResults.rules.length && !searchResults.pages.length" class="text-align-center">
      <div>Nothing found</div>
    </f7-block>
    <!-- Items -->
    <f7-block class="no-margin no-padding" v-if="searchResults.items.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="square_on_circle" />Items ({{ searchResults.items.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="item in filteredSearchResults.items" :key="item.name"
                      :title="item.label || item.name" :footer="(item.label) ? item.name : ''" link="" no-chevron @click="(evt) => togglePin(evt, 'items', item, 'name')">
          <f7-link slot="after" color="gray" icon-f7="pencil" icon-size="18" tooltip="Details" :href="'/settings/items/' + item.name" :animate="false" />
          <f7-link slot="after" v-if="isPinned('items', item, 'name')" @click="$emit('unpin', 'items', item, 'name')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'items', item, 'name')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
        <f7-list-button v-if="!showingAll('items')" color="blue" @click="$set(expandedTypes, 'items', true)">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Things -->
    <f7-block class="no-margin no-padding" v-if="searchResults.things.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="lightbulb" />Things ({{ searchResults.things.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="thing in filteredSearchResults.things" :key="thing.UID"
                      :title="thing.label" :footer="thing.UID" link="" no-chevron @click="(evt) => togglePin(evt, 'things', thing, 'UID')">
          <f7-link slot="after" color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" :href="'/settings/things/' + thing.UID" :animate="false" />
          <f7-link slot="after" v-if="isPinned('things', thing, 'UID')" @click="$emit('unpin', 'things', thing, 'UID')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'things', thing, 'UID')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
        <f7-list-button v-if="!showingAll('things')" color="blue" @click="$set(expandedTypes, 'things', true)">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Rules -->
    <f7-block class="no-margin no-padding" v-if="filteredSearchResults.rules.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="wand_stars" />Rules ({{ filteredSearchResults.rules.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="rule in filteredSearchResults.rules" :key="rule.uid"
                      :title="rule.name" :footer="rule.uid" link="" no-chevron @click="(evt) => togglePin(evt, 'rules', rule, 'uid')">
          <f7-link slot="after" color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" :href="'/settings/' + (rule.tags.indexOf('Script') >= 0 ? 'scripts' : 'rules') + '/' + rule.uid" :animate="false" />
          <f7-link slot="after" v-if="isPinned('rules', rule, 'uid')" @click="$emit('unpin', 'rules', rule, 'uid')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'rules', rule, 'uid')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
        <f7-list-button v-if="!showingAll('rules')" color="blue" @click="$set(expandedTypes, 'rules', true)">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Scenes -->
    <f7-block class="no-margin no-padding" v-if="filteredSearchResults.scenes.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="film" />Scenes ({{ filteredSearchResults.scenes.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="rule in filteredSearchResults.scenes" :key="rule.uid"
                      :title="rule.name" :footer="rule.uid" link="" no-chevron @click="(evt) => togglePin(evt, 'rules', rule, 'uid')">
          <f7-link slot="after" color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" :href="'/settings/' + (rule.tags.indexOf('Script') >= 0 ? 'scripts' : 'rules') + '/' + rule.uid" :animate="false" />
          <f7-link slot="after" v-if="isPinned('scenes', rule, 'uid')" @click="$emit('unpin', 'scenes', rule, 'uid')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'scenes', rule, 'uid')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
        <f7-list-button v-if="!showingAll('rules')" color="blue" @click="$set(expandedTypes, 'rules', true)">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Scripts -->
    <f7-block class="no-margin no-padding" v-if="filteredSearchResults.scripts.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="doc_plaintext" />Scripts ({{ filteredSearchResults.scripts.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="rule in filteredSearchResults.scripts" :key="rule.uid"
                      :title="rule.name" :footer="rule.uid" link="" no-chevron @click="(evt) => togglePin(evt, 'rules', rule, 'uid')">
          <f7-link slot="after" color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" :href="'/settings/' + (rule.tags.indexOf('Script') >= 0 ? 'scripts' : 'rules') + '/' + rule.uid" :animate="false" />
          <f7-link slot="after" v-if="isPinned('scripts', rule, 'uid')" @click="$emit('unpin', 'scripts', rule, 'uid')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'scripts', rule, 'uid')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
        <f7-list-button v-if="!showingAll('rules')" color="blue" @click="$set(expandedTypes, 'rules', true)">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Pages -->
    <f7-block class="no-margin no-padding" v-if="searchResults.pages.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="tv" />Pages ({{ searchResults.pages.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="page in filteredSearchResults.pages" :key="page.uid"
                      :title="page.config.label" :footer="page.uid" link="" no-chevron @click="(evt) => togglePin(evt, 'pages', page, 'uid')">
          <f7-link slot="after" color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" :href="'/settings/pages/' + getPageType(page).type + '/' + page.uid" :animate="false" />
          <f7-link slot="after" v-if="isPinned('pages', page, 'uid')" @click="$emit('unpin', 'pages', page, 'uid')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'pages', page, 'uid')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
        <f7-list-button v-if="!showingAll('pages')" color="blue" @click="$set(expandedTypes, 'pages', true)">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
  </div>
</template>

<script>
export default {
  props: ['searchResults', 'pinnedObjects', 'cachedObjects', 'loading'],
  data () {
    return {
      typesIcons: {
        items: 'square_on_circle',
        things: 'lightbulb',
        rules: 'wand_stars',
        pages: 'tv'
      },
      expandedTypes: {},
      pageTypes: [
        { type: 'sitemap', label: 'Sitemap', componentType: 'Sitemap', icon: 'menu' },
        { type: 'layout', label: 'Layout', componentType: 'oh-layout-page', icon: 'rectangle_grid_2x2' },
        { type: 'home', label: 'Home', componentType: 'oh-home-page', icon: 'house' },
        { type: 'tabs', label: 'Tabbed', componentType: 'oh-tabs-page', icon: 'squares_below_rectangle' },
        { type: 'map', label: 'Map', componentType: 'oh-map-page', icon: 'map' },
        { type: 'plan', label: 'Floor plan', componentType: 'oh-plan-page', icon: 'square_stack_3d_up' },
        { type: 'chart', label: 'Chart', componentType: 'oh-chart-page', icon: 'graph_square' }
      ]
    }
  },
  computed: {
    filteredSearchResults () {
      const items = (this.expandedTypes.items) ? this.searchResults.items : (this.searchResults.items ? this.searchResults.items.slice(0, 5) : [])
      const things = (this.expandedTypes.things) ? this.searchResults.things : (this.searchResults.things ? this.searchResults.things.slice(0, 5) : [])
      const rules = (this.expandedTypes.rules) ? this.searchResults.rules : (this.searchResults.rules ? this.searchResults.rules.slice(0, 5) : [])
      const scenes = (this.expandedTypes.scenes) ? this.searchResults.scenes : (this.searchResults.scenes ? this.searchResults.scenes.slice(0, 5) : [])
      const scripts = (this.expandedTypes.scripts) ? this.searchResults.scripts : (this.searchResults.scripts ? this.searchResults.scripts.slice(0, 5) : [])
      const pages = (this.expandedTypes.pages) ? this.searchResults.pages : (this.searchResults.pages ? this.searchResults.pages.slice(0, 5) : [])
      return { items, things, rules, scenes, scripts, pages }
    }
  },
  watch: {
    searchResults () {
      this.$set(this, 'expandedTypes', {})
    }
  },
  methods: {
    isPinned (type, obj, keyName) {
      return this.pinnedObjects[type].findIndex((o) => o[keyName] === obj[keyName]) >= 0
    },
    showingAll (type) {
      return (this.expandedTypes[type] || this.searchResults[type].length <= 5)
    },
    getPageType (page) {
      return this.pageTypes.find(t => t.componentType === page.component)
    },
    togglePin (evt, type, obj, keyName) {
      evt.cancelBubble = true
      if (evt.target.tagName.toLowerCase() === 'i') return
      if (this.isPinned(type, obj, keyName)) {
        this.$emit('unpin', type, obj, keyName)
      } else {
        this.$emit('pin', type, obj, keyName)
      }
    }
  }
}
</script>
