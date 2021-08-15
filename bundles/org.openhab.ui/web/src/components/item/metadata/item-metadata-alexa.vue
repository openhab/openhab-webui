<template>
  <div>
    <div style="text-align:right" class="padding-right" v-if="itemType !== 'Group'">
      <label @click="toggleMultiple" style="cursor:pointer">Multiple</label>
      <f7-checkbox :checked="multiple" @change="toggleMultiple" />
    </div>
    <f7-list v-if="ready">
      <f7-list-item
        :key="classSelectKey"
        :title="'Alexa Device Type' + (itemType !== 'Group' ? !multiple ? '/Attribute' : '/Attributes' : '')"
        smart-select
        :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: !multiple, scrollToSelectedItem: true }"
        ref="classes">
        <select v-if="itemType === 'Group'" name="classes" @change="updateClasses">
          <option value="" />
          <option v-for="cl in orderedClasses" :value="cl" :key="cl" :selected="isSelected(cl)">
            {{ cl }}
          </option>
        </select>
        <select v-else name="classes" @change="updateClasses" :multiple="multiple">
          <option v-if="!multiple" value="" />
          <optgroup label="Default Attributes" v-if="!multiple">
            <option v-for="cl in defaultClasses" :value="cl" :key="cl" :selected="isSelected(cl)">
              {{ cl }}
            </option>
          </optgroup>
          <optgroup label="Specific Attributes">
            <option v-for="cl in specificClasses" :value="cl" :key="cl" :selected="isSelected(cl)" :disabled="isDefined(cl)">
              {{ cl }}
            </option>
          </optgroup>
          <optgroup label="Generic Attributes" v-if="!multiple">
            <option v-for="cl in genericClasses" :value="cl" :key="cl" :selected="isSelected(cl)">
              {{ cl }}
            </option>
          </optgroup>
        </select>
      </f7-list-item>
      <f7-block-footer class="padding-left no-padding no-margin" v-if="item.groups.length">
        <small>Part of group endpoint{{ item.groups.length > 1 ? 's' : '' }}: {{ groupsDescription }}</small>
      </f7-block-footer>
    </f7-list>
    <div v-if="ready">
      <config-sheet :parameterGroups="[]" :parameters="parameters" :configuration="metadata.config" />
    </div>
    <f7-block class="padding-top no-padding no-margin" v-if="itemType === 'Group' && classes.length">
      <f7-block-title>Group Endpoint Capabilities</f7-block-title>
      <f7-block-footer v-if="!groupCapabilities.length">
        No direct group members of {{ item.name }} configured for Alexa
      </f7-block-footer>
      <f7-list>
        <f7-list-item
          v-for="cap in groupCapabilities"
          :title="cap.name + (cap.isIgnored ? ' (Ignored)' : '')"
          :after="cap.item"
          :key="`${cap.name}:${cap.item}`"
          :disabled="cap.isIgnored"
          :link="`/settings/items/${cap.item}/metadata/alexa`" />
      </f7-list>
    </f7-block>
    <p class="padding">
      <f7-link color="blue" external target="_blank" :href="link">
        Alexa Integration Documentation
      </f7-link>
    </p>
  </div>
</template>

<script>
import AlexaDefinitions from '@/assets/definitions/metadata/alexa'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  props: ['item', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      classesDefs: Object.keys(AlexaDefinitions),
      itemType: this.item.groupType || this.item.type,
      multiple: !!this.metadata.value && this.metadata.value.indexOf(',') > 0,
      classSelectKey: this.$f7.utils.id(),
      ready: false
    }
  },
  created () {
    Promise.all([
      this.$oh.api.get('/rest/services/org.openhab.i18n/config'),
      ...(this.itemType !== 'Group'
        ? this.item.groupNames.map((groupName) => this.$oh.api.get(`/rest/items/${groupName}?metadata=alexa`))
        : [])
    ]).then(([regional, ...groups]) => {
      this.item.settings = { regional }
      this.item.groups = groups
        .map((g) => ({ ...g, members: g.members.filter((mbr) => mbr.name !== this.item.name && mbr.metadata) }))
        .filter((g) => g.metadata)
      this.ready = true
    })
  },
  computed: {
    classes () {
      return this.metadata.value ? this.metadata.value.split(',') : []
    },
    orderedClasses () {
      return [...this.classesDefs]
        .filter((cl) => this.supportsItemType(cl) && this.supportsGroupType(cl) && !this.requiresGroupAttributes(cl))
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
        const def = AlexaDefinitions[cl]
        const params = def ? this.itemType === 'Group' ? def.groupParameters : def.parameters : []
        for (const p of params.map((p) => p(this.item, this.metadata.config)).flat()) {
          if (!parameters.find((e) => e.name === p.name)) parameters.push(p)
        }
        return parameters
      }, [])
    },
    groupCapabilities () {
      return this.item.members
        .filter((mbr) => mbr.metadata && mbr.metadata.alexa)
        .reduce((caps, mbr, idx, arr) => caps.concat(
          mbr.metadata.alexa.value.split(',').map((cl) => ({
            name: cl.split('.').pop().trim() || 'N/A',
            item: mbr.name,
            isIgnored:
              !this.isSupportedGroupAttribute(cl) ||
              !this.hasRequiredGroupAttributes(cl, arr) ||
              (!this.supportsMultiInstance(cl) &&
                arr.findIndex((mbr) => mbr.metadata.alexa.value.split(',').includes(cl)) !== idx)
          }))
        ), [])
    },
    groupsDescription () {
      return this.item.groups.map((g) => `${g.label || g.name} (${g.metadata.alexa.value})`).join(', ')
    },
    link () {
      return 'https://www.openhab.org/link/alexa#'.concat(
        this.itemType === 'Group'
          ? 'group-endpoint'
          : this.classes.length === 0 || !this.classesDefs.includes(this.classes[0])
            ? this.item.groups.length
              ? 'group-endpoint'
              : 'single-endpoint'
            : this.classes[0].indexOf('.') === -1
              ? this.classes[0] === 'Scene' || this.classes[0] === 'Activity'
                ? this.classes[0].toLowerCase()
                : 'device-types'
              : this.classes[0].split('.')[1].toLowerCase()
      )
    }
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
    getAlexaDef (cl) {
      return AlexaDefinitions[cl] || {}
    },
    hasRequiredGroupAttributes (cl, items) {
      const requires = this.getAlexaDef(cl).requires || []
      const type = cl.split('.')[0]
      return requires.every((attr) => items.find((i) => i.metadata.alexa.value.split(',').includes(`${type}.${attr}`)))
    },
    requiresGroupAttributes (cl) {
      const requires = this.getAlexaDef(cl).requires || []
      return !this.item.groups.length && requires.length > 0
    },
    supportsGroupType (cl) {
      return !this.item.groups.length || this.item.groups.some((g) => cl.startsWith(`${g.metadata.alexa.value}.`))
    },
    supportsItemType (cl) {
      const itemTypes = this.getAlexaDef(cl).itemTypes || []
      return itemTypes.includes(this.itemType)
    },
    supportsMultiInstance (cl) {
      const supports = this.getAlexaDef(cl).supports || []
      return supports.includes('multiInstance')
    },
    toggleMultiple () {
      this.multiple = !this.multiple
      if (this.metadata.value.indexOf(',') > 0) this.metadata.value = ''
      this.classSelectKey = this.$f7.utils.id()
    },
    updateClasses () {
      const value = this.$refs.classes.f7SmartSelect.getValue()
      this.metadata.value = (Array.isArray(value)) ? value.join(',') : value
      this.$set(this.metadata, 'config', {})
    }
  }
}
</script>
