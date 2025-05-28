<template>
  <div v-if="ready">
    <div>
      <div style="text-align:right" class="padding-right">
        <label @click="toggleMultiple" style="cursor:pointer">Multiple</label>
        <f7-checkbox :checked="multiple" @change="toggleMultiple" />
      </div>
      <f7-list v-if="deviceTypes">
        <f7-list-item :key="classSelectKey"
                      :title="'Matter Device Type'"
                      smart-select
                      :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: !multiple }"
                      ref="classes">
          <select name="parameters" @change="updateClasses" :multiple="multiple">
            <option v-if="!multiple" value="" />
            <option v-for="deviceType in getAvailableDeviceTypes()"
                    :value="deviceType"
                    :key="deviceType"
                    :selected="isSelected(deviceType)">
              {{ deviceType }}
            </option>
          </select>
        </f7-list-item>
      </f7-list>
      <div v-if="parameters && parameters.length">
        <config-sheet :parameterGroups="parametersGroups" :parameters="parameters" :configuration="metadata.config" />
      </div>
      <f7-block class="padding-top no-padding no-margin"
                v-if="shouldShowAttributeMapping">
        <f7-block-title class="padding-horizontal" medium>
          Matter Attributes Mapping
        </f7-block-title>
        <f7-block-footer v-if="dirtyItem.size">
          <f7-button color="blue" @click="updatedLinkedItem">
            Update group members
          </f7-button>
        </f7-block-footer>
        <f7-block v-for="deviceType in classesAsArray" :key="deviceType" class="no-padding">
          <f7-block-title class="padding-left">
            {{ deviceType }}
          </f7-block-title>
          <f7-list>
            <f7-list-item v-for="attribute in deviceTypes[deviceType]?.attributes"
                          :key="attribute.name"
                          smart-select
                          :title="attribute.mandatory ? attribute.label+'*' : attribute.label"
                          :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true }">
              <select @change="updateLinkedItem(deviceType, attribute.name, $event.target.value)">
                <option value="" />
                <option v-for="mbr in item.members"
                        :value="mbr.name"
                        :key="mbr.id"
                        :selected="isLinked(deviceType, attribute.name, mbr)">
                  {{ mbr.label }} ({{ mbr.name }})
                </option>
              </select>
            </f7-list-item>
          </f7-list>
          <!-- Option mapping UI: separate from item mapping list -->
          <div v-for="attribute in deviceTypes[deviceType]?.attributes"
               :key="attribute.name + '-mapping'">
            <template v-if="getMappedChild(attribute.name) && getAttributeOptions(attribute.name, deviceType).length">
              <div class="option-mapping-fields padding-left padding-bottom">
                <div class="padding-bottom padding-top">
                  <b>Mapping options for {{ attribute.label }}</b>
                </div>
                <f7-list no-hairlines-md>
                  <f7-list-input
                    v-for="option in getAttributeOptions(attribute.name, deviceType)"
                    :key="option.label"
                    type="text"
                    :label="option.label"
                    :value="getChildMapping(attribute.name, option.label, option.value)"
                    @input="setChildMapping(attribute.name, option.label, $event.target.value)" />
                </f7-list>
              </div>
            </template>
          </div>
        </f7-block>
        <f7-block-footer>
          <small class="text-color-gray">* indicates mandatory mapping</small>
        </f7-block-footer>
        <f7-block-footer v-if="dirtyItem.size">
          <f7-button color="blue" @click="updatedLinkedItem">
            Update group members
          </f7-button>
        </f7-block-footer>
      </f7-block>
      <p class="padding">
        <f7-link color="blue" external target="_blank" :href="`${$store.state.websiteUrl}/link/matter`">
          Matter integration documentation
        </f7-link>
      </p>
    </div>
  </div>
  <div v-else class="text-align-center">
    <f7-preloader />
    <div>Loading...</div>
  </div>
</template>

