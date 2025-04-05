<template>
  <div v-if="ready">
    <div>
      <div style="text-align:right" class="padding-right">
        <label @click="toggleMultiple" style="cursor:pointer">Multiple</label> <f7-checkbox :checked="multiple" @change="toggleMultiple" />
      </div>
      <f7-list v-if="classesDefs && classesDefs.length">
        <f7-list-item :key="classSelectKey"
                      :title="(multiple) ? 'Matter Device Type' : 'Matter Device Type'" 
                      smart-select 
                      :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: !multiple }" 
                      ref="classes">
          <select v-if="itemType == 'Group'" name="parameters" @change="updateClasses" :multiple="multiple">
            <option v-if="!multiple" value="" />
            <option v-for="cl in classesDefs.filter((c) => c.indexOf('.')===-1)"
                    :value="cl" :key="cl"
                    :selected="isSelected(cl)">
              {{ cl }}
            </option>
          </select>
          <select v-else name="parameters" @change="updateClasses" :multiple="multiple">
            <option v-if="!multiple" value="" />
            <option v-for="cl in classesDefs"
                    :value="cl" :key="cl"
                    :selected="isSelected(cl)">
              {{ cl }}
            </option>
          </select>
        </f7-list-item>
      </f7-list>
      <div v-if="parameters && parameters.length">
        <config-sheet :parameterGroups="parametersGroups" :parameters="parameters" :configuration="metadata.config" />
      </div>
      <f7-block class="padding-top no-padding no-margin" v-if="itemType === 'Group' && classes && classes.length">
        <f7-block-title class="padding-left">
          Group Matter Clusters Mapping
        </f7-block-title>
        <f7-block v-for="cl in classesAsArray" :key="cl">
          <f7-block-title class="padding-left">
            {{ cl }}
          </f7-block-title>
          <f7-list v-if="accessories[cl]">
            <f7-list-item v-for="accessory in accessories[cl]" :key="accessory.label" 
                          smart-select 
                          :title="accessory.mandatory ? accessory.label+'*' : accessory.label" 
                          :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: !multiple }">
              <select @change="updateLinkedItem(cl, accessory.label, $event.target.value)">
                <option value="" />
                <option v-for="mbr in item.members" :value="mbr.name" :key="mbr.id" :selected="isLinked(cl, accessory.label, mbr)">
                  {{ mbr.label }} ({{ mbr.name }})
                </option>
              </select>
            </f7-list-item>
          </f7-list>
        </f7-block>
        <f7-block-footer>
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
import { deviceTypesAndClusters, matterParameters, deviceTypes } from '@/assets/definitions/metadata/matter'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  name: 'item-metadata-matter',
  props: ['item', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      accessories: deviceTypes,
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
    console.log('Accessories:', this.accessories)
    
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
      return (this.metadata.value) ? this.metadata.value.split(',') : []
    },
    parametersGroups () {
      console.log('Computing parametersGroups')
      if ((!this.classes) || (!this.multiple)) return []
      let parametersGroups = []
      this.classesAsArray.forEach(aType => {
        parametersGroups.push({ name: aType, label: aType })
      })
      return parametersGroups
    },
    parameters () {
      console.log('Computing parameters')
      if (!this.classes) return matterParameters.global || []
      if (!this.multiple) return matterParameters[this.classes] || matterParameters.global || []
      if ((this.multiple) && (this.itemType === 'Group') && (this.classesAsArray.length > 1)) {
        let options = []
        this.classesAsArray.forEach(aType => {
          const typeParams = matterParameters[aType] || []
          typeParams.forEach(opt => {
            opt.groupName = aType
            options.push(opt)
          })
        })
        return options.concat(matterParameters.global || [])
      }
      return matterParameters.global || []
    }
  },
  methods: {
    isLinked (accessoryClass, characteristic, item) {
      console.log('Checking link for:', accessoryClass, characteristic, item)
      if (item && item.metadata && item.metadata.matter) {
        const typeAndCharacteristic = (accessoryClass + '.' + characteristic).toLowerCase()
        const matterValue = item.metadata.matter.value.toLowerCase()
        console.log('Checking:', typeAndCharacteristic, 'against:', matterValue)
        return matterValue.split(',').some(value => 
          value.trim() === typeAndCharacteristic
        )
      }
      return false
    },
    isSelected (cl) {
      return (this.multiple) ? this.classes.indexOf(cl) >= 0 : this.classes === cl
    },
    toggleMultiple () {
      this.multiple = !this.multiple
      this.metadata.value = ''
      this.classSelectKey = this.$f7.utils.id()
    },
    updateClasses () {
      const value = this.$refs.classes.f7SmartSelect.getValue()
      this.metadata.value = (Array.isArray(value)) ? value.join(',') : value
      this.$set(this.metadata, 'config', {})
    },
    updateLinkedItem (accessoryType, accessoryCharacteristic, itemName) {
      const typeAndCharacteristic = (accessoryType + '.' + accessoryCharacteristic).toLowerCase()
      if (itemName) {
        const groupMbr = this.item.members.find(mbr => mbr.name === itemName)
        if (groupMbr) {
          if (!groupMbr.metadata) {
            this.$set(groupMbr, 'metadata', {})
          }
          if (!groupMbr.metadata.matter) {
            this.$set(groupMbr.metadata, 'matter', { value: '', config: {} })
          }
          if (groupMbr.metadata.matter.value) {
            groupMbr.metadata.matter.value = groupMbr.metadata.matter.value + ',' + typeAndCharacteristic
          } else {
            groupMbr.metadata.matter.value = typeAndCharacteristic
          }
          this.dirtyItem.add(groupMbr)
        }
      } else {
        const groupMbr = this.item.members.find(mbr => 
          mbr.metadata && 
          mbr.metadata.matter && 
          mbr.metadata.matter.value && 
          mbr.metadata.matter.value.toLowerCase().indexOf(typeAndCharacteristic) > 0
        )
        if (groupMbr) {
          let itemClasses = groupMbr.metadata.matter.value.toLowerCase().split(',')
          itemClasses = itemClasses.filter(tag => tag !== typeAndCharacteristic)
          groupMbr.metadata.matter.value = (Array.isArray(itemClasses)) ? itemClasses.join(',') : itemClasses
          this.dirtyItem.add(groupMbr)
        }
      }
    },
    updatedLinkedItem () {
      this.dirtyItem.forEach(it =>
        this.$oh.api.put(`/rest/items/${it.name}/metadata/matter`, it.metadata.matter).then((data) => {
          this.$f7.toast.create({
            text: 'Metadata of group items updated. Please visit the items to review additional Matter configuration parameters.',
            destroyOnClose: true,
            closeTimeout: 3000
          }).open()
        })
      )
      this.dirtyItem.clear()
    }
  }
}
</script> 