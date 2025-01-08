<template>
  <div v-if="item && item.tags" class="tag-editor">
    <f7-list>
      <f7-list-item :title="title || 'Tags'" :badge="tags.length.toString()" />
      <f7-list-item v-if="tags.length > 0">
        <div slot="inner">
          <f7-chip v-for="tag in tags" :key="tag" :text="tag" :deleteable="!disabled" @delete="deleteTag" media-bg-color="blue">
            <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
          </f7-chip>
        </div>
      </f7-list-item>
    </f7-list>
    <f7-list>
      <f7-list-input
        v-if="!disabled"
        type="text"
        placeholder="Add tag"
        :value="pendingTag"
        @input="pendingTag = $event.target.value"
        :input="false"
        class="add-tag-input">
        <input slot="input" type="text" placeholder="Add tag" @keyup="keyUp" @blur="addTag">
      </f7-list-input>
    </f7-list>
  </div>
</template>

<script>
import TagMixin from '@/components/tags/tag-mixin'

export default {
  mixins: [TagMixin],
  props: ['item', 'disabled', 'inScriptEditor', 'inSceneEditor', 'showSemanticTags', 'title'],
  data () {
    return {
      pendingTag: ''
    }
  },
  computed: {
    tags () {
      return this.item.tags.filter((t) => (this.showSemanticTags ? true : !this.isSemanticTag(t)) && !this.isScriptTag(t) && !this.isSceneTag(t))
    }
  },
  methods: {
    isScriptTag (tag) {
      if (this.inScriptEditor !== true) return false
      if (tag === 'Script') return true
    },
    isSceneTag (tag) {
      if (this.inSceneEditor !== true) return false
      if (tag === 'Scene') return true
    },
    addTag (evt) {
      const newTag = this.pendingTag
      this.pendingTag = ''
      // Block adding of Scene or Script tags in the wrong editor
      // Adding them would otherwise lead to a situation where the rule/scene/script is not visible in the UI
      if ((!this.inScriptEditor && newTag === 'Script') ||
        (!this.inSceneEditor && newTag === 'Scene')) {
        return
      }
      if (newTag && this.item.tags.indexOf(newTag) === -1) {
        if (!this.showSemanticTags && this.isSemanticTag(newTag)) {
          this.$f7.dialog.alert(
            `The tag '${newTag}' is a semantic tag. A semantic tag cannot be added here.`,
            'Cannot add tag'
          )
          return
        }
        this.item.tags.push(newTag)
      }
      evt.target.value = ''
    },
    keyUp (evt) {
      this.pendingTag = evt.target.value
      if (evt.code === 'Enter') {
        this.addTag(evt)
      }
    },
    deleteTag (ev) {
      let tag = ev.target.previousSibling.innerText
      if (tag === 'tag_fill') tag = ''
      if (this.item.tags.indexOf(tag) >= 0) {
        this.item.tags.splice(this.item.tags.indexOf(tag), 1)
      }
    }
  }
}
</script>

<style lang="stylus">
.tag-editor
  margin-bottom 0
  .tags
    text-align center
  .list
    margin-top 0
    margin-bottom 0
    border 0
  .chip
    margin-right 6px !important
</style>