<script>
import { deviceTypes, deviceTypesAndAttributes, matterParameters } from '@/assets/definitions/metadata/matter'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  name: 'item-metadata-matter',
  props: ['item', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      deviceTypes,
      classesDefs: deviceTypesAndAttributes,
      multiple: !!this.metadata.value && this.metadata.value.indexOf(',') > 0,
      classSelectKey: this.$f7.utils.id(),
      itemType: this.item.groupType || this.item.type,
      dirtyItem: new Set(),
      ready: false
    }
  },
  created () {
    this.multiple = !!this.metadata.value && this.metadata.value.indexOf(',') > 0
    this.itemType = this.item.groupType || this.item.type

    if (!this.metadata.config) {
      this.$set(this.metadata, 'config', {})
    }
  },
  mounted () {
    if (this.itemType === 'Group' && this.item.members) {
      Promise.all(
        this.item.members.map(member =>
          this.$oh.api.get(`/rest/items/${member.name}?metadata=matter`)
        )
      ).then(responses => {
        this.item.members = this.item.members.map((member, index) => {
          return {
            ...member,
            metadata: responses[index].metadata || {}
          }
        })
        this.ready = true
        console.debug('Updated members:', this.item.members)
      })
    } else {
      this.ready = true
    }
  },
  computed: {
    classesAsArray () {
      return (this.metadata.value) ? this.metadata.value.split(',') : []
    },
    classes () {
      if (!this.multiple) return this.metadata.value
      return this.classesAsArray
    },
    shouldShowAttributeMapping () {
      // Show attribute mapping if:
      // 1. It's a Group item (regardless of groupType)
      // 2. Has selected device types
      // 3. At least one selected device type has attributes defined
      return this.item.type === 'Group' &&
             this.classes &&
             this.classes.length &&
             this.classesAsArray.some(deviceType => this.deviceTypes[deviceType]?.attributes?.length > 0)
    },
    parametersGroups () {
      if ((!this.classes) || (!this.multiple)) return []
      return this.classesAsArray.map(type => ({ name: type, label: type }))
    },
    parameters () {
      if (!this.classes) return matterParameters.global || []

      if (!this.multiple) {
        return matterParameters[this.classes] || matterParameters.global || []
      }

      // For multiple selection, show parameters for all selected types
      return this.classesAsArray.flatMap(type => {
        const typeParams = matterParameters[type] || []
        return typeParams.map(opt => ({ ...opt, groupName: type }))
      }).concat(matterParameters.global || [])
    }
  },
  methods: {
    getAvailableDeviceTypes () {
      if (this.item.type !== 'Group') {
        return Object.keys(this.deviceTypes).filter(type => {
          const device = this.deviceTypes[type]
          return device.attributes.length === 0 || device.supportsSimpleMapping === true
        })
      }

      if (this.multiple) {
        return this.item.groupType
          ? Object.keys(this.deviceTypes)
          : Object.keys(this.deviceTypes).filter(type => this.deviceTypes[type]?.attributes?.length > 0)
      }

      return this.item.groupType
        ? Object.keys(this.deviceTypes)
        : Object.keys(this.deviceTypes).filter(type => this.deviceTypes[type]?.attributes?.length > 0)
    },
    isLinked (deviceType, attribute, item) {
      if (!item?.metadata?.matter?.value) return false

      const value = item.metadata.matter.value.toLowerCase()
      return attribute === null ? value === deviceType.toLowerCase() : value === attribute.toLowerCase()
    },
    isSelected (deviceType) {
      return this.multiple
        ? this.classes.includes(deviceType)
        : this.classes === deviceType
    },
    toggleMultiple () {
      this.multiple = !this.multiple
      this.metadata.value = ''
      this.classSelectKey = this.$f7.utils.id()
    },
    updateClasses () {
      const value = this.$refs.classes.f7SmartSelect.getValue()
      this.metadata.value = Array.isArray(value) ? value.join(',') : value
      this.$set(this.metadata, 'config', {})
    },
    updateLinkedItem (deviceType, attribute, itemName) {
      if (!itemName) {
        // Handle unlinking
        const groupMbr = this.item.members.find(mbr =>
          mbr.metadata?.matter?.value?.toLowerCase() ===
          attribute.toLowerCase()
        )
        if (groupMbr) {
          groupMbr.metadata.matter.value = ''
          this.dirtyItem.add(groupMbr)
        }
        return
      }

      // Handle linking
      const groupMbr = this.item.members.find(mbr => mbr.name === itemName)
      if (groupMbr) {
        if (!groupMbr.metadata) {
          this.$set(groupMbr, 'metadata', {})
        }
        if (!groupMbr.metadata.matter) {
          this.$set(groupMbr.metadata, 'matter', { value: '', config: {} })
        }
        groupMbr.metadata.matter.value = attribute
        this.dirtyItem.add(groupMbr)
      }
    },
    updatedLinkedItem () {
      Promise.all(
        Array.from(this.dirtyItem).map(item => {
          if (!item.metadata.matter.value) {
            // If value is empty, send DELETE
            return this.$oh.api.delete(`/rest/items/${item.name}/metadata/matter`)
          } else {
            return this.$oh.api.put(`/rest/items/${item.name}/metadata/matter`, {
              value: item.metadata.matter.value,
              config: item.metadata.matter.config || {}
            })
          }
        })
      ).then(() => {
        this.dirtyItem.clear()
        this.$f7.toast.create({
          text: 'Group members updated',
          closeTimeout: 2000
        }).open()
      })
        .catch(err => {
          console.error('Failed to update group members:', err)
        })
    },
    getMappedChild (attributeName) {
      // Return the child item mapped to this attribute (all lowercase)
      const attr = attributeName.toLowerCase()
      return this.item.members && this.item.members.find(mbr =>
        mbr.metadata?.matter?.value?.toLowerCase() === attr
      )
    },
    getAttributeOptions (attributeName, deviceType) {
      // Find the attribute in deviceTypes and return its mapping options if present
      const type = this.deviceTypes[deviceType]
      if (!type || !type.attributes) return []
      const attr = type.attributes.find(a => a.name.toLowerCase() === attributeName.toLowerCase())
      if (attr && attr.mapping && attr.mapping.options) {
        return attr.mapping.options
      }
      return []
    },
    getChildMapping (attributeName, optionLabel, optionValue) {
      // Get the mapped value for this option from the mapped child's metadata.config
      const mappedChild = this.getMappedChild(attributeName)
      if (!mappedChild) return optionValue
      const attr = attributeName.toLowerCase()
      if (!mappedChild.metadata.matter.config) return optionValue
      if (!mappedChild.metadata.matter.config[attr]) return optionValue
      // config[attr] is an object: { optionLabel: mappedValue, ... }
      return mappedChild.metadata.matter.config[attr][optionLabel] || optionValue
    },
    setChildMapping (attributeName, optionLabel, newValue) {
      // Set the mapped value for this option in the mapped child's metadata.config
      const mappedChild = this.getMappedChild(attributeName)
      if (!mappedChild) return
      const attr = attributeName.toLowerCase()
      if (!mappedChild.metadata.matter.config) this.$set(mappedChild.metadata.matter, 'config', {})
      if (!mappedChild.metadata.matter.config[attr]) this.$set(mappedChild.metadata.matter.config, attr, {})
      this.$set(mappedChild.metadata.matter.config[attr], optionLabel, newValue)
      this.dirtyItem.add(mappedChild)
    }
  }
}
</script>
