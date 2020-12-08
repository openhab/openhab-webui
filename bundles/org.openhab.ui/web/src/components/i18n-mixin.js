export default {
  methods: {
    updateLocale () {
      this.$root.$i18n.locale = this.$store.state.locale.replace('_', '-')
      this.$f7.params.dialog.buttonOk = this.$t('dialogs.ok')
      this.$f7.params.dialog.buttonCancel = this.$t('dialogs.cancel')
      this.$f7.params.smartSelect.searchbarDisableText = this.$t('dialogs.cancel')
      this.$f7.params.smartSelect.searchbarPlaceholder = this.$t('dialogs.search')
      this.$f7.params.smartSelect.sheetCloseLinkText = this.$t('dialogs.done')
      this.$f7.params.smartSelect.popupCloseLinkText = this.$t('dialogs.close')
      this.$f7.params.smartSelect.pageBackLinkText = this.$t('dialogs.back')
      this.$f7.params.smartSelect.nothingFoundText = this.$t('dialogs.search.nothingFound')
    }
  }
}
