import { type Component, defineAsyncComponent, type App } from 'vue'

type Loader = () => Promise<{ default: Component }>

function registerSystemWidgets(app: App) {
  const files = import.meta.glob<Loader>('@/components/widgets/system/*.vue')
  Object.entries(files).forEach(([path, loader]) => {
    const componentName = path.split('/').pop()?.replace('.vue', '')
    if (componentName) {
      app.component(componentName, defineAsyncComponent(loader))
    }
  })
}

function registerStandardWidgets(app: App) {
  const files = import.meta.glob<Loader>('@/components/widgets/standard/**/*.vue')
  Object.entries(files).forEach(([path, loader]) => {
    const componentName = path.split('/').pop()?.replace('.vue', '')
    if (componentName) {
      app.component(componentName, defineAsyncComponent(loader))
    }
  })
}

function registerLayoutWidgets(app: App) {
  const files = import.meta.glob<Loader>('@/components/widgets/layout/*.vue')
  Object.entries(files).forEach(([path, loader]) => {
    const componentName = path.split('/').pop()?.replace('.vue', '')
    if (componentName) {
      app.component(componentName, defineAsyncComponent(loader))
    }
  })
}

export function registerWidgets(app: App) {
  registerSystemWidgets(app)
  registerStandardWidgets(app)
  registerLayoutWidgets(app)
}
