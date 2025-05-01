<template>
  <f7-list inline-labels no-hairlines-md>
    <f7-list-item title="Semantic Class"
                  :after="semanticClass || 'None'"
                  :disabled="!editable"
                  @click="openPopup('class')"
                  class="aligned-smart-select" :link="editable" />
    <f7-list-item v-if="currentSemanticType === 'Point'" title="Semantic Property"
                  :after="semanticProperty || 'None'"
                  :disabled="!editable"
                  @click="openPopup('property')"
                  class="aligned-smart-select" :link="editable" />
    <semantics-picker-popup
      ref="classPopup" :key="'semantics-class'"
      v-if="popupType === 'class'"
      :item="item"
      :hideNone="hideNone"
      :semanticClass="semanticClass"
      @changed="itemChanged"
      @close="closePopup" />
    <semantics-picker-popup
      ref="propertyPopup" :key="'semantics-property'"
      v-if="popupType === 'property'"
      :item="item"
      :hideNone="hideNone"
      propertyMode="true"
      @changed="itemChanged"
      :semanticProperty="semanticProperty"
      @close="closePopup" />
  </f7-list>
</template>

<script>
import TagMixin from '@/components/tags/tag-mixin'
import SemanticsPickerPopup from '@/components/tags/semantics-picker-popup.vue'

export default {
  mixins: [TagMixin],
  props: ['item', 'hideNone'],
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
    semanticType (tagName) {
      if (this.semanticClasses.Locations.indexOf(tagName) >= 0) return 'Location'
      if (this.semanticClasses.Equipment.indexOf(tagName) >= 0) return 'Equipment'
      if (this.semanticClasses.Points.indexOf(tagName) >= 0) return 'Point'
      return ''
    },
    isSemanticPropertyTag (tagName) {
      return (this.semanticClasses.Properties.indexOf(tagName) >= 0)
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
          const classFromMetadata = this.item.metadata.semantics.value.split('_')[1]
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
