<template>
  <div>
    <f7-list>
      <f7-list-item :key="classSelectKey"
                    title="Google Assistant Class"
                    :disabled="!editable ? true : null"
                    smart-select
                    :smart-select-params="{
                      openIn: 'popup',
                      searchbar: true,
                      closeOnSelect: true,
                      scrollToSelectedItem: true,
                    }"
                    ref="classes">
        <select name="classes" @change="updateClass">
          <option value="" />
          <optgroup label="Types">
            <option v-for="cl in orderedClasses.filter((c) => c.indexOf('type:') === 0)"
                    :value="cl.replace('type:', '')"
                    :key="cl"
                    :selected="isSelected(cl.replace('type:', '')) ? true : null">
              {{ cl.replace('type:', '') }}
            </option>
          </optgroup>
          <optgroup label="Attributes">
            <option v-for="cl in orderedClasses.filter((c) => c.indexOf('attribute:') === 0)"
                    :value="cl.replace('attribute:', '')"
                    :key="cl"
                    :selected="isSelected(cl.replace('attribute:', '')) ? true : null">
              {{ cl.replace('attribute:', '') }}
            </option>
          </optgroup>
        </select>
      </f7-list-item>
    </f7-list>
    <div>
      <config-sheet :parameterGroups="[]"
                    :parameters="parameters"
                    :configuration="metadata.config"
                    :read-only="!editable" />
    </div>
    <p class="padding">
      <f7-link color="blue"
               external
               target="_blank"
               :href="`${runtimeStore.websiteUrl}/link/google-assistant`">
        Google Assistant Integration Documentation
      </f7-link>
    </p>
  </div>
</template>

<script>
import { f7 } from 'framework7-vue'
import { mapStores } from 'pinia'

import GoogleDefinitions from '@/assets/definitions/metadata/ga'
import ConfigSheet from '@/components/config/config-sheet.vue'
import ItemMetadataMixin from '@/components/item/metadata/item-metadata-mixin'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

export default {
  props: {
    itemName: String,
    metadata: Object
  },
  mixins: [ItemMetadataMixin],
  components: {
    ConfigSheet
  },
  data () {
    return {
      classesDefs: Object.keys(GoogleDefinitions),
      classSelectKey: f7.utils.id()
    }
  },
  computed: {
    classes () {
      return this.metadata.value
    },
    orderedClasses () {
      return [...this.classesDefs].sort((a, b) => {
        return a.localeCompare(b)
      })
    },
    parameters () {
      if (!this.metadata.value) return []
      return GoogleDefinitions['type:' + this.metadata.value] || GoogleDefinitions['attribute:' + this.metadata.value]
    },
    ...mapStores(useRuntimeStore)
  },
  methods: {
    isSelected (cl) {
      return this.classes === cl
    },
    updateClass () {
      const value = this.$refs.classes.$el.children[0].f7SmartSelect.getValue()
      this.metadata.value = value
      this.metadata.config = {}
    }
  }
}
</script>
