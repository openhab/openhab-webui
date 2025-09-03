<template>
  <f7-popup closeByBackdropClick
            closeOnEscape
            @popup:open="onOpen"
            @popup:close="onClose">
    <f7-page>
      <f7-navbar :title="propertyMode ? 'Semantic Property' : 'Semantic Class'">
        <f7-nav-right>
          <f7-link @click="onClose">
            Close
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-subnavbar :inner="false">
        <f7-searchbar
          search-container=".semantics-treeview"
          search-item=".treeview-item"
          search-in=".treeview-item-label"
          :disable-button="!theme.aurora"
          @input="showFiltered($event.target.value)" />
        <div class="expand-button">
          <f7-button v-if="!expanded"
                     icon-size="24"
                     tooltip="Expand"
                     icon-f7="rectangle_expand_vertical"
                     @click="toggleExpanded()" />
          <f7-button v-else
                     color="gray"
                     icon-size="24"
                     tooltip="Collapse"
                     icon-f7="rectangle_compress_vertical"
                     @click="toggleExpanded()" />
        </div>
      </f7-subnavbar>
      <f7-toolbar bottom class="toolbar-details">
        <span />
        <div class="padding-left padding-right text-align-center" style="font-size: 12px">
          <template v-if="classMode">
            <label v-if="classMode" class="advanced-label">
              <f7-checkbox v-model:checked="showAllClasses" />
              Show all classes
            </label>
          </template>
          <label class="advanced-label">
            <f7-checkbox v-model:checked="showNames" />
            Show tag names
          </label>
          <label class="advanced-label">
            <f7-checkbox v-model:checked="showSynonyms" />
            Show synonyms
          </label>
        </div>
        <span />
      </f7-toolbar>
      <semantics-treeview class="semantic-classes"
                          :semanticTags="semanticTags"
                          :expandedTags="expandedTags"
                          @selected="tagSelected"
                          :showNames="showNames"
                          :showSynonyms="showSynonyms"
                          :selectedTag="selectedTag"
                          :selectedClass="selectedClass"
                          :hideNone="hideNone"
                          :picker="true"
                          :propertyMode="!!propertyMode"
                          :classMode="!!classMode"
                          :limitToClass="!showAllClasses" />
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.expand-button
  margin-right 8px
  text-overflow unset
  align-self center
  .icon
    margin-bottom 2.75px !important
</style>

<script>
import { f7, theme } from 'framework7-vue'
import SemanticsTreeview from '@/components/tags/semantics-treeview.vue'
import { useSemanticsStore } from '@/js/stores/useSemanticsStore'

export default {
  components: {
    SemanticsTreeview
  },
  props: {
    item: Object,
    propertyMode: Boolean,
    classMode: Boolean,
    hideNone: Boolean,
    semanticClass: String,
    semanticProperty: String
  },
  emits: ['close', 'changed'],
  setup () {
    return {
      theme
    }
  },
  data () {
    return {
      expanded: false,
      expandedTags: [],
      showNames: false,
      showSynonyms: false,
      filtering: false,
      expandedBeforeFiltering: false,
      selectedTag: null,
      showAllClasses: false
    }
  },
  computed: {
    semanticTags () {
      return useSemanticsStore().Tags.map((t) => {
        const tag = {
          uid: t.uid,
          name: t.name,
          label: useSemanticsStore().Labels[t.name],
          description: t.description,
          synonyms: useSemanticsStore().Synonyms[t.name],
          parent: t.parent
        }
        return tag
      })
    },
    selectedClass () {
      const selectedTag = this.semanticTags.find((t) => t.name === (this.semanticClass || this.semanticProperty)) || { uid: 'None', label: 'None' }
      const tagName = selectedTag?.name
      if (useSemanticsStore().Locations.indexOf(tagName) >= 0) return 'Location'
      if (useSemanticsStore().Equipment.indexOf(tagName) >= 0) return 'Equipment'
      if (useSemanticsStore().Points.indexOf(tagName) >= 0) return 'Point'
      return ''
    }
  },
  methods: {
    onOpen () {
      this.selectedTag = this.semanticTags.find((t) => t.name === (this.semanticClass || this.semanticProperty)) || { uid: 'None', label: 'None' }
      // expand tree down to current selection
      this.expandToSelection()
    },
    toggleExpanded () {
      this.expanded = !this.expanded
      this.semanticTags.forEach((t) => {
        this.expandedTags[t.uid] = this.expanded
      })
      this.expandToSelection()
    },
    expandToSelection () {
      this.selectedTag?.parent?.split('_').reduce((prev, p) => {
        const parent = (prev ? (prev + '_') : '') + p
        this.expandedTags[parent] = true
        return parent
      }, '')
    },
    showFiltered (filter) {
      if (filter) {
        if (!this.filtering) {
          this.filtering = true
          this.expandedBeforeFiltering = this.expanded
          if (!this.expanded) {
            this.toggleExpanded()
          }
        }
      } else if (this.filtering) {
        this.filtering = false
        if (this.expanded && !this.expandedBeforeFiltering) {
          this.toggleExpanded()
        }
      }
    },
    tagSelected (tag) {
      const previousTag = this.selectedTag
      if (previousTag?.name) {
        const prevIndex = this.item.tags.indexOf(previousTag.name)
        this.item.tags.splice(prevIndex, 1)
      }
      // Only add tag if note 'None'
      if (tag.name) {
        if (this.item.tags) {
          this.item.tags.push(tag.name)
        } else {
          this.item.tags = [tag.name]
        }
      }
      // If changing tag to 'None', a 'Location' tag or an 'Equipment' tag, remove 'Property' tags
      if (this.classMode && this.item.tags && (!tag.name || tag.uid.split('_')[0] !== 'Point')) {
        const tags = [...this.item.tags]
        tags.forEach((t) => {
          if (useSemanticsStore().Properties.indexOf(t) >= 0) {
            const index = this.item.tags.indexOf(t)
            this.item.tags.splice(index, 1)
          }
        })
      }
      this.selectedTag = tag
      this.$emit('changed')
    },
    onClose () {
      f7.popup.close()
      this.$emit('close')
    }
  }
}
</script>
