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
}

interface Window {
  OHApp?: OHApp
}
