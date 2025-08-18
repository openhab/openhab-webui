import Vue from 'vue'
import { f7 } from 'framework7-vue'

export default function (copyOptions) {
  const { data, dialogTitle, dialogText, onSuccess, onError } = copyOptions
  if (Vue.prototype.$clipboard(data)) {
    onSuccess && onSuccess()
  } else {
    // Safari requires that the copy operation is triggered _directly_ by a user action
    // without any intervening asynchronous operations. So in case the copy didn't work,
    // Try to re-trigger the copy operation within a user action.
    f7.dialog.create({
      title: dialogTitle ?? 'Copy to Clipboard',
      text: dialogText ?? 'Click OK to copy data to clipboard',
      buttons: [
        {
          text: 'Cancel',
          color: 'gray'
        },
        {
          text: 'OK',
          color: 'blue',
          onClick: () => {
            if (Vue.prototype.$clipboard(data)) {
              onSuccess && onSuccess()
            } else {
              onError && onError()
            }
          }
        }
      ]
    }).open()
  }
}
