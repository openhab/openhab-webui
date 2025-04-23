import Vue from 'vue'
import Clipboard from 'v-clipboard'

Vue.use(Clipboard)

function executeFileDefinitionCopy (vueInstance, objectType, objectTypeLabel, objectIds, copiedObjectsLabel, fileFormatLabel, mediaType) {
  const progressDialog = vueInstance.$f7.dialog.progress(`Loading ${objectTypeLabel} ${fileFormatLabel} definition...`)

  const path = `/rest/file-format/${objectType}s`
  const headers = { accept: mediaType }
  const data = JSON.stringify(objectIds)
  vueInstance.$oh.api.postPlain(path, data, 'text', 'application/json', headers)
    .then(definition => {
      progressDialog.close()
      if (vueInstance.$clipboard(definition)) {
        vueInstance.$f7.toast.create({
          text: `${objectTypeLabel} ${fileFormatLabel} definition copied to clipboard:\n${copiedObjectsLabel}`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      } else {
        vueInstance.$f7.dialog.alert(`Error copying ${objectTypeLabel} ${fileFormatLabel} definition to the clipboard`, 'Error')
      }
    })
    .catch(error => {
      progressDialog.close()
      vueInstance.$f7.dialog.alert(`Error loading ${objectTypeLabel} ${fileFormatLabel} definition: ${error}`, 'Error')
    })
}

export default {
  created () {
    // Define the ObjectType enum to be used when calling the copyFileDefinitionToClipboard method
    this.ObjectType = Object.freeze({
      THING: 'thing',
      ITEM: 'item'
    })
  },
  methods: {
    /**
     * Copies the file definitions of the given list of thingUIDs or item names to the clipboard.
     *
     * @param {string} objectType - The type of the objects (`thing` or `item`). Use {ObjectType} enum for clarity.
     * @param {Array} objectIds - The list of object ids to copy. For Things, this should be an array of Thing UIDs.
     *                            For Items, this should be an array of Item names.
     *                            When `null`, all objects of the given type will be copied.
     */
    copyFileDefinitionToClipboard (objectType, objectIds = null) {
      const objectTypeLabel = objectType.charAt(0).toUpperCase() + objectType.slice(1) + 's'

      let copiedObjectsLabel = null
      if (objectIds === null) {
        copiedObjectsLabel = `All ${objectTypeLabel}`
      } else if (objectIds.length === 1) {
        copiedObjectsLabel = '<b>' + objectIds[0] + '</b>'
      } else {
        copiedObjectsLabel = `${objectIds.length} ${objectTypeLabel}`
      }

      this.$f7.dialog
        .create({
          title: `Copy ${objectTypeLabel} File Definition`,
          text: `Select the file format to copy ${copiedObjectsLabel} to clipboard`,
          buttons: [
            {
              text: 'Cancel',
              color: 'gray'
            },
            {
              text: 'DSL',
              color: 'teal',
              onClick: () => executeFileDefinitionCopy(this, objectType, objectTypeLabel, objectIds, copiedObjectsLabel, 'DSL', `text/vnd.openhab.dsl.${objectType}`)
            },
            {
              text: 'YAML',
              color: 'blue',
              onClick: () => executeFileDefinitionCopy(this, objectType, objectTypeLabel, objectIds, copiedObjectsLabel, 'YAML', 'application/yaml')
            }
          ]
        })
        .open()
    }
  }
}
