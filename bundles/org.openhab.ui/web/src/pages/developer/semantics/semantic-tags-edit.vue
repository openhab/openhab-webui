<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="'Semantic Tags' + dirtyIndicator" back-link="Back" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('tree')" :tab-link-active="currentTab === 'tree'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="switchTab('code')" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-toolbar bottom class="toolbar-details" v-if="currentTab === 'tree'">
      <f7-link :disabled="selectedTag != null" class="left" @click="selectTag(null)">
        Clear
      </f7-link>
      <div class="padding-left padding-right text-align-center" style="font-size: 12px">
        <div>
          <f7-checkbox :checked="showNames" @change="toggleShowNames" />
          <label @click="toggleShowNames" class="advanced-label">Show tag names</label>
          <f7-checkbox style="margin-left: 5px" :checked="showSynonyms" @change="toggleShowSynonyms" />
          <label @click="toggleShowSynonyms" class="advanced-label">Show synonyms</label>
        </div>
      </div>
      <f7-link v-if="selectedTag" class="right details-link padding-right" ref="detailsLink" @click="detailsOpened = true" icon-f7="chevron_up" />
    </f7-toolbar>

    <f7-tabs class="semantics-editor-tabs">
      <f7-tab class="design" id="tree" :tab-active="currentTab === 'tree'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <f7-block v-else class="semantics-tree-wrapper no-margin-top" :class="{ 'sheet-opened' : detailsOpened }">
          <f7-row v-if="currentTab === 'tree'">
            <!-- do not set column width as usual, instead use custom CSS because of https://github.com/openhab/openhab-webui/issues/2574 -->
            <f7-col>
              <f7-subnavbar v-show="semanticTags.length" :inner="false" style="position: sticky; top: 0px">
                <f7-searchbar style="width: 100%"
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
              <f7-block v-show="semanticTags.length" class="semantics-tree" no-gap @click.native="clearSelection">
                <semantics-treeview :semanticTags="semanticTags" :expandedTags="expandedTags" @selected="selectTag" :showNames="showNames" :showSynonyms="showSynonyms" :selectedTag="selectedTag" canDragDrop="true" />
              </f7-block>
            </f7-col>
            <f7-col class="details-pane">
              <f7-block v-if="!selectedTag" no-gap>
                <div class="padding text-align-center">
                  Nothing selected
                </div>
              </f7-block>
              <f7-block v-else>
                <f7-card style="tag-detail">
                  <f7-card-content>
                    <f7-list class="tag-detail" inline-labels>
                      <f7-list-input label="Name" :value="selectedTag.name"
                                     :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                                     placeholder="name"
                                     required
                                     validate pattern="^[A-Za-z][A-Za-z0-9\-]*$" error-message="Required. A-Z,a-z,0-9,- only"
                                     @input="updateName($event)" />
                      <f7-list-input label="Label" :value="selectedTag.label" :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                                     placeholder="label"
                                     required
                                     @input="($event) => selectedTag.label = $event.target.value" />
                      <f7-list-input label="Description" :value="selectedTag.description" type="textarea" resizable :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                                     placeholder="description"
                                     @input="($event) => selectedTag.description = $event.target.value" />
                    </f7-list>
                  </f7-card-content>
                  <f7-card-footer v-if="selectedTag.editable">
                    <f7-button color="red" @click="removeTag">
                      Remove
                    </f7-button>
                  </f7-card-footer>
                </f7-card>
                <div><f7-block-title>Synonyms</f7-block-title></div>
                <f7-card style="tag-detail">
                  <f7-card-content>
                    <f7-list class="synonyms">
                      <f7-list-input v-for="(synonym, index) in selectedTag.synonyms" :key="synonym" :value="synonym" :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                                     placeholder="synonym"
                                     @change="updateSynonyms($event, index)" />
                      <f7-list-input value="" :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                                     placeholder="synonym"
                                     @change="updateSynonyms($event)" />
                    </f7-list>
                  </f7-card-content>
                </f7-card>
              </f7-block>
              <f7-block v-if="selectedTag">
                <div><f7-block-title>Add Child Tag</f7-block-title></div>
                <f7-card>
                  <f7-card-content>
                    <f7-list>
                      <f7-list-button color="blue" :title="`Insert ${semanticType(selectedTag.name)} Child Tag in ${selectedTag.name}`" @click="addTag()" />
                    </f7-list>
                  </f7-card-content>
                </f7-card>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>
      </f7-tab>
      <f7-tab id="code" :tab-active="currentTab === 'code'">
        <editor v-if="ready" class="semantic-tag-code-editor" mode="application/vnd.openhab.tag+yaml" :value="editingTagsYaml" @input="onEditorInput" />
      </f7-tab>
    </f7-tabs>

    <f7-fab v-if="currentTab === 'tree'" class="add-to-semantics-fab" position="right-center" slot="fixed" color="blue" @click="addTag()">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply" />
    </f7-fab>
    <f7-sheet v-if="currentTab === 'tree'" class="semantics-details-sheet" ref="details-sheet" :backdrop="false" :close-on-escape="true" :opened="detailsOpened" @sheet:closed="detailsOpened = false">
      <f7-page>
        <f7-toolbar tabbar bottom scrollable>
          <div class="left">
            <f7-link sheet-close class="padding-right">
              <f7-icon f7="chevron_down" />
            </f7-link>
          </div>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'tag'" @click="detailsTab = 'tag'">
            Tag
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'synonyms'" @click="detailsTab = 'synonyms'">
            Synonyms
          </f7-link>
        </f7-toolbar>
        <f7-block style="margin-bottom: 6rem" v-if="selectedTag && detailsTab === 'tag'">
          <f7-list class="tag-detail" inline-labels>
            <f7-list-input label="Name" :value="selectedTag.name"
                           :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                           placeholder="name"
                           validate pattern="^[A-Za-z][A-Za-z0-9\-]*$" error-message="Required. A-Z,a-z,0-9,- only"
                           @input="updateName($event)" />
            <f7-list-input label="Label" :value="selectedTag.label" :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                           placeholder="label"
                           @input="($event) => selectedTag.label = $event.target.value" />
            <f7-list-input label="Description" :value="selectedTag.description" type="textarea" resizable :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                           placeholder="description"
                           @input="($event) => selectedTag.description = $event.target.value" />
          </f7-list>
          <f7-button v-if="selectedTag.editable" color="red" @click="removeTag">
            Remove
          </f7-button>
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedTag && detailsTab === 'synonyms'">
          <f7-list class="synonyms">
            <f7-list-input v-for="(synonym, index) in selectedTag.synonyms" :key="synonym" :value="synonym" :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                           placeholder="synonym"
                           @change="updateSynonyms($event, index)" />
            <f7-list-input value="" :disabled="!selectedTag.editable" :clear-button="selectedTag.editable"
                           placeholder="synonym"
                           @change="updateSynonyms($event)" />
          </f7-list>
        </f7-block>
      </f7-page>
    </f7-sheet>
  </f7-page>
