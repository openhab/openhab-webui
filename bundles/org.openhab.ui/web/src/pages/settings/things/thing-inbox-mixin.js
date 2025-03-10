import ThingMixin from '@/components/thing/thing-mixin'

export default {
  mixins: [ThingMixin],
  methods: {
    /**
     * Approve the given entry from the inbox.
     *
     * @param {object} entry Thing inbox entry
     * @param {string} label Thing label
     * @param {string} [newThingId] Optional custom Thing ID
     * @return {Promise<void>}
     */
    approveEntry (entry, label, newThingId) {
      return this.$oh.api.postPlain(`/rest/inbox/${entry.thingUID}/approve${newThingId ? '?newThingId=' + newThingId : ''}`, label).then(() => {
        this.$f7.toast.create({
          text: 'Entry approved',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        return Promise.resolve()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error during thing creation: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        return Promise.reject(err)
      })
    },
    entryActionsAddAsThingButton (entry, loadFn) {
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
                  if (redirect) this.$f7router.navigate('/settings/things/' + newThingUID)
                  else loadFn()
                })
                .catch(() => loadFn())
            }
          }

          this.$f7.dialog.create({
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
                text: this.$f7.params.dialog.buttonCancel,
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
          }).open()
        }
      }
    }
  }
}
