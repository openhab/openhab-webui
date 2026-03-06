import { type Component, defineAsyncComponent } from 'vue'

const pages = new Map<string, Component>()
const tabs = new Map<string, Component>()
const widgets = new Map<string, Component>()

const widgetFiles: Record<string, unknown> = import.meta.glob('@/components/widgets/**/*.vue')
Object.entries(widgetFiles).forEach(([path, loader]) => {
  const componentName = path.split('/').pop()?.replace('.vue', '')
  if (componentName) {
    const asyncComponent = defineAsyncComponent(loader as () => Promise<{ default: Component }>)
    if (componentName.endsWith('-page')) {
      pages.set(componentName, asyncComponent)
    } else {
      widgets.set(componentName, asyncComponent)
    }
  }
})

const tabsFiles: Record<string, unknown> = import.meta.glob('@/components/tabs/**/*.vue')
Object.entries(tabsFiles).forEach(([path, loader]) => {
  const componentName = path.split('/').pop()?.replace('.vue', '')
  if (componentName) {
    const asyncComponent = defineAsyncComponent(loader as () => Promise<{ default: Component }>)
    tabs.set(componentName, asyncComponent)
  }
})

console.info(`oh-component-registry: Registered ${pages.size} page, ${tabs.size} tab and ${widgets.size} widgets components`)
console.debug('oh-component-registry pages', pages.keys())
console.debug('oh-component-registry tabs', tabs.keys())
console.debug('oh-component-registry widgets', widgets.keys())

export function page(name: string) {
  const p = pages.get(name)
  if (!p) console.error("oh-component-registry: Didn't find page component ", name)
  return p
}

export function tab(name: string) {
  const t = tabs.get(name)
  if (!t) console.error("oh-component-registry: Didn't find tab component ", name)
  return t
}

export function widget(name: string, suppressLog = false) {
  const w = widgets.get(name)
  if (!w && !suppressLog) console.error("oh-component-registry: Didn't find widget component ", name)
  return w
}
