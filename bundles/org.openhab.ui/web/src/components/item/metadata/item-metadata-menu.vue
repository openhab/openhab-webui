<template>
  <f7-list>
    <f7-list-item
      v-for="namespace in metadataNamespaces" :key="namespace.name"
      :link="'/settings/items/' + item.name + '/metadata/' + namespace.name"
      :title="namespace.label"
      :after="(item.metadata && item.metadata[namespace.name]) ? item.metadata[namespace.name].value : 'Not Set'"
    />
    <f7-list-button color="blue" @click="editCustomMetadata">Edit Custom Metadata</f7-list-button>
  </f7-list>
</template>

<script>
import MetadataNamespaces from '@/assets/definitions/metadata/namespaces.js'

export default {
  props: ['item'],
  data () {
    return {
      metadataNamespaces: MetadataNamespaces
    }
  },
  methods: {
    editCustomMetadata () {
      this.$f7.dialog.prompt(`Please type in the namespace you would like to edit:`,
        'Edit Custom Metadata',
        (namespace) => {
          if (namespace) this.$f7.views.main.router.navigate('/settings/items/' + this.item.name + '/metadata/' + namespace)
        })
    }
  }
}
</script>
