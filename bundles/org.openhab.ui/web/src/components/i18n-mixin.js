import { f7 } from 'framework7-vue'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { i18n, loadLocaleMessages } from '@/js/i18n'

export default {
  methods: {
    updateLocale (setLocaleMessage) {
      loadLocaleMessages('common', setLocaleMessage)
        .then(() => {
          i18n.global.locale.value = useRuntimeStore().locale

          f7.params.dialog.buttonOk = this.t('dialogs.ok')
          f7.params.dialog.buttonCancel = this.t('dialogs.cancel')
          f7.params.smartSelect.searchbarDisableText = this.t('dialogs.cancel')
          f7.params.smartSelect.searchbarPlaceholder = this.t('dialogs.search')
          f7.params.smartSelect.sheetCloseLinkText = this.t('dialogs.done')
          f7.params.smartSelect.popupCloseLinkText = this.t('dialogs.close')
          f7.params.smartSelect.pageBackLinkText = this.t('dialogs.back')
          f7.params.smartSelect.nothingFoundText = this.t('dialogs.search.nothingFound')

        })
        .catch((err) => {
          console.error('Error loading locale messages: ', err)
        })
    }
  }
}
