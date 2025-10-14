<template>
  <f7-list inline-labels no-hairlines-md>
    <f7-list-item :title="'Semantic ' + semanticValueTitle"
                  :after="semanticValue || 'None'"
                  :disabled="!editable ? true : null"
                  @click="openPopup('class')"
                  class="aligned-smart-select"
                  :link="editable" />
    <f7-list-item v-if="currentSemanticType === 'Point'"
                  title="Semantic Property"
                  :after="tagWithHierarchy(semanticProperty) || 'None'"
                  :disabled="!editable ? true : null"
                  @click="openPopup('property')"
                  class="aligned-smart-select"
                  :link="editable" />
    <f7-list-group>
      <semantics-picker-popup v-if="popupType === 'class'"
                              ref="classPopup"
                              :key="'semantics-class'"
                              :item="item"
                              :hideNone="hideNone"
                              :classMode="true"
                              :semanticClass="semanticClass"
                              @changed="itemChanged"
                              @close="closePopup" />
      <semantics-picker-popup v-if="popupType === 'property'"
                              ref="propertyPopup"
                              :key="'semantics-property'"
                              :item="item"
                              :hideNone="hideNone"
                              :propertyMode="true"
                              @changed="itemChanged"
                              :semanticProperty="semanticProperty"
                              @close="closePopup" />
    </f7-list-group>
  </f7-list>
</template>

<script>
import TagMixin from '@/components/tags/tag-mixin'
import SemanticsPickerPopup from '@/components/tags/semantics-picker-popup.vue'

export default {
  mixins: [TagMixin],
  props: {
    item: Object,
    createMode: Boolean,
    hideNone: Boolean
  },
  components: {
    SemanticsPickerPopup
  },
  data () {
    return {
      semanticClass: '',
      semanticProperty: '',
      popupType: null
    }
  },
  computed: {
    editable () {
      return this.createMode || (this.item && this.item.editable)
    },
    currentSemanticType () {
      return this.semanticType(this.semanticClass)
    },
    semanticValue () {
      if (!this.semanticClass) return null
      const value = this.tagWithHierarchy(this.semanticClass)
      return value || this.currentSemanticType
    },
    semanticValueTitle () {
      if (this.currentSemanticType === 'Location') return 'Location'
      else if (this.currentSemanticType === 'Equipment') return 'Equipment'
      else if (this.currentSemanticType === 'Point') return 'Point'
      else return 'Value'
    }
  },
  methods: {
    openPopup (type) {
      if (!this.editable) return
      this.popupType = type
      this.$nextTick(() => {
        const popupRef = type === 'class' ? 'classPopup' : 'propertyPopup'
        const popupEl = this.$refs[popupRef]?.$el
        if (popupEl) this.$f7.popup.open(popupEl)
      })
    },
    closePopup () {
      this.popupType = null
    },
    tagWithHierarchy (tag) {
      if (!tag) return null
      let parentTagId = this.semanticClasses.Tags.find((t) => t.name === tag).parent
      if (!parentTagId) return null // no parent tag, so this is the root class
      let value = tag
      while (parentTagId) {
        const parentTag = this.semanticClasses.Tags.find((t) => t.uid === parentTagId)
        parentTagId = parentTag.parent
        if (parentTagId) {
          value = parentTag.name + '->' + value
        }
      }
      return value
    },
    itemChanged () {
      if (!this.item.tags) return
      this.semanticClass = ''
      this.semanticProperty = ''
      this.item.tags.forEach((t) => {
        if (this.semanticType(t) !== '') {
          this.semanticClass = t
        }
        if (this.isSemanticPropertyTag(t)) {
          this.semanticProperty = t
        }
      })
      if (this.semanticProperty && !this.semanticClass) {
        if (this.item.metadata && this.item.metadata.semantics) {
          const valueArray = this.item.metadata.semantics.value.split('_')
          const classFromMetadata = valueArray[valueArray.length - 1]
          if (classFromMetadata) {
            this.semanticClass = classFromMetadata
          }
        }
      }
    }
  },
  mounted () {
    this.itemChanged()
  }
}
</script>
