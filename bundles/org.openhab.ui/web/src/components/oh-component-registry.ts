import { type Component, defineAsyncComponent, type App } from 'vue'

const pages = new Map<string, Component>()
const tabs = new Map<string, Component>()
const widgets = new Map<string, Component>()

export function registerWidgets(app: App) {
  const widgetFiles: Record<string, unknown> = import.meta.glob('@/components/widgets/**/*.vue')
  Object.entries(widgetFiles).forEach(([path, loader]) => {
    const componentName = path.split('/').pop()?.replace('.vue', '')
    if (componentName) {
      app.component(componentName, defineAsyncComponent(loader as () => Promise<{ default: Component }>))
    }
  })
}

export function registerTabs(app: App) {
  const tabsFiles: Record<string, unknown> = import.meta.glob('@/components/tabs/**/*.vue')
  Object.entries(tabsFiles).forEach(([path, loader]) => {
    const componentName = path.split('/').pop()?.replace('.vue', '')
    if (componentName) {
      app.component(componentName, defineAsyncComponent(loader as () => Promise<{ default: Component }>))
    }
  })
}
