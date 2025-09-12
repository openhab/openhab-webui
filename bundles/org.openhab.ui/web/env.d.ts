interface ImportMetaEnv {
  readonly VITE_YOUR_URL: string
  readonly VITE_REALM: string
  readonly VITE_CLIENT_ID: string
  readonly VUE_APP_I18N_LOCALE: string
  readonly VUE_APP_I18N_FALLBACK_LOCALE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