</template>

<style lang="stylus">
.tag-detail
  .item-inner:after
    height 0 !important /* remove all lines between params */
  .additional-controls:before
    display block !important
#additional:before
  display block !important /* need two selectors to override the important Vue card css */

.semantics-editor-tabs
  height calc(100%)
  overflow hidden
  .tab
    height 100%
  .design
    --f7-grid-gap 0px
    overflow auto

.semantics-tree-wrapper
  padding 0
  margin-bottom 0
  .col
    width 100% /* manually set column width because of https://github.com/openhab/openhab-webui/issues/2574 */
.semantics-tree
  padding 0
  border-right 1px solid var(--f7-block-strong-border-color)
  .treeview
    --f7-treeview-item-height 40px
    .treeview-item-label
      font-size 10pt
      white-space nowrap
      overflow-x hidden
    .subtitle
      font-size 8pt
      color var(--f7-list-item-footer-text-color)
.semantics-details-sheet
  .toolbar
    --f7-theme-color var(--f7-color-blue)
    --f7-theme-color-rgb var(--f7-color-blue-rgb)
  z-index 10900
.md .semantics-details-sheet .toolbar .link
  width 35%
.semantic-tag-code-editor.vue-codemirror
  display block
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(100% - 2*var(--f7-navbar-height))
  width 100%

@media (min-width: 768px)
  .semantics-tree-wrapper
    height 100%
    .row
      height 100%
      .col
        width 50% /* manually set column width because of https://github.com/openhab/openhab-webui/issues/2574 */
        height 100%
        overflow auto
        .semantics-tree
          margin 0
          height auto
      .details-pane
        padding-top 0
        .block
          margin-top 0
  .semantics-details-sheet
    visibility hidden !important
  .toolbar-details
    .details-link
      visibility hidden !important
  .add-to-semantics-fab
    visibility hidden !important

