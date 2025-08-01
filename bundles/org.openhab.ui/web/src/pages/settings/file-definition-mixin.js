/**
 * File Definition Mixin
 */

function executeFileDefinitionCopy (vueInstance, copyOptions) {
  const progressDialog = vueInstance.$f7.dialog.progress(`Loading ${copyOptions.label} ${copyOptions.format} definition...`)

  const path = `/rest/file-format/${copyOptions.type}s`
  const headers = { accept: copyOptions.mediaType }
  const data = JSON.stringify(copyOptions.objectIds)
  vueInstance.$oh.api.postPlain(path, data, 'text', 'application/json', headers)
    .then(definition => {
      progressDialog.close()
      const userAgent = window.navigator.userAgent || ''
      // Check if clipboard operations are supported here.
      // The alternative is to check the user agent for Safari, e.g.:
      // if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      if (!vueInstance.$clipboard('test')) {
        // Safari requires that the copy operation is triggered _directly_ by a user action
        // without any intervening asynchronous operations.
        confirmCopyToClipboard(vueInstance, definition, copyOptions)
      } else {
        copyToClipboard(vueInstance, definition, copyOptions)
      }
    })
    .catch(error => {
      progressDialog.close()
      vueInstance.$f7.dialog.alert(`Error loading ${copyOptions.label} ${copyOptions.format} definition: ${error}`, 'Error')
    })
}

function confirmCopyToClipboard (vueInstance, definition, copyOptions) {
  vueInstance.$f7.dialog
    .create({
      title: `Copy ${copyOptions.label} File Definition`,
      text: 'File definition retrieved successfully. Click OK to copy it to the clipboard.',
      buttons: [
        {
          text: 'Cancel',
          color: 'gray'
        },
        {
          text: 'OK',
          color: 'blue',
          onClick: () => copyToClipboard(vueInstance, definition, copyOptions)
        }
      ]
    })
    .open()
}

function copyToClipboard (vueInstance, definition, copyOptions) {
  if (vueInstance.$clipboard(definition)) {
    vueInstance.$f7.toast.create({
      text: `${copyOptions.label} ${copyOptions.format} definition copied to clipboard:\n${copyOptions.objectName}`,
      destroyOnClose: true,
      closeTimeout: 2000
    }).open()
  } else {
    vueInstance.$f7.dialog.alert(`Error copying ${copyOptions.label} ${copyOptions.format} definition to the clipboard`, 'Error')
  }
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
      const copyOptions = {
        type: objectType,
        label: objectType.charAt(0).toUpperCase() + objectType.slice(1) + 's',
        objectIds,
        objectName: ''
      }

      if (objectIds === null) {
        copyOptions.objectName = `All ${copyOptions.label}`
      } else if (objectIds.length === 1) {
        copyOptions.objectName = '<b>' + objectIds[0] + '</b>'
      } else {
        copyOptions.objectName = `${objectIds.length} ${copyOptions.label}`
      }

      this.$f7.dialog
        .create({
          title: `Copy ${copyOptions.label} File Definition`,
          text: `Select the file format to copy ${copyOptions.objectName} to clipboard`,
          buttons: [
            {
              text: 'Cancel',
              color: 'gray'
            },
            {
              text: 'DSL',
              color: 'teal',
              onClick: () => {
                copyOptions.format = 'DSL'
                copyOptions.mediaType = `text/vnd.openhab.dsl.${objectType}`
                executeFileDefinitionCopy(this, copyOptions)
              }
            },
            {
              text: 'YAML',
              color: 'blue',
              onClick: () => {
                copyOptions.format = 'YAML'
                copyOptions.mediaType = 'application/yaml'
                executeFileDefinitionCopy(this, copyOptions)
              }
            }
          ]
        })
        .open()
    }
  }
}
