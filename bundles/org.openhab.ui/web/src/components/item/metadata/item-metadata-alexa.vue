<template>
  <div>
    <div style="text-align:right" class="padding-right" v-if="itemType !== 'Group'">
      <label @click="toggleMultiple" style="cursor:pointer">Multiple</label>
      <f7-checkbox :checked="multiple" @change="toggleMultiple" />
    </div>
    <f7-list v-if="ready">
      <f7-list-item
        :key="classSelectKey"
        :title="'Alexa Device Type' + (itemType !== 'Group' ? (!multiple ? '/Attribute' : '/Attributes') : '')"
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
        <small v-html="`Part of group endpoint${item.groups.length > 1 ? 's' : ''}: ${groupLinks}`" />
      </f7-block-footer>
    </f7-list>
    <div v-if="ready">
      <config-sheet :parameterGroups="[]" :parameters="parameters" :configuration="metadata.config" />
    </div>
    <f7-block class="padding-top no-padding no-margin" v-if="itemType === 'Group' && classes.length">
      <f7-block-title class="padding-left">
        Group Endpoint Capabilities
      </f7-block-title>
      <f7-list>
        <f7-list-item
          v-for="cap in groupCapabilities"
          :title="cap.name + (cap.isIgnored ? ' (Ignored)' : '')"
          :after="cap.item"
          :key="`${cap.name}:${cap.item}`"
          :disabled="cap.isIgnored"
          :link="`/settings/items/${cap.item}/metadata/alexa`" />
      </f7-list>
      <f7-block-footer class="padding-left" v-if="!groupCapabilities.length">
        No direct group members of {{ item.name }} configured for Alexa
      </f7-block-footer>
    </f7-block>
    <p class="padding">
      <f7-link color="blue" external target="_blank" :href="docLink">
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
      docUrl:
        `https://${this.$store.state.runtimeInfo.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org` +
        '/link/alexa',
      ready: false
    }
  },
  created () {
    Promise.all([
      this.$oh.api.get('/rest/items?metadata=alexa&fields=name,label,type,groupNames,groupType,metadata'),
      this.$oh.api.get('/rest/services/org.openhab.i18n/config')
    ]).then(([items, regional]) => {
      this.endpoints = items
        .filter((i) => i.metadata && !items.find((e) => e.metadata && i.groupNames.includes(e.name) && !e.groupType))
        .map((i) => ({ ...i, members: items.filter((e) => e.metadata && e.groupNames.includes(i.name) && !i.groupType) }))
      this.item.groups = this.endpoints.filter((i) => this.item.groupNames.includes(i.name) && !i.groupType)
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
        for (const p of params.map((p) => p(this.item, this.metadata.config, this.endpoints)).flat()) {
          if (p.description) p.description = p.description.replace('%DOC_URL%', this.docUrl)
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
      return this.item.groups.length > 0
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
    }
  },
  methods: {
    isSelected (cl) {
      return this.classes.indexOf(cl) >= 0
    },
    isDefined (cl) {
      return this.item.groups.some((g) =>
        g.members.some((mbr) => mbr.name !== this.item.name && mbr.metadata.alexa.value.split(',').includes(cl))
      )
    },
    isSupportedGroupAttribute (cl) {
      return this.metadata.value === cl.split('.')[0] && this.classesDefs.includes(cl)
    },
    isVisible (cl) {
      const { visible = () => true } = this.getDefinition(cl)
      return !!AlexaDefinitions[cl] && !!AlexaDefinitions[cl][this.itemType] && visible(this.item)
    },
    getDefinition (cl, item = {}) {
      const itemType = item.groupType || item.type || this.itemType
      return (AlexaDefinitions[cl] && AlexaDefinitions[cl][itemType]) || {}
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
