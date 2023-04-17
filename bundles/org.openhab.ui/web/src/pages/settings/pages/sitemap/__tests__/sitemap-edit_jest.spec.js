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

  it('validates frame does not contain frames', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0].slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'label', 'Frame Test')

    // should not validate as the frame contains a frame
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Frame widget Frame Test, frame not allowed in frame/)
  })

  it('validates frame in text does not contain frames', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Text')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0].slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()

    // should validate, as frame in text in frame is allowed
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // add a frame inside the frame in the text
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0].slots.widgets[0].slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0].slots.widgets[0].slots.widgets[0].slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'label', 'Frame Test')

    // should not validate as the frame contains a frame
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Frame widget Frame Test, frame not allowed in frame/)
  })

  it('validates only frames or no frames at all', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Text')
    await wrapper.vm.$nextTick()

    // should not validate as mix of frame and text
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Widget without label, only frames or no frames at all allowed in linkable widget/)
  })

  it('validates item name is checked', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
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

  it('validates period is configured and valid', async () => {
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
    expect(lastDialogConfig.content).toMatch(/Chart widget Chart Test, invalid period configured: undefined/)

    // configure an invalid period for the Chart
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'period', '5h')
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Chart widget Chart Test, invalid period configured: 5h/)

    // configure a period for the Chart and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'period', '4h')
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates step is positive', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Slider')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'item', 'Item1')
    localVue.set(wrapper.vm.selectedWidget.config, 'label', 'Slider Test')

    // no step, should validate
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure a negative step, should not validate
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'step', -1)
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Slider widget Slider Test, step size cannot be 0 or negative: -1/)

    // configure a 0 step, should not validate
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'step', 0)
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Slider widget Slider Test, step size cannot be 0 or negative: 0/)

    // configure a positive step, should validate
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'step', 5)
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates minValue less than or equal maxValue', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Setpoint')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'item', 'Item1')
    localVue.set(wrapper.vm.selectedWidget.config, 'label', 'Setpoint Test')

    // no minValue or maxValue, should validate
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure a minValue more than maxValue, should not validate
    lastDialogConfig = null
    localVue.set(wrapper.vm.selectedWidget.config, 'minValue', 10)
    localVue.set(wrapper.vm.selectedWidget.config, 'maxValue', 5)
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Setpoint widget Setpoint Test, minValue must be less than or equal maxValue: 10 > 5/)

    // configure a minValue equal to maxValue, should validate
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'minValue', 5)
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure a minValue less to maxValue, should validate
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    localVue.set(wrapper.vm.selectedWidget.config, 'minValue', 1)
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
})
