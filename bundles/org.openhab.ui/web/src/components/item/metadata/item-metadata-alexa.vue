<template>
  <div v-if="ready">
    <div v-if="itemType !== 'Group' && editable"
         style="text-align: right"
         class="padding-right">
      <label @click="toggleMultiple" style="cursor: pointer">Multiple</label>
      <f7-checkbox :checked="multiple ? true : null" @change="toggleMultiple" />
    </div>
    <f7-list>
      <f7-list-item
        :key="classSelectKey"
        :title="'Alexa Device Type' + (itemType !== 'Group' ? (!multiple ? '/Attribute' : '/Attributes') : '')"
        :disabled="!editable ? true : null"
        smart-select
        :smart-select-params="{openIn: 'popup', searchbar: true, closeOnSelect: !multiple, scrollToSelectedItem: true}"
        ref="classes">
        <select v-if="itemType === 'Group'" name="classes" @change="updateClasses">
          <option value="" />
          <option v-for="cl in orderedClasses"
                  :value="cl"
                  :key="cl"
                  :selected="isSelected(cl) ? true : null">
            {{ cl }}
          </option>
        </select>
        <select v-else
                name="classes"
                @change="updateClasses"
                :multiple="multiple">
          <option v-if="!multiple" value="" />
          <optgroup label="Default Attributes" v-if="!multiple">
            <option v-for="cl in defaultClasses"
                    :value="cl"
                    :key="cl"
                    :selected="isSelected(cl) ? true : null">
              {{ cl }}
            </option>
          </optgroup>
          <optgroup label="Specific Attributes">
            <option v-for="cl in specificClasses"
                    :value="cl"
                    :key="cl"
                    :selected="isSelected(cl) ? true : null"
                    :disabled="isDefined(cl) ? true : null">
              {{ cl }}
            </option>
          </optgroup>
          <optgroup label="Generic Attributes">
            <option v-for="cl in genericClasses"
                    :value="cl"
                    :key="cl"
                    :selected="isSelected(cl) ? true : null">
              {{ cl }}
            </option>
          </optgroup>
        </select>
      </f7-list-item>
      <f7-block-footer class="padding-left no-padding no-margin" v-if="isPartOfGroupEndpoint">
        <small v-html="`Part of group endpoint${item.groups.length > 1 ? 's' : ''}: ${groupLinks}`" />
      </f7-block-footer>
    </f7-list>
    <div>
      <config-sheet :parameterGroups="[]"
                    :parameters="parameters"
                    :configuration="metadata.config"
                    :read-only="!editable" />
    </div>
    <f7-block v-if="itemType === 'Group' && classes.length" class="padding-top no-padding no-margin">
      <f7-block-title class="padding-left">
        Group Endpoint Capabilities
      </f7-block-title>
      <f7-list>
        <f7-list-item v-for="cap in groupCapabilities"
                      :title="cap.name + (cap.isIgnored ? ' (Ignored)' : '')"
                      :after="cap.item"
                      :key="`${cap.name}:${cap.item}`"
                      :disabled="cap.isIgnored || !editable ? true : null"
                      :link="`/settings/items/${cap.item}/metadata/alexa`" />
      </f7-list>
      <f7-block-footer class="padding-left" v-if="!groupCapabilities.length">
        No direct group members of {{ item.name }} configured for Alexa
      </f7-block-footer>
    </f7-block>
    <p class="padding">
      <f7-link color="blue"
               external
               target="_blank"
               :href="docLink">
        Alexa Integration Documentation
      </f7-link>
    </p>
  </div>
  <div v-else class="text-align-center">
    <f7-preloader />
    <div>Loading...</div>
  </div>
</template>

<script>
import { utils } from 'framework7'

import AlexaDefinitions from '@/assets/definitions/metadata/alexa'
import ConfigSheet from '@/components/config/config-sheet.vue'
import ItemMetadataMixin from '@/components/item/metadata/item-metadata-mixin'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { mapStores } from 'pinia'

