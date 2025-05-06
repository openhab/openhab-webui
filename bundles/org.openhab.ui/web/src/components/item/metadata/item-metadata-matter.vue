<template>
  <div v-if="ready">
    <div>
      <div style="text-align:right" class="padding-right">
        <label @click="toggleMultiple" style="cursor:pointer">Multiple</label> <f7-checkbox :checked="multiple" @change="toggleMultiple" />
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
                v-if="shouldShowClusterMapping">
        <f7-block-title class="padding-left">
          Matter Clusters Mapping
        </f7-block-title>
        <f7-block v-for="deviceType in classesAsArray" :key="deviceType">
          <f7-block-title class="padding-left">
            {{ deviceType }}
          </f7-block-title>
          <f7-list v-if="deviceTypes[deviceType] && deviceTypes[deviceType].length">
            <f7-list-item v-for="cluster in deviceTypes[deviceType]"
                          :key="cluster.label"
                          smart-select
                          :title="cluster.mandatory ? cluster.label+'*' : cluster.label"
                          :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true }">
              <select @change="updateLinkedItem(deviceType, cluster.label, $event.target.value)">
                <option value="" />
                <option v-for="mbr in item.members"
                        :value="mbr.name"
                        :key="mbr.id"
                        :selected="isLinked(deviceType, cluster.label, mbr)">
                  {{ mbr.label }} ({{ mbr.name }})
                </option>
              </select>
            </f7-list-item>
          </f7-list>
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
import { deviceTypes, deviceTypesAndClusters, matterParameters, isComplexDeviceType } from '@/assets/definitions/metadata/matter'
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
      classesDefs: deviceTypesAndClusters,
      multiple: !!this.metadata.value && this.metadata.value.indexOf(',') > 0,
      classSelectKey: this.$f7.utils.id(),
      itemType: this.item.groupType || this.item.type,
      dirtyItem: new Set(),
      ready: false
    }
  },
  created () {
    console.log('Component created')
    console.log('Props:', this.item, this.itemName, this.metadata, this.namespace)
    console.log('ClassesDefs:', this.classesDefs)
    console.log('Device Types:', this.deviceTypes)

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
        console.log('Updated members:', this.item.members)
      })
    } else {
      this.ready = true
    }
  },
  computed: {
    classesAsArray () {
      console.log('Computing classesAsArray:', this.metadata.value)
      return (this.metadata.value) ? this.metadata.value.split(',') : []
    },
    classes () {
      console.log('Computing classes')
      if (!this.multiple) return this.metadata.value
      return this.classesAsArray
    },
    shouldShowClusterMapping () {
      // Show cluster mapping if:
      // 1. It's a Group item (regardless of groupType)
      // 2. Has selected device types
      // 3. At least one selected device type is complex
      return this.item.type === 'Group' &&
             this.classes &&
             this.classes.length &&
             this.classesAsArray.some(deviceType => isComplexDeviceType(deviceType))
    },
    parametersGroups () {
      console.log('Computing parametersGroups')
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
        // For non-group items, show all device types
        return Object.keys(this.deviceTypes)
      }

      if (this.multiple) {
        // For groups in multiple selection mode:
        // If it has a groupType, show all device types
        // If no groupType, only show complex device types
        return this.item.groupType
          ? Object.keys(this.deviceTypes)
          : Object.keys(this.deviceTypes).filter(type => isComplexDeviceType(type))
      }

      // For groups in single selection mode:
      // If it has a groupType, show all device types
      // If no groupType, only show complex device types
      return this.item.groupType
        ? Object.keys(this.deviceTypes)
        : Object.keys(this.deviceTypes).filter(type => isComplexDeviceType(type))
    },
    isLinked (deviceType, cluster, item) {
      if (item?.metadata?.matter?.value) {
        return item.metadata.matter.value.toLowerCase() ===
               `${deviceType}.${cluster}`.toLowerCase()
      }
      return false
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
    updateLinkedItem (deviceType, cluster, itemName) {
      if (!itemName) {
        // Handle unlinking
        const groupMbr = this.item.members.find(mbr =>
          mbr.metadata?.matter?.value?.toLowerCase() ===
          `${deviceType}.${cluster}`.toLowerCase()
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
        groupMbr.metadata.matter.value = `${deviceType}.${cluster}`
        this.dirtyItem.add(groupMbr)
      }
    },
    updatedLinkedItem () {
      Promise.all(
        Array.from(this.dirtyItem).map(item =>
          this.$oh.api.put(`/rest/items/${item.name}/metadata/matter`, {
            value: item.metadata.matter.value,
            config: item.metadata.matter.config || {}
          })
        )
      ).then(() => {
        this.dirtyItem.clear()
        this.$f7.toast.create({
          text: 'Group members updated',
          closeTimeout: 2000
        }).open()
      })
    }
  }
}
</script>
