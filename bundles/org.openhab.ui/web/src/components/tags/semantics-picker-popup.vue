<template>
  <f7-popup closeByBackdropClick closeOnEscape @popup:open="onOpen" @popup:close="onClose">
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
          :disable-button="!$theme.aurora"
          @input="showFiltered($event.target.value)" />
        <div class="expand-button">
          <f7-button v-if="!expanded" icon-size="24" tooltip="Expand" icon-f7="rectangle_expand_vertical" @click="toggleExpanded()" />
          <f7-button v-else color="gray" icon-size="24" tooltip="Collapse" icon-f7="rectangle_compress_vertical" @click="toggleExpanded()" />
        </div>
      </f7-subnavbar>
      <f7-toolbar bottom class="toolbar-details">
        <span />
        <div class="padding-left padding-right text-align-center" style="font-size: 12px">
          <f7-checkbox :checked="showNames" @change="toggleShowNames" />
          <label @click="toggleShowNames" class="advanced-label">Show tag names</label>
          <f7-checkbox style="margin-left: 5px" :checked="showSynonyms" @change="toggleShowSynonyms" />
          <label @click="toggleShowSynonyms" class="advanced-label">Show synonyms</label>
        </div>
        <span />
      </f7-toolbar>
      <semantics-treeview class="semantic-classes" :semanticTags="semanticTags" :expandedTags="expandedTags"
                          @selected="tagSelected" :showNames="showNames" :showSynonyms="showSynonyms"
                          :selectedTag="selectedTag" :hideNone="hideNone"
                          picker="true" :propertyMode="!!propertyMode" :limitToClass="limitToClass" />
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
import SemanticsTreeview from '@/components/tags/semantics-treeview.vue'

export default {
  components: {
    SemanticsTreeview
  },
  props: ['item', 'propertyMode', 'hideNone', 'semanticClass', 'semanticProperty'],
  data () {
    return {
      semanticClasses: this.$store.getters.semanticClasses,
      expanded: false,
      expandedTags: [],
      showNames: false,
      showSynonyms: false,
      filtering: false,
      expandedBeforeFiltering: false,
      selectedTag: null
    }
  },
  computed: {
    semanticTags () {
      return this.semanticClasses.Tags.map((t) => {
        const tag = {
          uid: t.uid,
          name: t.name,
          label: this.semanticClasses.Labels[t.name],
          description: t.description,
          synonyms: this.semanticClasses.Synonyms[t.name],
          parent: t.parent
        }
        return tag
      })
    },
    limitToClass () {
      const selectedTag = this.semanticTags.find((t) => t.name === (this.semanticClass || this.semanticProperty)) || { uid: 'None', label: 'None' }
      const tagName = selectedTag?.name
      if (this.semanticClasses.Locations.indexOf(tagName) >= 0) return 'Location'
      if (this.semanticClasses.Equipment.indexOf(tagName) >= 0) return 'Equipment'
      if (this.semanticClasses.Points.indexOf(tagName) >= 0) return 'Point'
      return ''
    }
  },
  methods: {
    onOpen () {
      this.selectedTag = this.semanticTags.find((t) => t.name === (this.semanticClass || this.semanticProperty)) || { uid: 'None', label: 'None' }
      // expand tree down to current selection
      this.expandToSelection()
    },
    toggleShowNames () {
      this.showNames = !this.showNames
    },
    toggleShowSynonyms () {
      this.showSynonyms = !this.showSynonyms
    },
    toggleExpanded () {
      this.expanded = !this.expanded
      this.semanticTags.forEach((t) => {
        this.$set(this.expandedTags, t.uid, this.expanded)
      })
      this.expandToSelection()
    },
    expandToSelection () {
      this.selectedTag?.parent?.split('_').reduce((prev, p) => {
        const parent = (prev ? (prev + '_') : '') + p
        this.$set(this.expandedTags, parent, true)
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
      console.debug('Tag selected')
      console.debug(tag)
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
          this.$set(this.item, 'tags', [tag.name])
        }
      }
      this.selectedTag = tag
      this.$emit('changed')
    },
    onClose () {
      this.$f7.popup.close()
      this.$emit('close')
    }
  }
}
</script>
