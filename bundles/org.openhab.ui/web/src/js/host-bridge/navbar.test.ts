/* eslint-disable vue/one-component-per-file */
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { navbarStateFor, runNavbarAction, runNavbarBack, useHostNavbar, type HostNavbar } from './navbar'

const scroll = { hidden: false, collapsed: false }

// A page component that renders its own page element, like home.vue and page-view.vue.
function mountPage(describe: () => HostNavbar | null) {
  const Page = defineComponent({
    setup() {
      useHostNavbar(describe)
      return () => h('div', { class: 'page' })
    }
  })
  return mount(Page)
}

// A component inside an f7-page, like oh-nav-content.
function mountInsidePage(describe: () => HostNavbar | null) {
  const Inner = defineComponent({
    setup() {
      useHostNavbar(describe)
      return () => h('span')
    }
  })
  const F7Page = defineComponent({
    name: 'f7-page',
    setup:
      (_, { slots }) =>
      () =>
        h('div', { class: 'page' }, slots.default?.())
  })
  return mount(defineComponent({ render: () => h(F7Page, null, { default: () => h(Inner) }) }))
}

describe('host navbar', () => {
  it('describes a page that declares everything on its bar', async () => {
    const save = vi.fn()
    const title = ref('Kitchen')
    const page = mountPage(() => ({
      title: title.value,
      large: true,
      back: { label: 'Overview' },
      trailing: [{ id: 'save', label: 'Save', run: save }]
    })).element
    expect(navbarStateFor(page, scroll)).toEqual({
      title: 'Kitchen',
      titleInContent: true,
      hidden: false,
      back: { label: 'Overview' },
      leading: [],
      trailing: [{ id: 'save', label: 'Save' }]
    })
    expect(navbarStateFor(page, { hidden: true, collapsed: true })).toMatchObject({ hidden: true, titleInContent: false })

    title.value = 'Cuisine'
    await nextTick()
    expect(navbarStateFor(page, scroll).title).toBe('Cuisine')

    expect(runNavbarAction(page, 'save')).toBe(true)
    expect(save).toHaveBeenCalled()
    expect(runNavbarAction(page, 'gone')).toBe(false)
  })

  it('finds the page a component inside it belongs to', () => {
    const page = mountInsidePage(() => ({ title: 'Inner', back: null })).element
    expect(navbarStateFor(page, scroll)).toMatchObject({ title: 'Inner' })
  })

  it('gives a page without a description an empty bar', () => {
    const empty = { title: '', titleInContent: false, hidden: false, back: null, leading: [], trailing: [] }
    expect(navbarStateFor(document.createElement('div'), scroll)).toEqual(empty)
    expect(navbarStateFor(null, scroll)).toEqual(empty)
  })

  it('sends an icon Main UI only shows on md as the icon', () => {
    const page = mountPage(() => ({
      title: 'Things',
      back: null,
      trailing: [{ id: 'select', label: 'Select', icon: { md: 'material:done_all' }, run: () => {} }]
    })).element
    expect(navbarStateFor(page, scroll).trailing).toEqual([{ id: 'select', label: 'Select', icon: { name: 'material:done_all' } }])
  })

  it("runs the page's own back handling when it has one", () => {
    const back = vi.fn()
    const page = mountPage(() => ({ title: 'B', back: { run: back } })).element
    expect(runNavbarBack(page)).toBe(true)
    expect(back).toHaveBeenCalled()
    expect(runNavbarBack(document.createElement('div'))).toBe(false)
  })

  it('forgets a page once it is gone', () => {
    const wrapper = mountPage(() => ({ title: 'C', back: null }))
    const page = wrapper.element
    wrapper.unmount()
    expect(navbarStateFor(page, scroll).title).toBe('')
  })
})
