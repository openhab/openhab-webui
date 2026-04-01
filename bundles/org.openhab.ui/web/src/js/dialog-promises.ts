import { f7 } from 'framework7-vue'

/* eslint-disable @typescript-eslint/promise-function-async */

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

// Helper for displaying simple text toasts at bottom of the screen.
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

export function showAlertDialog(message: string, title: string): Promise<void> {
  return new Promise((resolve) => {
    f7.dialog.alert(message, title, () => resolve())
  })
}