@media (max-width: 767px)
  .details-pane
    display none
  .semantics-tree-wrapper.sheet-opened
    margin-bottom var(--f7-sheet-height)
  .semantics-details-sheet
    height calc(0.8*var(--f7-sheet-height))

.expand-button
  margin-right 8px
  text-overflow unset
  align-self center
  .icon
    margin-bottom 2.75px !important
</style>

<script>
import YAML from 'yaml'
import fastDeepEqual from 'fast-deep-equal/es6'

import SemanticsTreeview from '@/components/tags/semantics-treeview.vue'
import TagMixin from '@/components/tags/tag-mixin'
import DirtyMixin from '@/pages/settings/dirty-mixin'

export default {
  mixins: [DirtyMixin, TagMixin],
  components: {
    SemanticsTreeview,
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  data () {
    return {
      semanticTags: [],
      selectedTag: null,
      expandedTags: [],
      currentTab: 'tree',
      detailsTab: 'tag',
      detailsOpened: false,
      loading: false,
      ready: false,
      showNames: false,
      showSynonyms: false,
      expanded: false,
      filtering: false,
      expandedBeforeFiltering: false,
      editableSemanticTagsYaml: null,
      editingTagsYaml: null,
      nonCodeDirty: false // When editing code, keeps track if it was already dirty before switching to code tab
    }
  },
  watch: {
    semanticTags: {
      handler: function () {
        if (!this.loading) {
          this.dirty = true
        }
      },
      deep: true
    },
    '$store.getters.semanticsLoaded': {
      handler: function (loaded) {
        if (loaded) {
          this.load()
        }
      },
      immediate: true
    }
  },
  methods: {
    onPageAfterIn () {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
      this.detailsOpened = false
    },
    onEditorInput (value) {
      if (value !== this.editableSemanticTagsYaml) {
        this.dirty = this.nonCodeDirty || true
      } else {
        this.dirty = this.nonCodeDirty || false
      }
      this.editingTagsYaml = value
    },
    switchTab (tab) {
      if (this.currentTab === tab) return
      // avoid error with existing details sheet when switching tabs
      const sheet = this.$refs['details-sheet']?.f7Sheet
      if (sheet?.opened) {
        sheet.close()
      }
      if (tab === 'code') {
        this.currentTab = tab
        this.nonCodeDirty = this.dirty
        this.selectTag(null)
        this.editableSemanticTagsYaml = this.toYaml()
        this.editingTagsYaml = this.editableSemanticTagsYaml
      } else {
        if (!this.fromYaml()) {
          this.$f7.dialog.alert('Error parsing YAML')
          return
        }
        this.currentTab = tab
      }
    },
    keyDown (ev) {
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        this.save()
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    load () {
      if (this.loading) return
      this.loading = true

      const tags = this.semanticClasses.Tags.map((t) => {
        return {
          uid: t.uid,
          name: t.name,
          label: this.semanticClasses.Labels[t.name],
          description: t.description,
          synonyms: this.semanticClasses.Synonyms[t.name],
          editable: t.editable,
          parent: t.parent
        }
      })
      this.$set(this, 'semanticTags', tags)
      this.$nextTick(() => {
        this.dirty = false
        this.loading = false
        this.ready = true
      })
    },
    async save () {
      if (!this.dirty) return

      if (this.currentTab === 'code') {
        if (!this.fromYaml()) {
          this.$f7.dialog.alert('Error parsing YAML, cannot save')
          return
        }
      }

      const editableTags = this.semanticTags.filter((t) => t.editable)
      const addedTags = editableTags.filter((t) => !this.semanticClasses.Tags.find((c) => c.uid === t.uid))
      const modifiedTags = editableTags.filter((t) => this.semanticClasses.Tags.find((c) => (c.uid === t.uid) && !fastDeepEqual(c, t)))
      const removedTags = this.semanticClasses.Tags.filter((c) => !this.semanticTags.find((t) => t.uid === c.uid))
      console.log(addedTags[0], removedTags[0])

      if (addedTags.some((t) => {
        if ((!t.name || !t.label) || modifiedTags.some((t) => !t.name || !t.label)) {
          this.$f7.dialog.alert(`${t.name}: Tag name and label required`)
          return true
        }
        if (this.semanticClasses.Tags.find((c) => c.name === t.name) && !removedTags.find((r) => r.name === t.name)) {
          this.$f7.dialog.alert(`${t.name}: Tag names must be unique`)
          return true
        }
        return false
      })) {
        return
      }

      const addTasks = addedTags.map((t) => () => this.$oh.api.post('/rest/tags', t))
      const changeTasks = modifiedTags.map((t) => () => this.$oh.api.put('/rest/tags/' + t.uid, t))
      const removeTasks = removedTags.map((t) => () => this.$oh.api.delete('/rest/tags/' + t.uid))
      if (addTasks.length <= 0 && changeTasks.length <= 0 && removeTasks.length <= 0) {
        this.dirty = false
        return
      }

      try {
        if (removeTasks.length > 0) {
          // Remove first as moving a tag will keep name but change uid.
          // So need to use the post endpoint with the new uid, but this is refused if the name is still the same and not first deleted.
          await Promise.all(removeTasks.map((fn) => fn()))
          console.debug('Successfull removed tags')
        }
        if (addTasks.length > 0) {
          await Promise.all(addTasks.map((fn) => fn()))
          console.debug('Successfully added tags')
        }
        if (changeTasks.length > 0) {
          await Promise.all(changeTasks.map((fn) => fn()))
          console.debug('Successfully changed tags')
        }
        this.dirty = false
        this.$store.dispatch('loadSemantics').then(() => {
          this.load()
        })
      } catch (error) {
        this.$f7.dialog.alert('Error saving: ' + error)
      }
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
          this.selectTag(null)
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
    selectTag (tag) {
      if (this.selectedTag === tag) return
      this.selectedTag = null
      if (!tag) {
        this.detailsOpened = false
        return
      }
      this.$nextTick(() => {
        this.selectedTag = tag
        this.detailsTab = 'tag'
        this.$nextTick(() => {
          const detailsLink = this.$refs.detailsLink
          if (detailsLink?.$el) {
            const visibility = window.getComputedStyle(detailsLink.$el).visibility
            if (!visibility || visibility !== 'hidden') {
              this.detailsOpened = true
            }
          }
        })
      })
    },
    addTag () {
      if (!this.selectedTag) return
      const tag = {
        uid: this.selectedTag.uid + '_',
        name: '',
        label: '',
        description: '',
        parent: this.selectedTag.uid,
        editable: true,
        synonyms: []
      }
      this.semanticTags.push(tag)
      this.selectTag(tag)
      this.$set(this.expandedTags, tag.parent, true)
      this.detailsTab = 'tag'
    },
    removeTag () {
      if (!this.selectedTag) return
      this.semanticTags.splice(this.semanticTags.indexOf(this.selectedTag), 1)
      this.selectTag(null)
    },
    updateName (ev) {
      const name = ev.target.value
      this.selectedTag.name = name
      const oldUid = this.selectedTag.uid
      const newUid = this.selectedTag.parent + '_' + name
      this.selectedTag.uid = newUid
      this.expandedTags[newUid] = this.expandedTags[oldUid]
    },
    updateSynonyms (event, index) {
      const newValue = event.target.value
      if (typeof index === 'number') {
        if (newValue) {
          this.selectedTag.synonyms.splice(index, 1, newValue)
        } else {
          this.selectedTag.synonyms.splice(index, 1)
        }
      } else {
        if (newValue) {
          this.selectedTag.synonyms.push(newValue)
        }
      }
    },
    clearSelection (ev) {
      if (ev.target && ev.currentTarget && ev.target === ev.currentTarget) {
        this.selectTag(null)
      }
    },
    toYaml () {
      const tags = this.semanticTags.filter((t) => t.editable).map((t) => {
        return {
          name: t.name,
          label: t.label,
          description: t.description,
          synonyms: [...t.synonyms],
          parent: t.parent
        }
      })
      return YAML.stringify(tags)
    },
    fromYaml () {
      const tags = [...this.semanticTags].filter((t) => !t.editable)
      const editableTags = this.semanticTags.filter((t) => t.editable)
      try {
        const updatedTags = YAML.parse(this.editingTagsYaml).map((t) => {
          const tag = t
          tag.editable = true
          tag.uid = t.parent + '_' + t.name
          return tag
        })
        if (fastDeepEqual(updatedTags, editableTags)) {
          return true
        }
        tags.push(...updatedTags)
      } catch (error) {
        console.warn('Error parsing YAML')
        return false
      }
      this.$set(this, 'semanticTags', tags)
      return true
    }
  }
}
</script>
