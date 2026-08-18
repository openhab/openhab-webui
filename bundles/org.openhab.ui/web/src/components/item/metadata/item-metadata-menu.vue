<template>
  <group-box title="Metadata">
    <f7-list v-if="this.editableNamespaces.length > 0" class="metadata-list">
      <ul v-if="wellKnownNamespaces.length > 0">
        <f7-list-item divider title="Well-known Namespaces" />
        <f7-list-item
          v-for="namespace in wellKnownNamespaces"
          :key="namespace.name"
          :link="'/settings/items/' + item.name + '/metadata/' + namespace.name"
          :title="namespace.label"
          :after="namespace.value || 'Not Set'">
          <template #title>
            <f7-icon v-if="!namespace.editable" f7="lock_fill" size="1rem" color="gray" />
          </template>
        </f7-list-item>
      </ul>
      <ul v-if="customNamespaces.length > 0">
        <f7-list-item divider title="Custom Namespaces" />
        <f7-list-item
          v-for="namespace in customNamespaces"
          :key="namespace.name"
          :link="'/settings/items/' + item.name + '/metadata/' + namespace.name"
          :title="namespace.label"
          :after="namespace.value || 'Not Set'">
          <template #title>
            <f7-icon v-if="!namespace.editable" f7="lock_fill" size="1rem" color="gray" />
          </template>
        </f7-list-item>
      </ul>
    </f7-list>
    <f7-card-footer>
      <f7-button color="blue" @click="addMetadata"> Add Metadata </f7-button>
    </f7-card-footer>
  </group-box>
</template>

<style lang="stylus">
.metadata-list
  .item-title
    flex-shrink 0
    margin-right 16px
  .item-after
    display flex
    flex 1 1 0
    min-width 0
    justify-content flex-end
    span
      max-width 100%
      text-overflow ellipsis
      white-space nowrap
      overflow hidden
</style>

<script>
import MetadataNamespaces from '@/assets/definitions/metadata/namespaces.js'
import { f7 } from 'framework7-vue'

export default {
  props: {
    item: Object,
    f7router: Object
  },
  data() {
    return {
      metadataNamespaces: MetadataNamespaces
    }
  },
  beforeMount() {
    if (
      this.item.type === 'Group' ? this.item.groupType && this.item.groupType.indexOf('Number:') < 0 : this.item.type.indexOf('Number:') < 0
    )
      this.metadataNamespaces = this.metadataNamespaces.filter((n) => n.name !== 'unit')
  },
  computed: {
    editableNamespaces() {
      if (!this.item.metadata) return []
      // TODO: determine somehow if other namespaces are not editable
      // (non-managed MetadataProvider)
      // for now we'll assume they're all editable except "semantics"
      return Object.keys(this.item.metadata)
        .filter((n) => n !== 'semantics')
        .map((n) => {
          return {
            name: n,
            value: this.item.metadata[n].value,
            editable: this.item.metadata[n].editable
          }
        })
    },
    wellKnownNamespaces() {
      // Return the item metadata but adopt the ordering of the well-known namespaces
      return this.metadataNamespaces
        .filter((wk) => this.editableNamespaces.some((n) => n.name === wk.name))
        .map((wk) => {
          const editable = this.editableNamespaces.find((n) => n.name === wk.name)
          return {
            ...editable,
            label: wk.label
          }
        })
    },
    customNamespaces() {
      return this.editableNamespaces
        .filter((n) => !this.metadataNamespaces.some((wk) => wk.name === n.name))
        .map((n) => {
          return {
            ...n,
            label: n.name
          }
        })
    }
  },
  methods: {
    editCustomMetadata() {
      f7.dialog.prompt('Please type in the namespace you would like to edit:', 'Edit Custom Metadata', (namespace) => {
        if (namespace) f7.views.main.router.navigate('/settings/items/' + this.item.name + '/metadata/' + namespace)
      })
    },
    addMetadata() {
      f7.actions
        .create({
          buttons: [
            [
              { label: true, text: 'Well-known namespaces' },
              ...this.metadataNamespaces.map((n) => {
                return {
                  text: n.label,
                  color: 'blue',
                  onClick: () => {
                    this.f7router.navigate('/settings/items/' + this.item.name + '/metadata/' + n.name)
                  }
                }
              })
            ],
            [
              { label: true, text: 'Custom namespaces' },
              { color: 'blue', text: 'Enter Custom Namespace...', onClick: this.editCustomMetadata }
            ],
            [{ color: 'red', text: 'Cancel', close: true }]
          ]
        })
        .open()
    }
  }
}
</script>
