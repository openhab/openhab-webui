<template>
  <f7-popup closeByBackdropClick closeOnEscape @popup:close="onClose">
    <f7-page>
      <f7-navbar :title="propertyMode ? 'Semantic Property' : 'Semantic Class'">
        <f7-nav-right>
          <f7-link @click="onClose">Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-searchbar search-container=".semantic-classes" :disable-button="!$theme.aurora" />
      <f7-list class="semantic-classes" inline-labels no-hairlines-md>
        <f7-list-item v-if="!hideNone"
                      radio radio-icon="start" :checked="semanticClass === ''"
                      title="None"
                      class="aligned-smart-select"
                      @change="update('class', '')"/>
        <template v-if="!propertyMode && ( !sameClassOnly || semanticClass === '' || (sameClassOnly && currentSemanticType === 'Location') )">
          <f7-list-item group-item title="Location" />
          <f7-list-item v-for="type in orderedLocations" :key="type"
                        radio radio-icon="start" :checked="type === semanticClass"
                        :title="type"
                        class="aligned-smart-select"
                        @change="update('class', type)">
            <template v-if="tooltip(type)" slot="after">
              <f7-icon class="tooltip-icon" f7="info_circle" ios="f7:info_circle" md="material:info" size="16px" :tooltip="tooltip(type)"/>
            </template>
          </f7-list-item>
        </template>
        <template v-if="!propertyMode && ( !sameClassOnly || semanticClass === '' || (sameClassOnly && currentSemanticType === 'Equipment') )">
          <f7-list-item group-item title="Equipment" />
          <f7-list-item v-for="type in orderedEquipment" :key="type"
                        radio radio-icon="start" :checked="type === semanticClass"
                        :tooltip="tooltip(type)"
                        :title="type"
                        class="aligned-smart-select"
                        @change="update('class', type)">
            <div v-if="tooltip(type)" slot="after-title">
              <f7-icon class="tooltip-icon" ios="f7:info_circle" md="material:info" />
            </div>
          </f7-list-item>
        </template>
        <template v-if="!propertyMode && ( !sameClassOnly || semanticClass === '' || (sameClassOnly && currentSemanticType === 'Point') )">
          <f7-list-item group-item title="Point" />
          <f7-list-item v-for="type in orderedPoints" :key="type"
                        radio radio-icon="start" :checked="type === semanticClass"
                        :tooltip="tooltip(type)"
                        :title="type"
                        class="aligned-smart-select"
                        @change="update('class', type)">
            <div v-if="tooltip(type)" slot="after-title">
              <f7-icon class="tooltip-icon" ios="f7:info_circle" md="material:info" />
            </div>
          </f7-list-item>
        </template>
        <template v-if="propertyMode">
          <f7-list-item group-item title="Point" />
          <f7-list-item v-for="type in orderedProperties" :key="type"
                        radio radio-icon="start" :checked="type === semanticProperty"
                        :tooltip="tooltip(type)"
                        :title="type"
                        class="aligned-smart-select"
                        @change="update('property', type)">
            <div v-if="tooltip(type)" slot="after-title">
              <f7-icon class="tooltip-icon" ios="f7:info_circle" md="material:info" />
            </div>
          </f7-list-item>
        </template>
      </f7-list>
    </f7-page>
  </f7-popup>
</template>

<script>
export default {
  props: ['propertyMode', 'item', 'currentSemanticType', 'semanticClass', 'semanticProperty', 'sameClassOnly', 'hideType', 'hideNone', 'createMode'],
  data () {
    return {
      semanticClasses: this.$store.getters.semanticClasses
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
    tooltip (type) {
      return this.semanticClasses.Descriptions[type] || ''
    },
    onClose() {
      this.$emit('close')
    }
  },
  computed: {
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
    }
  }
}
</script>