export default {
  props: {
    item: Object,
    metadata: Object
  },
  mixins: [ItemMetadataMixin],
  components: {
    ConfigSheet
  },
  data () {
    return {
      classesDefs: Object.keys(AlexaDefinitions),
      itemType: this.item.groupType || this.item.type,
      multiple: !!this.metadata.value && this.metadata.value.indexOf(',') > 0,
      classSelectKey: utils.id(),
      docUrl: `${useRuntimeStore().websiteUrl}/link/alexa`,
      ready: false
    }
  },
  mounted () {
    Promise.all([
      this.$oh.api.get('/rest/services/org.openhab.i18n/config'),
      ...this.item.groupNames.map((groupName) => this.$oh.api.get(`/rest/items/${groupName}?metadata=alexa`))
    ]).then(([regional, ...groups]) => {
      this.item.groups = groups
        .map((g) => ({ ...g, members: g.members.filter((mbr) => mbr.name !== this.item.name && mbr.metadata) }))
        .filter((g) => g.metadata && !g.groupType)
      this.item.settings = { regional }
      this.ready = true
    })
  },
  computed: {
    classes () {
      return this.metadata.value ? this.metadata.value.split(',') : []
    },
    orderedClasses () {
      return [...this.classesDefs]
        .filter((cl) => this.isVisible(cl) && this.supportsGroupType(cl) && !this.requiresGroupAttributes(cl))
        .sort((a, b) => a.localeCompare(b))
    },
    defaultClasses () {
      return this.orderedClasses.filter((cl) => cl.split('.').length === 1)
    },
    genericClasses () {
      return this.orderedClasses.filter((cl) => cl.split('.').length === 2 && this.supportsMultiInstance(cl))
    },
    specificClasses () {
      return this.orderedClasses.filter((cl) => cl.split('.').length === 2 && !this.supportsMultiInstance(cl))
    },
    parameters () {
      return this.classes.reduce((parameters, cl) => {
        const { parameters: params = [] } = this.getDefinition(cl)
        for (const p of params.map((p) => p(this.itemType, this.item, this.metadata.config)).flat()) {
          if (p.description) p.description = p.description.replace('%DOC_URL%', this.docUrl)
          if (!parameters.find((e) => e.name === p.name)) parameters.push(p)
        }
        return parameters
      }, [])
    },
    groupCapabilities () {
      return this.item.members
        .filter((mbr) => mbr.metadata && (mbr.groupType || mbr.type) !== 'Group')
        .reduce((caps, mbr, idx, arr) => caps.concat(
          mbr.metadata.alexa.value.split(',').map((cl) => ({
            name: cl.split('.').pop().trim() || 'N/A',
            item: mbr.name,
            isIgnored:
              !this.isSupportedGroupAttribute(cl) ||
              !this.hasRequiredGroupAttributes(cl, mbr, arr) ||
              (!this.supportsMultiInstance(cl) &&
                arr.findIndex((mbr) => mbr.metadata.alexa.value.split(',').includes(cl)) !== idx)
          }))
        ), [])
    },
    groupLinks () {
      return this.item.groups
        .map((g) => `<a class="text-color-blue" href="/settings/items/${g.name}/metadata/alexa">${g.label || g.name}</a>`)
        .join(', ')
    },
    isPartOfGroupEndpoint () {
      return this.itemType !== 'Group' && this.item.groups.length > 0
    },
    docLink () {
      if (this.itemType === 'Group') {
        return `${this.docUrl}#group-endpoint`
      } else if (this.classes.length === 0 || !this.classesDefs.includes(this.classes[0])) {
        return `${this.docUrl}#${this.isPartOfGroupEndpoint ? 'group-endpoint' : 'single-endpoint'}`
      } else if (this.classes[0].indexOf('.') >= 0) {
        return `${this.docUrl}#${this.classes[0].split('.')[1].toLowerCase()}`
      } else if (this.classes[0] === 'Scene' || this.classes[0] === 'Activity') {
        return `${this.docUrl}#${this.classes[0].toLowerCase()}`
      } else {
        return `${this.docUrl}#device-types`
      }
    },
    ...mapStores(useRuntimeStore)
  },
  methods: {
    isSelected (cl) {
      return this.classes.indexOf(cl) >= 0
    },
    isDefined (cl) {
      return this.item.groups.some((g) => g.members.some((mbr) => mbr.metadata.alexa.value.split(',').includes(cl)))
    },
    isSupportedGroupAttribute (cl) {
      return this.metadata.value === cl.split('.')[0] && this.classesDefs.includes(cl)
    },
    isVisible (cl) {
      const { visible = () => true } = this.getDefinition(cl)
      return this.hasDefinition(cl) && visible(this.item)
    },
    getDefinition (cl, item) {
      const itemType = item ? item.groupType || item.type : this.itemType
      const defTypes = Object.keys(AlexaDefinitions[cl] || {})
      const dt = defTypes.find((dt) => dt === itemType || (dt.endsWith('*') && itemType.startsWith(dt.slice(0, -1))))
      return (dt && AlexaDefinitions[cl][dt]) || {}
    },
    hasDefinition (cl, item) {
      return Object.keys(this.getDefinition(cl, item)).length > 0
    },
    hasRequiredGroupAttributes (cl, item, items) {
      const { requires = [] } = this.getDefinition(cl, item)
      const type = cl.split('.')[0]
      return requires.every((attr) => items.find((i) => i.metadata.alexa.value.split(',').includes(`${type}.${attr}`)))
    },
    requiresGroupAttributes (cl) {
      const { requires = [] } = this.getDefinition(cl)
      return !this.isPartOfGroupEndpoint && requires.length > 0
    },
    supportsGroupType (cl) {
      return !this.isPartOfGroupEndpoint || this.item.groups.some((g) => cl.startsWith(`${g.metadata.alexa.value}.`))
    },
    supportsMultiInstance (cl) {
      const { supports = [] } = this.getDefinition(cl)
      return supports.includes('multiInstance')
    },
    toggleMultiple () {
      this.multiple = !this.multiple
      if (this.metadata.value.indexOf(',') > 0) this.metadata.value = ''
      this.classSelectKey = utils.id()
    },
    updateClasses () {
      const value = this.$refs.classes.$el.children[0].f7SmartSelect.getValue()
      this.metadata.value = (Array.isArray(value)) ? value.join(',') : value
      this.metadata.config = {}
    }
  }
}
</script>
