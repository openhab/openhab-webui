import { f7 } from 'framework7-vue'
import api from '@/js/openhab/api'
import { showToast } from '@/js/dialog-promises'
import copyToClipboard from '@/js/clipboard'
import { toFileYAMLSyntax } from '@/pages/yaml-file-format'

/*
 * File Definition Mixin
 */

function executeFileDefinitionCopy(vueInstance, copyOptions) {
  const progressDialog = f7.dialog.progress(`Loading ${copyOptions.label} ${copyOptions.format} definition...`)

  const path = `/rest/file-format/${copyOptions.type}s`
  const headers = { accept: copyOptions.mediaType }
  const data = JSON.stringify(copyOptions.objectIds)
  api
    .postPlain(path, data, 'text', 'application/json', headers)
    .then((definition) => {
      progressDialog.close()
      copyToClipboard(definition, {
        dialogTitle: `Copy ${copyOptions.label} File Definition`,
        dialogText: 'File definition retrieved successfully. Click OK to copy it to the clipboard.',
        onSuccess: () => {
          showToast(`${copyOptions.label} ${copyOptions.format} definition copied to clipboard:\n${copyOptions.objectName}`)
        },
        onError: () => {
          f7.dialog.alert(`Error copying ${copyOptions.label} ${copyOptions.format} definition to the clipboard`, 'Error')
        }
      })
    })
    .catch((error) => {
      progressDialog.close()
      f7.dialog.alert(`Error loading ${copyOptions.label} ${copyOptions.format} definition: ${error}`, 'Error')
    })
}

function executeWidgetCopy(vueInstance, copyOptions) {
  const progressDialog = f7.dialog.progress(`Loading ${copyOptions.label} definition...`)

  const processWidgets = (widgets) => {
    progressDialog.close()
    if (!widgets || (Array.isArray(widgets) && widgets.length === 0)) {
      f7.dialog.alert('No widgets found to export', 'Error')
      return
    }
    const definition = toFileYAMLSyntax('widgets', widgets)
    copyToClipboard(definition, {
      dialogTitle: `Copy ${copyOptions.label} File Definition`,
      dialogText: 'File definition retrieved successfully. Click OK to copy it to the clipboard.',
      onSuccess: () => {
        showToast(`${copyOptions.label} YAML definition copied to clipboard:\n${copyOptions.objectName}`)
      },
      onError: () => {
        f7.dialog.alert(`Error copying ${copyOptions.label} YAML definition to the clipboard`, 'Error')
      }
    })
  }

  if (copyOptions.widgetObjects) {
    processWidgets(copyOptions.widgetObjects)
    return
  }

  const apiFetch = vueInstance.$oh?.api
    ? vueInstance.$oh.api.get('/rest/ui/components/ui:widget')
    : api.get('/rest/ui/components/ui:widget')

  apiFetch
    .then((data) => {
      let selected = data
      if (copyOptions.objectIds) {
        selected = data.filter((w) => copyOptions.objectIds.includes(w.uid))
      }
      processWidgets(selected)
    })
    .catch((error) => {
      progressDialog.close()
      f7.dialog.alert(`Error loading ${copyOptions.label} definition: ${error}`, 'Error')
    })
}

export default {
  created() {
    // Define the ObjectType enum to be used when calling the copyFileDefinitionToClipboard method
    this.ObjectType = Object.freeze({
      THING: 'thing',
      ITEM: 'item',
      SITEMAP: 'sitemap',
      RULE: 'rule',
      WIDGET: 'widget'
    })
  },
  methods: {
    /**
     * Copies the file definitions of the given list of thingUIDs, item names, sitemap names, or widget objects to the clipboard.
     *
     * @param {string} objectType - The type of the objects (`thing`, `item`, `sitemap`, `rule` or `widget`). Use {ObjectType} enum for clarity.
     * @param {Array} objectIds - The list of object ids to copy. For Things, this should be an array of Thing UIDs.
     *                            For Items, this should be an array of Item names. For Rules, this should be an array of Rule UIDs.
     *                            For widgets, this should be an array of widget UIDs.
     *                            For Sitemaps, this should be an array of Sitemap names.
     *                            When `null`, all objects of the given type will be copied.
     */
    copyFileDefinitionToClipboard(objectType, objectIds = null) {
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

      if (objectType === 'widget') {
        copyOptions.format = 'YAML'
        executeWidgetCopy(this, copyOptions)
        return
      }

      f7.dialog
        .create({
          title: `Copy ${copyOptions.label} File Definition`,
          text: `Select the file format to copy ${copyOptions.objectName} to clipboard`,
          closeByBackdropClick: true,
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
                copyOptions.mediaType = objectType === 'rule' ? 'application/vnd.openhab.dsl.rule' : `text/vnd.openhab.dsl.${objectType}`
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
