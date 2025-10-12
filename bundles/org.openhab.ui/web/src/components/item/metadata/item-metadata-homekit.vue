<template>
  <div>
    <div v-if="editable" style="text-align: right" class="padding-right">
      <label @click="toggleMultiple" style="cursor: pointer">Multiple</label>
      <f7-checkbox :checked="multiple ? true : null" @change="toggleMultiple" />
    </div>
    <f7-list>
      <f7-list-item :key="classSelectKey"
                    :title="(multiple) ? 'HomeKit Accessory/Characteristics' : 'HomeKit Accessory/Characteristic'"
                    :disabled="!editable ? true : null"
                    smart-select
                    :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: !multiple }"
                    ref="classes">
        <select v-if="itemType == 'Group'"
                name="parameters"
                @change="updateClasses"
                :multiple="multiple">
          <option v-if="!multiple" value="" />
          <option v-for="cl in classesDefs.filter((c) => c.indexOf('.') === -1).filter((c) => c.indexOf('label:') !== 0)"
                  :value="cl"
                  :key="cl"
                  :selected="isSelected(cl) ? true : null">
            {{ cl }}
          </option>
        </select>
        <select v-else
                name="parameters"
                @change="updateClasses"
                :multiple="multiple">
          <option v-if="!multiple" value="" />
          <option v-for="cl in classesDefs.filter((c) => c.indexOf('label:') !== 0)"
                  :value="cl"
                  :key="cl"
                  :selected="isSelected(cl) ? true : null">
            {{ cl }}
          </option>
        </select>
      </f7-list-item>
    </f7-list>
    <div>
      <config-sheet :parameterGroups="parametersGroups"
                    :parameters="parameters"
                    :configuration="metadata.config"
                    :read-only="!editable" />
    </div>
    <f7-block v-if="itemType === 'Group' && classes.length"
              class="padding-top no-padding no-margin">
      <f7-block-title class="padding-left">
        Group HomeKit Characteristics Mapping
      </f7-block-title>
      <f7-block v-for="cl in classesAsArray" :key="cl">
        <f7-block-title class="padding-left">
          {{ cl }}
        </f7-block-title>
        <f7-list>
          <f7-list-item v-for="accessory in accessories[cl]"
                        :key="accessory.label"
                        :disabled="!editable ? true : null"
                        smart-select
                        :title="accessory.mandatory ? accessory.label + '*' : accessory.label"
                        :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: !multiple }">
            <select @change="updateLinkedItem(cl, accessory.label, $event.target.value)">
              <option value="" />
              <option v-for="mbr in item.members"
                      :value="mbr.name"
                      :key="mbr.id"
                      :selected="isLinked(cl, accessory.label, mbr) ? true : null">
                {{ mbr.label }} ({{ mbr.name }})
              </option>
            </select>
          </f7-list-item>
        </f7-list>
      </f7-block>
      <f7-block-footer v-if="editable">
        <f7-button color="blue" @click="updatedLinkedItem">
          Update group members
        </f7-button>
      </f7-block-footer>
    </f7-block>
    <p class="padding">
      <f7-link color="blue"
               external
               target="_blank"
               :href="`${$store.state.websiteUrl}/link/homekit`">
        HomeKit integration documentation
      </f7-link>
    </p>
  </div>
</template>

<script>
import { accessoriesAndCharacteristics, homekitParameters, accessories } from '@/assets/definitions/metadata/homekit'
import ConfigSheet from '@/components/config/config-sheet.vue'
import ItemMetadataMixin from '@/components/item/metadata/item-metadata-mixin'

export default {
  props: {
    item: Object,
    itemName: String,
    metadata: Object
  },
  mixins: [ItemMetadataMixin],
  components: {
    ConfigSheet
  },
  data () {
    return {
      accessories,
      classesDefs: accessoriesAndCharacteristics,
      multiple: !!this.metadata.value && this.metadata.value.indexOf(',') > 0,
      classSelectKey: this.$f7.utils.id(),
      itemType: this.item.groupType || this.item.type,
      dirtyItem: new Set()
    }
  },
  computed: {
    classesAsArray () {
      return (this.metadata.value) ? this.metadata.value.split(',') : []
    },
    classes () {
      if (!this.multiple) return this.metadata.value
      return (this.metadata.value) ? this.metadata.value.split(',') : []
    },
    parametersGroups () {
      if ((!this.classes) || (!this.multiple)) return []
      let parametersGroups = []
      this.classesAsArray.forEach((aType) => {
        parametersGroups.push({ name: aType, label: aType })
      })
      return parametersGroups
    },
    parameters () {
      if (!this.classes) return []
      if (!this.multiple) return homekitParameters[this.classes]
      if ((this.multiple) && (this.itemType === 'Group') && (this.classesAsArray.length > 1)) {
        let options = []
        let primaryOptions = []
        this.classesAsArray.forEach((aType) => {
          primaryOptions.push({ value: aType, label: aType })
          homekitParameters[aType].forEach((opt) => {
            opt.groupName = aType
            options.push(opt)
          })
        })
        options.push({ name: 'primary', label: 'Primary Accessory Type', type: 'TEXT', limitToOptions: true, options: primaryOptions })
        return options
      }
      return []
    }
  },

  methods: {
    isLinked (accessoryClass, characteristic, item) {
      if ((item.metadata) && (item.metadata.homekit)) {
        return item.metadata.homekit.value.indexOf(characteristic) >= 0
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
      const typeAndCharacteristic = accessoryType + '.' + accessoryCharacteristic
      if (itemName) {
        const groupMbr = this.item.members.find((mbr) => mbr.name === itemName)
        if (groupMbr) {
          if (groupMbr.metadata.homekit.value) {
            groupMbr.metadata.homekit.value = groupMbr.metadata.homekit.value + ',' + typeAndCharacteristic
          } else {
            groupMbr.metadata.homekit.value = typeAndCharacteristic
          }
          this.dirtyItem.add(groupMbr)
        }
      } else {
        const groupMbr = this.item.members.find((mbr) => mbr.metadata.homekit.value.indexOf(typeAndCharacteristic) > 0)
        if (groupMbr) {
          let itemClasses = groupMbr.metadata.homekit.value.split(',')
          itemClasses = itemClasses.filter((tag) => tag !== typeAndCharacteristic)
          groupMbr.metadata.homekit.value = (Array.isArray(itemClasses)) ? itemClasses.join(',') : itemClasses
          this.dirtyItem.add(groupMbr)
        }
      }
    },
    updatedLinkedItem () {
      this.dirtyItem.forEach((it) =>
        this.$oh.api.put(`/rest/items/${it.name}/metadata/homekit`, it.metadata.homekit).then((data) => {
          this.$f7.toast.create({
            text: 'Metadata of group items updated. Please visit the items to review additional HomeKit configuration parameters.',
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
