import Framework7 from 'framework7/types'

declare module 'framework7/types' {
  interface Framework7Events {
    toggleDeveloperDock: () => void
    toggleLogDock: () => void
    toggleLogDockFullscreen: () => void
    selectDeveloperDock: () => void
  }
}

export { Framework7Events }
