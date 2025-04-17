import Vue from 'vue'
import Clipboard from 'v-clipboard'

Vue.use(Clipboard)

export default {
  data () {
    return {
      ObjectType: {
        THING: 'thing',
        ITEM: 'item'
      }
    }
  },
  methods: {
    /**
     * Copies the file definitions of the given list of thingUIDs or item names to the clipboard.
     *
     * @param {string} type - The type of the objects (`thing` or `item`).
     * @param {Array} objectIds - The list of object ids to copy. For Things, this should be an array of Thing UIDs.
     *                            For Items, this should be an array of Item names.
     *                            When `null`, all objects of the given type will be copied.
     */
    copyFileDefinitionToClipboard (type, objectIds = null) {
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + 's'

      let copiedObjectsLabel = null
      if (objectIds === null) {
        copiedObjectsLabel = `All ${typeLabel}`
      } else if (objectIds.length === 1) {
        copiedObjectsLabel = objectIds[0]
      } else {
        copiedObjectsLabel = `${objectIds.length} ${typeLabel}`
      }

      this.$f7.dialog
        .create({
          title: `Copy ${typeLabel} File Definition`,
          text: `Select the file format to copy ${copiedObjectsLabel} to clipboard`,
          buttons: [
            {
              text: 'Cancel',
              color: 'gray'
            },
            {
              text: 'DSL',
              color: 'blue',
              onClick: () => this.executeFileDefinitionCopy(type, typeLabel, objectIds, copiedObjectsLabel, 'DSL', `text/vnd.openhab.dsl.${type}`)
            },
            {
              text: 'YAML File',
              color: 'green',
              onClick: () => this.executeFileDefinitionCopy(type, typeLabel, objectIds, copiedObjectsLabel, 'YAML File', 'application/yaml')
            }
          ]
        })
        .open()
    },
    // This is a "private" method that is called by the copyFileDefinitionToClipboard method
    executeFileDefinitionCopy (type, typeLabel, objectIds, copiedObjectsLabel, fileFormatLabel, mediaType) {
      const progressDialog = this.$f7.dialog.progress(`Loading ${typeLabel} ${fileFormatLabel} definition...`)

      const path = `/rest/file-format/${type}s`
      let apiCalls = []
      if (objectIds !== null) {
        apiCalls = objectIds.map((id) => this.$oh.api.getPlain({
          url: path + '/' + id,
          headers: { accept: mediaType }
        }))
      } else {
        apiCalls = [this.$oh.api.getPlain({
          url: path,
          headers: { accept: mediaType }
        })]
      }

      Promise.all(apiCalls)
        .then(definitions => {
          const definition = definitions.join('\n')
          progressDialog.close()
          if (this.$clipboard(definition)) {
            this.$f7.toast.create({
              text: `${typeLabel} ${fileFormatLabel} definition copied to clipboard:\n${copiedObjectsLabel}`,
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          } else {
            this.$f7.dialog.alert(`Error copying ${typeLabel} ${fileFormatLabel} definition to the clipboard`, 'Error')
          }
        })
        .catch(error => {
          progressDialog.close()
          this.$f7.dialog.alert(`Error copying ${typeLabel} ${fileFormatLabel} definition: ${error.message}`, 'Error')
        })
    }
  }
}
