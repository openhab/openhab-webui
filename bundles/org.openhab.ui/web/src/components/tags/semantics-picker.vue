<template>
  <f7-list inline-labels no-hairlines-md>
    <f7-list-item title="Semantic Class"
                  :after="semanticClass || 'None'"
                  :disabled="!editable"
                  @click="openPopup('class')"
                  class="aligned-smart-select" :link="editable" />
    <f7-list-item v-if="currentSemanticType" title="Semantic Property" :after="semanticProperty || 'None'"
                  :disabled="!editable || currentSemanticType !== 'Point'"
                  @click="openPopup('property')"
                  class="aligned-smart-select" :link="editable" />
    <semantics-picker-popup :key="'semantics-class-' + item.tags.toString()"
      ref="classPopup"
      v-if="popupType === 'class'"
      :item="item"
      :sameClassOnly="sameClassOnly"
      :hideType="hideType"
      :hideNone="hideNone"
      :createMode="createMode"
      :currentSemanticType="currentSemanticType"
      :semanticClass="semanticClass"
      @close="closePopup"
    />
    <semantics-picker-popup
      ref="propertyPopup" :key="'semantics-property-' + item.tags.toString()"
      v-if="popupType === 'property' && currentSemanticType === 'Point'"
      :item="item"
      :sameClassOnly="sameClassOnly"
      :hideType="hideType"
      :hideNone="hideNone"
      :createMode="createMode"
      :semanticProperty="semanticProperty"
      @close="closePopup"
      property-mode
    />
  </f7-list>
</template>

<script>
import SemanticsPickerPopup from '@/components/tags/semantics-picker-popup.vue'

export default {
  mixins: [TagMixin],
  props: ['item', 'sameClassOnly', 'hideType', 'hideNone', 'createMode'],
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
    openPopup(type) {
      if (!this.editable) return
      this.popupType = type
      this.$nextTick(() => {
        const popupRef = type === 'class' ? 'classPopup' : 'propertyPopup'
        const popupEl = this.$refs[popupRef]?.$el
        if (popupEl) this.$f7.popup.open(popupEl)
      })
    },
    closePopup() {
      this.popupType = null
    },
    semanticType (tag) {
      if (this.semanticClasses.Locations.indexOf(tag) >= 0) return 'Location'
      if (this.semanticClasses.Equipment.indexOf(tag) >= 0) return 'Equipment'
      if (this.semanticClasses.Points.indexOf(tag) >= 0) return 'Point'
      return ''
    },
    isSemanticPropertyTag (tag) {
      return (this.semanticClasses.Properties.indexOf(tag) >= 0)
    },
    itemChanged (item) {
      if (!item.tags) return
      this.semanticClass = ''
      this.semanticProperty = ''
      item.tags.forEach((t) => {
        if (this.semanticType(t) !== '') {
          this.semanticClass = t
        }
        if (this.isSemanticPropertyTag(t)) {
          this.semanticProperty = t
        }
      })
      if (this.semanticProperty && !this.semanticClass) {
        if (item.metadata && item.metadata.semantics) {
          const classFromMetadata = item.metadata.semantics.value.split('_')[1]
          if (classFromMetadata) {
            this.semanticClass = classFromMetadata
          }
        }
      }
    }
  },
  mounted () {
    this.itemChanged(this.item)
  }
}
</script>
