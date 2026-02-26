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

declare module '*?worker&url' {
  const src: string
  export default src
}

declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}
