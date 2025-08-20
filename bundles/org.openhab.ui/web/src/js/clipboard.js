import Vue from 'vue'
import { f7 } from 'framework7-vue'

/**
 * Copies the provided data to the clipboard. If the initial attempt fails (e.g., due to browser restrictions),
 * presents a dialog prompting the user to manually trigger the copy operation.
 *
 * @param {string} data - The value to copy to the clipboard.
 * @param {Object} [options] - Optional configuration object.
 * @param {string} [options.dialogTitle='Copy to Clipboard'] - Title for the dialog shown when manual copy is needed.
 * @param {string} [options.dialogText='Click OK to copy data to clipboard'] - Text for the dialog shown when manual copy is needed.
 * @param {Function} [options.onSuccess] - Callback invoked when the copy operation succeeds.
 * @param {Function} [options.onError] - Callback invoked when the copy operation fails.
 * @returns {void} This function uses callbacks for outcomes. On Cancel the dialog closes and no callback is invoked.
 */
export default function copyToClipboard (data, { dialogTitle = 'Copy to Clipboard', dialogText = 'Click OK to copy data to clipboard', onSuccess, onError } = {}) {
  if (Vue.prototype.$clipboard(data)) {
    onSuccess && onSuccess()
  } else {
    // Safari requires that the copy operation is triggered _directly_ by a user action
    // without any intervening asynchronous operations. So in case the copy didn't work,
    // Try to re-trigger the copy operation within a user action.
    f7.dialog.create({
      title: dialogTitle,
      text: dialogText,
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
