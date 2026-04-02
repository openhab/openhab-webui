import { f7 } from 'framework7-vue'

/* eslint-disable @typescript-eslint/promise-function-async */

/**
 * Shows a Framework7 confirm dialog and returns a promise that resolves to
 * `true` if the user confirms, or `false` if the user cancels.
 * @param message The message to display in the dialog body.
 * @param title The title of the dialog.
 */
export function showConfirmDialog(message: string, title: string): Promise<boolean> {
  return new Promise((resolve) => {
    f7.dialog.confirm(
      message,
      title,
      () => resolve(true),
      () => resolve(false)
    )
  })
}

/**
 * Shows a Framework7 toast notification and returns a promise that resolves
 * when the toast has finished closing.
 * @param message The message to display in the toast.
 * @param durationInSec How long the toast is visible, in seconds. Defaults to `3`.
 */
export function showToast(message: string, durationInSec: number = 3): Promise<void> {
  return new Promise((resolve) => {
    f7.toast
      .create({
        text: message,
        closeTimeout: durationInSec * 1000,
        position: 'bottom',
        horizontalPosition: 'center',
        destroyOnClose: true,
        on: {
          closed: () => resolve()
        }
      })
      .open()
  })
}

/**
 * Shows a Framework7 alert dialog and returns a promise that resolves when
 * the user dismisses it.
 * @param message The message to display in the dialog body.
 * @param title The title of the dialog.
 */
export function showAlertDialog(message: string, title: string): Promise<void> {
  return new Promise((resolve) => {
    f7.dialog.alert(message, title, () => resolve())
  })
}
