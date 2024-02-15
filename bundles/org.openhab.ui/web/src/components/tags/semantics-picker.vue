<template>
  <f7-list inline-labels no-hairlines-md v-if="show">
    <f7-list-input :disabled="!editable" label="Semantic Class" type="select" :value="semanticClass" @input="update('class', $event.target.value)">
      <option v-if="!hideNone" value="">
        None
      </option>
      <optgroup label="Location" v-if="!sameClassOnly || semanticClass === '' || (sameClassOnly && currentSemanticType === 'Location')">
        <option v-for="type in orderedLocations" :key="type" :value="type">
          {{ type }}
        </option>
      </optgroup>
      <optgroup label="Equipment" v-if="!sameClassOnly || semanticClass === '' || (sameClassOnly && currentSemanticType === 'Equipment')">
        <option v-for="type in orderedEquipment" :key="type" :value="type">
          {{ type }}
        </option>
      </optgroup>
      <optgroup label="Point" v-if="!sameClassOnly || semanticClass === '' || (sameClassOnly && currentSemanticType === 'Point')">
        <option v-for="type in orderedPoints" :key="type" :value="type">
          {{ type }}
        </option>
      </optgroup>
    </f7-list-input>
    <f7-list-item v-if="currentSemanticType && !hideType" :disabled="!editable" title="Semantic Type" :after="currentSemanticType" />
    <f7-list-input v-if="currentSemanticType === 'Point'" :disabled="!editable" label="Semantic Property" type="select" :value="semanticProperty" @input="update('property', $event.target.value)">
      <option value="">
        None
      </option>
      <option v-for="type in orderedProperties" :key="type" :value="type">
        {{ type }}
      </option>
    </f7-list-input>
  </f7-list>
</template>

<script>
export default {
  props: ['item', 'sameClassOnly', 'hideType', 'hideNone', 'createMode'],
  data () {
    return {
      semanticClasses: this.$store.getters.semanticClasses,
      semanticClass: '',
      semanticProperty: '',
      show: true
    }
  },
  methods: {
    semanticType (tag) {
      if (this.semanticClasses.Locations.indexOf(tag) >= 0) return 'Location'
      if (this.semanticClasses.Equipment.indexOf(tag) >= 0) return 'Equipment'
      if (this.semanticClasses.Points.indexOf(tag) >= 0) return 'Point'
      return ''
    },
    isSemanticPropertyTag (tag) {
      return (this.semanticClasses.Properties.indexOf(tag) >= 0)
    },
    update (type, value) {
      if (type === 'property') {
        this.semanticProperty = value
      } else {
        this.semanticClass = value
      }
      this.item.tags = this.item.tags.filter((t) => !this.semanticType(t) && !this.isSemanticPropertyTag(t))
      if (this.semanticClass) this.item.tags.push(this.semanticClass)
      if (this.semanticType(this.semanticClass) === 'Point' && this.semanticProperty.length) {
        this.item.tags.push(this.semanticProperty)
      }
    },
    itemChanged (item) {
      this.show = false
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
      this.$nextTick(() => {
        this.show = true
      })
    }
  },
  mounted () {
    this.itemChanged(this.item)
  },
  watch: {
    item (val) {
      this.itemChanged(val)
    }
  },
  computed: {
    editable () {
      return this.createMode || (this.item && this.item.editable)
    },
    orderedLocations () {
      return [...this.semanticClasses.Locations].sort((a, b) => {
        return a.localeCompare(b)
      })
    },
    orderedEquipment () {
      return [...this.semanticClasses.Equipment].sort((a, b) => {
        return a.localeCompare(b)
      })
    },
    orderedPoints () {
      return [...this.semanticClasses.Points].sort((a, b) => {
        return a.localeCompare(b)
      })
    },
    orderedProperties () {
      return [...this.semanticClasses.Properties].sort((a, b) => {
        return a.localeCompare(b)
      })
    },
    currentSemanticType () {
      return this.semanticType(this.semanticClass)
    }
  }
}
</script>
