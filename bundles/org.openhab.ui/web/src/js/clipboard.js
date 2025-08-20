import Vue from 'vue'
import { f7 } from 'framework7-vue'

/**
 * Copy data to the clipboard, with a fallback dialog for browsers that require a direct user gesture.
 *
 * @param {string} data - Value to copy.
 * @param {Object} config - Configuration object (required; use `{}` for defaults).
 * @param {string} [config.dialogTitle='Copy to Clipboard'] - Title shown in the fallback dialog.
 * @param {string} [config.dialogText='Click OK to copy data to clipboard'] - Text shown in the fallback dialog.
 * @param {function} [config.onSuccess] - Callback invoked when copy succeeds (immediately or after OK).
 * @param {function} [config.onError] - Callback invoked when copy fails after pressing OK.
 * @returns {void} This function uses callbacks for outcomes. On Cancel the dialog closes and no callback is invoked.
 */
export default function copyToClipboard(data, config = {}) {
  const { dialogTitle, dialogText, onSuccess, onError } = config
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
