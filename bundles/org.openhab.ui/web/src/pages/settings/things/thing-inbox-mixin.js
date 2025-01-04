export default {
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
          this.$f7.dialog.prompt(`This will create a new Thing of type ${entry.thingTypeUID} with the following label:`,
            'Add as Thing',
            (label) => {
              this.approveEntry(entry, label).finally(() => {
                loadFn()
              })
            },
            null,
            entry.label)
        }
      }
    },
    entryActionsAddAsThingWithCustomIdButton (entry, loadFn) {
      return {
        text: 'Add as Thing (with custom ID)',
        color: 'blue',
        bold: true,
        onClick: () => {
          this.$f7.dialog.prompt(`This will create a new Thing of type ${entry.thingTypeUID}. You can change the suggested Thing ID below:`,
            'Add as Thing',
            (newThingId) => {
              this.$f7.dialog.prompt('Enter the desired label of the new Thing:',
                'Add as Thing',
                (label) => {
                  this.approveEntry(entry, label, newThingId).finally(() => {
                    loadFn()
                  })
                },
                null,
                entry.label)
            },
            null,
            entry.thingUID.substring(entry.thingUID.lastIndexOf(':') + 1))
        }
      }
    }
  }
}
