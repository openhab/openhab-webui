import PagesList from '../../pages-list.vue'
import SitemapEdit from '../sitemap-edit.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Framework7 from 'framework7'
import Framework7Vue from 'f7vue'

let lastDialogConfig = null

describe('SitemapEdit', () => {
  const localVue = createLocalVue()
  Framework7.use(Framework7Vue)
  let wrapper = null

  // hack to define the f7 objects (either real or mocks/stubs) used in the component
  Object.defineProperty(localVue.prototype, '$f7', {
    get () {
      return {
        utils: Framework7.utils,
        params: { navbar: {} },
        dialog: {
          create: (config) => {
            lastDialogConfig = config
            return {
              open: () => { }
            }
          }
        }
      }
    }
  })

  beforeEach(() => {
    wrapper = shallowMount(SitemapEdit, {
      localVue,
      propsData: {
        createMode: true,
        uid: 'test'
      }
    })
  })

  afterEach(() => wrapper.destroy())

  it('has initialized with an empty sitemap', () => {
    expect(wrapper.vm.sitemap).toBeDefined()
    expect(wrapper.vm.sitemap.component).toEqual('Sitemap')
  })

  it('validates item name is checked', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Switch')

    // should not validate as the Switch has no item configured
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Switch widget without label, no item configured/)

    // configure an item for the Switch and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0].slots.widgets[0], wrapper.vm.sitemap.slots.widgets[0]])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'item', 'Item1')
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates url is checked', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Webview')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'item', 'Item1')
    localVue.set(wrapper.vm.selectedWidget.config, 'label', 'Webview Test')

    // should not validate as the Webview has no url configured
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Webview widget Webview Test, no url configured/)

    // configure a url for the Webview and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'url', 'https://test.html')
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates period is checked', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Chart')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'item', 'Item1')
    localVue.set(wrapper.vm.selectedWidget.config, 'label', 'Chart Test')

    // should not validate as the Chart has no period configured
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Chart widget Chart Test, no period configured/)

    // configure a period for the Chart and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'period', '4h')
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates mappings', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Selection')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'item', 'Item1')
    localVue.set(wrapper.vm.selectedWidget.config, 'label', 'Selection Test')
    localVue.set(wrapper.vm.selectedWidget.config, 'mappings', [
      'Morning'
    ])

    // should not validate as the mapping has a syntax error
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Selection widget Selection Test, syntax error in mappings: Morning/)

    // configure a correct mapping and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'mappings', [
      '1=Morning',
      '2=Evening',
      '10=Cinéma',
      '11=TV',
      '3=Bed time',
      '4=Night'
    ])
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates visibility', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Text')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'item', 'Item1')
    localVue.set(wrapper.vm.selectedWidget.config, 'label', 'Text Test')
    localVue.set(wrapper.vm.selectedWidget.config, 'visibility', [
      true
    ])

    // should not validate as the visibility has a syntax error
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Text widget Text Test, syntax error in visibility: true/)

    // configure a correct visibility and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'visibility', [
      'Day_time==Morning Time',
      'Battery<30',
      'Battery>50',
      'Battery_Level>=20'
    ])
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates valuecolor', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Text')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'item', 'Item1')
    localVue.set(wrapper.vm.selectedWidget.config, 'label', 'Text Test')
    localVue.set(wrapper.vm.selectedWidget.config, 'valuecolor', [
      'false>='
    ])

    // should not validate as the valuecolor has a syntax error
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Text widget Text Test, syntax error in valuecolor: false>=/)

    // configure a correct valuecolor and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'valuecolor', [
      'Heat_Warning==It is hot=gray',
      'Last_Update==Uninitialized=gray',
      '>=25=orange',
      '==15=green',
      '0=white',
      'blue'
    ])
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })
})
