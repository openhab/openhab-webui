<template>
  <div v-if="item && item.tags" class="tag-editor" style="margin-top: 0">
    <f7-list no-hairlines>
      <f7-list-input
        type="text"
        placeholder="Add tag"
        :value="pendingTag"
        @input="pendingTag = $event.target.value"
        @blur="addTag()"
        @keyPressed.native="keyPressed"
        :input="false"
        class="add-tag-input"
      >
        <input slot="input" type="text" placeholder="Add tag" @keypress="keyPressed" />
      </f7-list-input>
    </f7-list>
    <f7-block strong no-hairlines-md v-if="item.tags" style="margin-top: 0" class="tags">
      <f7-chip v-for="tag in item.tags.filter((t) => !isSemanticTag(t))" :key="tag" :text="tag" deleteable @delete="deleteTag" media-bg-color="blue">
        <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" ></f7-icon>
      </f7-chip>
    </f7-block>
  </div>
</template>

<script>
import * as SemanticClasses from '@/assets/semantics.js'

export default {
  props: ['item'],
  data () {
    return {
      pendingTag: ''
    }
  },
  methods: {
    isSemanticTag (tag) {
      return [SemanticClasses.Locations,
        SemanticClasses.Equipments,
        SemanticClasses.Points,
        SemanticClasses.Properties].some((t) => t.indexOf(tag) >= 0)
    },
    addTag () {
      if (this.pendingTag && this.item.tags.indexOf(this.pendingTag) === -1) {
        this.item.tags.push(this.pendingTag)
      }
      this.pendingTag = ''
    },
    keyPressed (evt) {
      this.pendingTag = evt.target.value
      if (evt.code === 'Enter') {
        this.addTag()
        evt.target.value = ''
        this.pendingTag = ''
      }
    },
    deleteTag (ev) {
      const tag = ev.target.previousSibling.innerText
      if (this.item.tags.indexOf(tag) >= 0) {
        this.item.tags.splice(this.item.tags.indexOf(tag), 1)
      }
    }
  }
}
</script>

<style lang="stylus">
.tags-editor
  margin-bottom 0
  .tags
    text-align center
  .list
    margin-top 0
    margin-bottom 0
    border 0
  .chip
    margin-left 3px
    margin-right 3px

</style>
