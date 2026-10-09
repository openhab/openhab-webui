// Android app: https://github.com/openhab/openhab-android/blob/c7b942c/mobile/src/main/java/org/openhab/habdroid/ui/activity/AbstractWebViewFragment.kt#L401
// iOS app: https://github.com/openhab/openhab-ios/blob/da9a7e2/openHAB/OpenHABWebViewController.swift#L37
interface OHApp {
  preferTheme?: () => 'md' | 'ios' | 'aurora'
  preferDarkMode?: () => 'light' | 'dark'
  exitToApp?: () => void
  goFullscreen?: () => void
  pinToHome?: () => void
  getBasicCredentialsUsername?: () => string
  getBasicCredentialsPassword?: () => string
  /** Main UI is ready to take the app's menu entries via window.MainUI.setAppMenu() */
  menuReady?: () => void
  /** An entry provided via window.MainUI.setAppMenu() was selected */
  menuItemSelected?: (id: string) => void
}

interface OHAppMenuItem {
  id: string
  title: string
  /** Icon with its font as prefix, e.g. f7:bell or material:notifications */
  icon?: string
  /** Small text below the title, e.g. what kind of entry this is */
  footer?: string
  active?: boolean
  badge?: string
  /** Makes this entry an expandable group (one level only); groups are not reported via menuItemSelected() */
  children?: OHAppMenuItem[]
}

interface OHAppMenu {
  title: string
  items: OHAppMenuItem[]
}

interface Window {
  OHApp?: OHApp
}
