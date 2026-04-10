import { f7 } from 'framework7-vue'

import ThingMixin from '@/components/thing/thing-mixin'
import FileDefinition from '@/pages/settings/file-definition-mixin'
import { showToast } from '@/js/dialog-promises'

export default {
  props: {
    f7router: Object
  },
  mixins: [ThingMixin, FileDefinition],
  methods: {
    /**
     * Approve the given entry from the inbox.
     *
     * @param {object} entry Thing inbox entry
     * @param {string} label Thing label
     * @param {string} [newThingId] Optional custom Thing ID
     * @return {Promise<void>}
     */
    approveEntry(entry, label, newThingId) {
      return this.$oh.api
        .postPlain(`/rest/inbox/${entry.thingUID}/approve${newThingId ? '?newThingId=' + newThingId : ''}`, label)
        .then(() => {
          showToast('Entry approved')
          return Promise.resolve()
        })
        .catch((err) => {
          showToast('Error during thing creation: ' + err)
          return Promise.reject(err)
        })
    },
    ignoreEntry(entry, loadFn) {
      this.$oh.api
        .postPlain(`/rest/inbox/${entry.thingUID}/ignore`)
        .then((res) => {
          showToast('Entry ignored')
          loadFn()
        })
        .catch((err) => {
          showToast('Error while ignoring entry: ' + err)
          loadFn()
        })
    },
    unignoreEntry(entry, loadFn) {
      this.$oh.api
        .postPlain(`/rest/inbox/${entry.thingUID}/unignore`)
        .then((res) => {
          showToast('Entry unignored')
          loadFn()
        })
        .catch((err) => {
          showToast('Error while unignoring entry: ' + err)
          loadFn()
        })
    },
    removeEntry(entry, loadFn) {
      this.$oh.api
        .delete('/rest/inbox/' + entry.thingUID)
        .then((res) => {
          showToast('Entry removed')
          loadFn()
        })
        .catch((err) => {
          showToast('Error while removing entry: ' + err)
          loadFn()
        })
    },
    entryActionsAddAsThingButton(entry, loadFn) {
      return {
        text: 'Add as Thing',
        color: 'green',
        bold: true,
        onClick: () => {
          const lastColonIdx = entry.thingUID.lastIndexOf(':')
          const uidPrefix = entry.thingUID.substring(0, lastColonIdx + 1)
          const defaultId = entry.thingUID.substring(lastColonIdx + 1)

          const okButtonClicked = (dialog, redirect) => {
            const newThingId = dialog.$el.find('.id-input').val()
            const newThingUID = uidPrefix + newThingId

            const error = this.validateThingUID(newThingUID, newThingId)
            const label = dialog.$el.find('.label-input').val()
            if (!error && label) {
              dialog.close()
              this.approveEntry(entry, label, newThingId)
                .then(() => {
                  if (redirect)
                    this.f7router.navigate('/settings/things/' + newThingUID, {}) // empty options are required
                  else loadFn()
                })
                .catch(() => loadFn())
            }
          }

          f7.dialog
            .create({
              title: 'Add as Thing',
              text: `This will create a new Thing of type ${entry.thingTypeUID}.`,
              content: `
                <div class="dialog-text">Thing ID:</div>
                <div class="dialog-input-field input"><input type="text" class="dialog-input id-input"></div>
                <div class="input-info id-info"></div>
                <div>&nbsp;</div>
                <div class="dialog-text">Thing label:</div>
                <div class="dialog-input-field input"><input type="text" class="dialog-input label-input"></div>
                <div class="input-info label-info"></div>
              `,
              buttons: [
                {
                  text: f7.params.dialog.buttonCancel,
                  color: 'gray',
                  keyCodes: [27],
                  close: true
                },
                {
                  text: 'OK &rarr; Edit',
                  bold: true,
                  close: false,
                  onClick: (dialog) => okButtonClicked(dialog, true)
                },
                {
                  text: 'OK',
                  bold: true,
                  keyCodes: [13],
                  close: false,
                  onClick: (dialog) => okButtonClicked(dialog, false)
                }
              ],
              destroyOnClose: true,
              cssClass: 'thing-inbox-approve-dialog',
              on: {
                opened: (dialog) => {
                  const id = dialog.$el.find('.id-input')
                  id.val(defaultId)
                  id.focus()

                  id.on('input', () => {
                    const error = this.validateThingUID(uidPrefix + id.val(), id.val())
                    const info = dialog.$el.find('.id-info')
                    info.text(error)
                    info[0].style.color = error ? 'red' : ''
                  })

                  const label = dialog.$el.find('.label-input')
                  label.val(entry.label)
                  label.on('input', () => {
                    const info = dialog.$el.find('.label-info')
                    info.text(label.val() ? '' : 'Label is required')
                    info[0].style.color = label.val() ? '' : 'red'
                  })
                }
              }
            })
            .open()
        }
      }
    },
    entryActionsCopyThingDefinitionButton(entry) {
      return {
        text: 'Copy Thing File Definition',
        color: 'blue',
        bold: true,
        onClick: () => this.copyFileDefinitionToClipboard(this.ObjectType.THING, [entry.thingUID])
      }
    },
    entryActionsIgnoreButton(entry, loadFn, ignored) {
      return {
        text: !ignored ? 'Ignore' : 'Unignore',
        color: !ignored ? 'orange' : 'blue',
        onClick: () => {
          if (ignored) {
            this.unignoreEntry(entry, loadFn)
          } else {
            this.ignoreEntry(entry, loadFn)
          }
        }
      }
    },
    entryActionsRemoveButton(entry, loadFn) {
      return {
        text: 'Remove',
        color: 'red',
        onClick: () => {
          f7.dialog.confirm(`Remove ${entry.label} from the Inbox?`, 'Remove Entry', () => {
            this.removeEntry(entry, loadFn)
          })
        }
      }
    }
  }
}
