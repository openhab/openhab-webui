<template>
  <div>
    <f7-block v-if="loading" class="text-align-center">
      <f7-preloader />
      <div>Loading...</div>
    </f7-block>
    <f7-block v-else-if="
                !searchResults.items.length &&
                  !searchResults.things.length &&
                  !searchResults.rules.length &&
                  !searchResults.pages.length &&
                  !searchResults.scenes.length &&
                  !searchResults.scripts.length"
              class="text-align-center">
      <div>Nothing found</div>
    </f7-block>
    <!-- Items -->
    <f7-block class="no-margin no-padding" v-if="searchResults.items.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="square_on_circle" />Items ({{ searchResults.items.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item
                      v-for="item in filteredSearchResults.items"
                      :key="item.name"
                      :title="item.label || item.name"
                      :footer="(item.label) ? item.name : ''"
                      link=""
                      no-chevron
                      @click="evt => togglePin(evt, 'items', item, 'name')">
          <template #after>
            <f7-link color="gray">
              <clipboard-icon :value="item.name" tooltip="Copy Item name" />
            </f7-link>
            <f7-link color="gray"
                     icon-f7="pencil"
                     icon-size="18"
                     tooltip="Details"
                     :href="'/settings/items/' + item.name"
                     :animate="false" />
            <f7-link v-if="isPinned('items', item, 'name')"
                     @click="$emit('unpin', 'items', item, 'name')"
                     color="red"
                     icon-f7="pin_slash_fill"
                     icon-size="18"
                     tooltip="Unpin" />
            <f7-link v-else
                     @click="$emit('pin', 'items', item, 'name')"
                     color="blue"
                     icon-f7="unpin"
                     icon-size="18"
                     tooltip="Pin" />
          </template>
        </f7-list-item>
        <f7-list-button v-if="!showingAll('items')"
                        color="blue"
                        @click="expandedTypes.items = true">
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
        <f7-list-item v-for="thing in filteredSearchResults.things"
                      media-item
                      :key="thing.UID"
                      :title="thing.label"
                      :footer="thing.UID"
                      link=""
                      no-chevron
                      @click="(evt) => togglePin(evt, 'things', thing, 'UID')">
          <template #after>
            <f7-link color="gray">
              <clipboard-icon :value="thing.UID" tooltip="Copy Thing UID" />
            </f7-link>
            <f7-link color="gray"
                     icon-f7="pencil"
                     icon-size="18"
                     tooltip="Edit"
                     :href="'/settings/things/' + thing.UID"
                     :animate="false" />
            <f7-link v-if="isPinned('things', thing, 'UID')"
                     @click="$emit('unpin', 'things', thing, 'UID')"
                     color="red"
                     icon-f7="pin_slash_fill"
                     icon-size="18"
                     tooltip="Unpin" />
            <f7-link v-else
                     @click="$emit('pin', 'things', thing, 'UID')"
                     color="blue"
                     icon-f7="unpin"
                     icon-size="18"
                     tooltip="Pin" />
          </template>
        </f7-list-item>
        <f7-list-button v-if="!showingAll('things')"
                        color="blue"
                        @click="expandedTypes.things = true">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Rules -->
    <f7-block class="no-margin no-padding" v-if="searchResults.rules.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="wand_stars" />Rules ({{ searchResults.rules.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item v-for="rule in filteredSearchResults.rules"
                      media-item
                      :key="rule.uid"
                      :title="rule.name"
                      :footer="rule.uid"
                      link=""
                      no-chevron
                      @click="(evt) => togglePin(evt, 'rules', rule, 'uid')">
          <template #after>
            <f7-link color="gray">
              <clipboard-icon :value="rule.uid" tooltip="Copy Rule UID" />
            </f7-link>
            <f7-link color="gray"
                     icon-f7="pencil"
                     icon-size="18"
                     tooltip="Edit"
                     :href="'/settings/' + (rule.tags.indexOf('Script') >= 0 ? 'scripts' : 'rules') + '/' + rule.uid"
                     :animate="false" />
            <f7-link v-if="isPinned('rules', rule, 'uid')"
                     @click="$emit('unpin', 'rules', rule, 'uid')"
                     color="red"
                     icon-f7="pin_slash_fill"
                     icon-size="18"
                     tooltip="Unpin" />
            <f7-link v-else
                     @click="$emit('pin', 'rules', rule, 'uid')"
                     color="blue"
                     icon-f7="unpin"
                     icon-size="18"
                     tooltip="Pin" />
          </template>
        </f7-list-item>
        <f7-list-button v-if="!showingAll('rules')"
                        color="blue"
                        @click="expandedTypes.rules = true">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Scenes -->
    <f7-block class="no-margin no-padding" v-if="searchResults.scenes.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="film" />Scenes ({{ searchResults.scenes.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item v-for="rule in filteredSearchResults.scenes"
                      media-item
                      :key="rule.uid"
                      :title="rule.name"
                      :footer="rule.uid"
                      link=""
                      no-chevron
                      @click="(evt) => togglePin(evt, 'rules', rule, 'uid')">
          <template #after>
            <f7-link color="gray">
              <clipboard-icon :value="rule.uid" tooltip="Copy Scene UID" />
            </f7-link>
            <f7-link color="gray"
                     icon-f7="pencil"
                     icon-size="18"
                     tooltip="Edit"
                     :href="'/settings/' + (rule.tags.indexOf('Script') >= 0 ? 'scripts' : 'rules') + '/' + rule.uid"
                     :animate="false" />
            <f7-link v-if="isPinned('scenes', rule, 'uid')"
                     @click="$emit('unpin', 'scenes', rule, 'uid')"
                     color="red"
                     icon-f7="pin_slash_fill"
                     icon-size="18"
                     tooltip="Unpin" />
            <f7-link v-else
                     @click="$emit('pin', 'scenes', rule, 'uid')"
                     color="blue"
                     icon-f7="unpin"
                     icon-size="18"
                     tooltip="Pin" />
          </template>
        </f7-list-item>
        <f7-list-button v-if="!showingAll('rules')"
                        color="blue"
                        @click="expandedTypes.rules = true">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Scripts -->
    <f7-block class="no-margin no-padding" v-if="searchResults.scripts.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="doc_plaintext" />Scripts ({{ searchResults.scripts.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item v-for="rule in filteredSearchResults.scripts"
                      media-item
                      :key="rule.uid"
                      :title="rule.name"
                      :footer="rule.uid"
                      link=""
                      no-chevron
                      @click="(evt) => togglePin(evt, 'rules', rule, 'uid')">
          <template #after>
            <f7-link color="gray">
              <clipboard-icon :value="rule.uid" tooltip="Copy Script UID" />
            </f7-link>
            <f7-link color="gray"
                     icon-f7="pencil"
                     icon-size="18"
                     tooltip="Edit"
                     :href="'/settings/' + (rule.tags.indexOf('Script') >= 0 ? 'scripts' : 'rules') + '/' + rule.uid"
                     :animate="false" />
            <f7-link v-if="isPinned('scripts', rule, 'uid')"
                     @click="$emit('unpin', 'scripts', rule, 'uid')"
                     color="red"
                     icon-f7="pin_slash_fill"
                     icon-size="18"
                     tooltip="Unpin" />
            <f7-link v-else
                     @click="$emit('pin', 'scripts', rule, 'uid')"
                     color="blue"
                     icon-f7="unpin"
                     icon-size="18"
                     tooltip="Pin" />
          </template>
        </f7-list-item>
        <f7-list-button v-if="!showingAll('rules')"
                        color="blue"
                        @click="expandedTypes.rules = true">
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
        <f7-list-item v-for="page in filteredSearchResults.pages"
                      media-item
                      :key="page.uid"
                      :title="page.config.label"
                      :footer="page.uid"
                      link=""
                      no-chevron
                      @click="evt => togglePin(evt, 'pages', page, 'uid')">
          <template #after>
            <f7-link color="gray">
              <clipboard-icon :value="page.uid" tooltip="Copy Page UID" />
            </f7-link>
            <f7-link color="gray"
                     icon-f7="pencil"
                     icon-size="18"
                     tooltip="Edit"
                     :href="'/settings/pages/' + getPageType(page).type + '/' + page.uid"
                     :animate="false" />
            <f7-link v-if="isPinned('pages', page, 'uid')"
                     @click="$emit('unpin', 'pages', page, 'uid')"
                     color="red"
                     icon-f7="pin_slash_fill"
                     icon-size="18"
                     tooltip="Unpin" />
            <f7-link v-else
                     @click="$emit('pin', 'pages', page, 'uid')"
                     color="blue"
                     icon-f7="unpin"
                     icon-size="18"
                     tooltip="Pin" />
          </template>
        </f7-list-item>
        <f7-list-button v-if="!showingAll('pages')"
                        color="blue"
                        @click="expandedTypes.pages = true">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Widgets -->
    <f7-block class="no-margin no-padding" v-if="searchResults.widgets.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="rectangle_on_rectangle_angled" />Widgets ({{ searchResults.widgets.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item v-for="widget in filteredSearchResults.widgets"
                      media-item
                      :key="widget.uid"
                      :title="widget.uid"
                      link=""
                      no-chevron
                      @click="(evt) => togglePin(evt, 'widgets', widget, 'uid')">
          <template #after>
            <f7-link color="gray">
              <clipboard-icon :value="widget.uid" tooltip="Copy Widget UID" />
            </f7-link>
            <f7-link color="gray"
                     icon-f7="pencil"
                     icon-size="18"
                     tooltip="Edit"
                     :href="'/developer/widgets/' + widget.uid"
                     :animate="false" />
            <f7-link v-if="isPinned('widgets', widget, 'uid')"
                     @click="$emit('unpin', 'widgets', widget, 'uid')"
                     color="red"
                     icon-f7="pin_slash_fill"
                     icon-size="18"
                     tooltip="Unpin" />
            <f7-link v-else
                     @click="$emit('pin', 'widgets', widget, 'uid')"
                     color="blue"
                     icon-f7="unpin"
                     icon-size="18"
                     tooltip="Pin" />
          </template>
        </f7-list-item>
        <f7-list-button v-if="!showingAll('widgets')"
                        color="blue"
                        @click="expandedTypes.widgets = true">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Transformations -->
    <f7-block class="no-margin no-padding" v-if="searchResults.transformations.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="arrow_2_squarepath" />Transformations ({{ searchResults.transformations.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item v-for="transformation in filteredSearchResults.transformations"
                      media-item
                      :key="transformation.uid"
                      :title="transformation.label"
                      :footer="transformation.uid"
                      link=""
                      no-chevron
                      @click="(evt) => togglePin(evt, 'transformations', transformation, 'uid')">
          <template #after>
            <f7-link color="gray">
              <clipboard-icon :value="transformation.uid" tooltip="Copy Transformation UID" />
            </f7-link>
            <f7-link color="gray"
                     icon-f7="pencil"
                     icon-size="18"
                     tooltip="Edit"
                     :href="'/settings/transformations/' + transformation.uid"
                     :animate="false" />
            <f7-link v-if="isPinned('transformations', transformation, 'uid')"
                     @click="$emit('unpin', 'transformations', transformation, 'uid')"
                     color="red"
                     icon-f7="pin_slash_fill"
                     icon-size="18"
                     tooltip="Unpin" />
            <f7-link v-else
                     @click="$emit('pin', 'transformations', transformation, 'uid')"
                     color="blue"
                     icon-f7="unpin"
                     icon-size="18"
                     tooltip="Pin" />
          </template>
        </f7-list-item>
        <f7-list-button v-if="!showingAll('transformations')"
                        color="blue"
                        @click="expandedTypes.transformations = true">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
    <!-- Persistence configs -->
    <f7-block class="no-margin no-padding" v-if="searchResults.persistenceConfigs.length">
      <f7-block-title class="padding-left">
        <f7-icon class="margin-right" f7="download_circle" />Persistence Configs ({{ searchResults.persistenceConfigs.length }})
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item v-for="persistenceConfig in filteredSearchResults.persistenceConfigs"
                      media-item
                      :key="persistenceConfig.serviceId"
                      :title="persistenceConfig.label"
                      :footer="persistenceConfig.serviceId"
                      link=""
                      no-chevron
                      @click="(evt) => togglePin(evt, 'persistenceConfigs', persistenceConfig, 'serviceId')">
          <template #after>
            <f7-link color="gray">
              <clipboard-icon :value="persistenceConfig.serviceId" tooltip="Copy Service ID" />
            </f7-link>
            <f7-link color="gray"
                     icon-f7="pencil"
                     icon-size="18"
                     tooltip="Edit"
                     :href="'/settings/persistence/' + persistenceConfig.serviceId"
                     :animate="false" />
            <f7-link v-if="isPinned('persistenceConfigs', persistenceConfig, 'serviceId')"
                     @click="$emit('unpin', 'persistenceConfigs', persistenceConfig, 'serviceId')"
                     color="red"
                     icon-f7="pin_slash_fill"
                     icon-size="18"
                     tooltip="Unpin" />
            <f7-link v-else
                     @click="$emit('pin', 'persistenceConfigs', persistenceConfig, 'serviceId')"
                     color="blue"
                     icon-f7="unpin"
                     icon-size="18"
                     tooltip="Pin" />
          </template>
        </f7-list-item>
        <f7-list-button v-if="!showingAll('persistenceConfigs')"
                        color="blue"
                        @click="expandedTypes.persistenceConfigs = true">
          Show All
        </f7-list-button>
      </f7-list>
    </f7-block>
  </div>
</template>

<style lang="stylus">
.item-after
  .link
    .icon
      padding-left 5px
</style>

<script>
import ClipboardIcon from '@/components/util/clipboard-icon.vue'

export default {
  components: {
    ClipboardIcon
  },
  props: {
    searchResults: Object,
    pinnedObjects: Object,
    cachedObjects: Object,
    loading: Boolean
  },
  emits: ['pin', 'unpin'],
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
      const widgets = (this.expandedTypes.widgets) ? this.searchResults.widgets : (this.searchResults.widgets ? this.searchResults.widgets.slice(0, 5) : [])
      const transformations = (this.expandedTypes.transformations) ? this.searchResults.transformations : (this.searchResults.transformations ? this.searchResults.transformations.slice(0, 5) : [])
      const persistenceConfigs = (this.expandedTypes.persistenceConfigs) ? this.searchResults.persistenceConfigs : (this.searchResults.persistenceConfigs ? this.searchResults.persistenceConfigs.slice(0, 5) : [])
      return { items, things, rules, scenes, scripts, pages, widgets, transformations, persistenceConfigs }
    }
  },
  watch: {
    searchResults () {
      this.expandedTypes = {}
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
      return this.pageTypes.find((t) => t.componentType === page.component)
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
