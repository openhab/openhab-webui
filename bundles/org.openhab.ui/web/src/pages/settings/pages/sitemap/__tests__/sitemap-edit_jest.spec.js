import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import SitemapEdit from '../sitemap-edit.vue'
import { shallowMount, flushPromises } from '@vue/test-utils'

let lastDialogConfig = null

describe('SitemapEdit', () => {
  let wrapper = null
  let navigateMock = null
  let apiGetMock = null
  let apiPutMock = null

  // Mock the f7 objects (either real or mocks/stubs) used in the component
  vi.mock('framework7-vue', async () => {
    const actual = await vi.importActual('framework7-vue')
    return {
      ...actual,
      f7: {
        utils: (await import('framework7')).utils,
        params: { navbar: {} },
        dialog: {
          create: (config) => {
            lastDialogConfig = config
            return {
              open: () => {}
            }
          }
        },
        data: { sitemap: {} }
      }
    }
  })

  beforeEach(() => {
    navigateMock = vi.fn()
    apiGetMock = vi.fn().mockResolvedValue([])
    apiPutMock = vi.fn()
    wrapper = shallowMount(SitemapEdit, {
      props: {
        createMode: true,
        uid: 'test',
        itemsList: [],
        f7router: {
          navigate: navigateMock
        }
      },
      global: {
        config: {
          globalProperties: {
            // Mock $device
            $device: { desktop: false },
            $oh: {
              api: {
                get: apiGetMock,
                put: apiPutMock
              }
            }
          }
        }
      }
    })
  })

  afterEach(() => wrapper.unmount())

  it('has initialized with an empty sitemap', () => {
    expect(wrapper.vm.sitemap).toBeDefined()
    expect(wrapper.vm.sitemap.type).toEqual('Sitemap')
  })

  it('opens the duplicate route for sitemap copies', () => {
    wrapper.vm.sitemap.label = 'Original Sitemap'
    wrapper.vm.sitemap.widgets = [{ type: 'Text', label: 'Copied widget' }]
    wrapper.vm.selectedWidget = wrapper.vm.sitemap

    wrapper.vm.duplicateWidget()

    expect(navigateMock).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith('/settings/pages/sitemap/duplicate', {
      props: {
        sitemapCopy: expect.objectContaining({
          type: 'Sitemap',
          name: wrapper.vm.sitemap.name,
          label: 'Original Sitemap'
        })
      }
    })
    expect(navigateMock.mock.calls[0][1].props.sitemapCopy).not.toBe(wrapper.vm.sitemap)
    expect(navigateMock.mock.calls[0][1].props.sitemapCopy.widgets).toEqual([{ type: 'Text', label: 'Copied widget', widgets: [] }])
  })

  it('loads a duplicated sitemap in create mode with a fresh generated name', async () => {
    await wrapper.setProps({
      sitemapCopy: {
        name: 'existing_sitemap',
        label: 'Original Sitemap',
        widgets: [{ type: 'Text', label: 'Copied widget' }]
      }
    })
    wrapper.vm.createDefaultSitemapName = () => 'sitemap_generated'

    wrapper.vm.load()
    await flushPromises()

    expect(apiGetMock).toHaveBeenCalledWith('/rest/sitemaps/*/definition')
    expect(wrapper.vm.ready).toBe(true)
    expect(wrapper.vm.sitemap.name).toBe('sitemap_generated')
    expect(wrapper.vm.sitemap.label).toBe('Original Sitemap')
    expect(wrapper.vm.sitemap.type).toBe('Sitemap')
    expect(wrapper.vm.stripClosed(wrapper.vm.sitemap).widgets).toEqual([{ type: 'Text', label: 'Copied widget', widgets: [] }])
    expect(wrapper.vm.selectedWidget).toBe(wrapper.vm.sitemap)
    expect(wrapper.vm.selectedWidgetParent).toBe(null)
    expect(wrapper.vm.lastCleanSitemap).toBe(null)
    expect(wrapper.vm.sitemapDirty).toBe(true)
    expect(wrapper.vm.dirty).toBe(true)
  })

  it('loads an existing sitemap with the root sitemap selected', async () => {
    const existingSitemap = {
      name: 'existing_sitemap',
      label: 'Existing Sitemap',
      widgets: [{ type: 'Text', label: 'Existing widget' }]
    }
    apiGetMock.mockResolvedValueOnce(existingSitemap)

    wrapper.unmount()
    wrapper = shallowMount(SitemapEdit, {
      props: {
        createMode: false,
        uid: 'existing_sitemap',
        itemsList: [],
        f7router: {
          navigate: navigateMock
        }
      },
      global: {
        config: {
          globalProperties: {
            $device: { desktop: false },
            $oh: {
              api: {
                get: apiGetMock,
                put: apiPutMock
              }
            }
          }
        }
      }
    })

    wrapper.vm.load()
    await flushPromises()

    expect(apiGetMock).toHaveBeenCalledWith('/rest/sitemaps/existing_sitemap/definition')
    expect(wrapper.vm.ready).toBe(true)
    expect(wrapper.vm.sitemap.name).toBe('existing_sitemap')
    expect(wrapper.vm.selectedWidget).toBe(wrapper.vm.sitemap)
    expect(wrapper.vm.selectedWidgetParent).toBe(null)
    expect(wrapper.vm.lastCleanSitemap).toEqual(wrapper.vm.stripClosed(wrapper.vm.sitemap))
  })

  it('validates frame does not contain frames', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0].widgets[0], wrapper.vm.sitemap.widgets[0]])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.label = 'Frame Test'

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
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Text')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0].widgets[0], wrapper.vm.sitemap.widgets[0]])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.label = 'Frame Test'

    // should not validate, as empty frame is not allowed
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Frame widget Frame Test should not be empty/)

    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0].widgets[0].widgets[0], wrapper.vm.sitemap.widgets[0].widgets[0]])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Text')
    await wrapper.vm.$nextTick()

    // should validate, as frame in text in frame is allowed
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    wrapper.vm.selectWidget([
      wrapper.vm.sitemap.widgets[0].widgets[0].widgets[0].widgets[0],
      wrapper.vm.sitemap.widgets[0].widgets[0].widgets[0]
    ])
    await wrapper.vm.$nextTick()
    wrapper.vm.removeWidget()
    await wrapper.vm.$nextTick()

    // add a frame inside the frame in the text
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0].widgets[0].widgets[0], wrapper.vm.sitemap.widgets[0].widgets[0]])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([
      wrapper.vm.sitemap.widgets[0].widgets[0].widgets[0].widgets[0],
      wrapper.vm.sitemap.widgets[0].widgets[0].widgets[0]
    ])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.label = 'Frame Test'

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
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Switch')

    // should not validate as the Switch has no item configured
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Switch widget without label, no item configured/)

    // configure an item for the Switch and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0].widgets[0], wrapper.vm.sitemap.widgets[0]])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates url is checked', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Webview')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.label = 'Webview Test'

    // should not validate as the Webview has no url configured
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Webview widget Webview Test, no url configured/)

    // configure a url for the Webview and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.url = 'https://test.html'
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates period is configured and valid', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Chart')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.label = 'Chart Test'

    // should not validate as the Chart has no period configured
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Chart widget Chart Test, invalid period configured: undefined/)

    // configure an invalid period for the Chart
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.period = '5d'
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Chart widget Chart Test, invalid period configured: 5d/)

    // configure a period for the Chart and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.period = '4h'
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure a future period for the Chart and check that there are no validation errors
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.period = '-4h'
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure a combined past and future period for the Chart and check that there are no validation errors
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.period = '4h-4h'
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure an ISO-8601 period for the Chart and check that there are no validation errors
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.period = 'P10M2W1DT12H30M'
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure a combined past and future ISO-8601 and classic period for the Chart and check that there are no validation errors
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.period = '4h-P10M2W1DT12H30M'
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates step is positive', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Slider')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.label = 'Slider Test'

    // no step, should validate
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure a negative step, should not validate
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.step = -1
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Slider widget Slider Test, step size cannot be 0 or negative: -1/)

    // configure a 0 step, should not validate
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.step = 0
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Slider widget Slider Test, step size cannot be 0 or negative: 0/)

    // configure a positive step, should validate
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.step = 5
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates minValue less than or equal maxValue', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Setpoint')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.label = 'Setpoint Test'

    // no minValue or maxValue, should validate
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure a minValue more than maxValue, should not validate
    lastDialogConfig = null
    wrapper.vm.selectedWidget.minValue = 10
    wrapper.vm.selectedWidget.maxValue = 5
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Setpoint widget Setpoint Test, minValue must be less than or equal maxValue: 10 > 5/)

    // configure a minValue equal to maxValue, should validate
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.minValue = 5
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // configure a minValue less to maxValue, should validate
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.minValue = 1
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates mappings', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Selection')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.label = 'Selection Test'
    wrapper.vm.selectedWidget.mappings = [{ command: '', label: 'Morning' }]

    // should not validate as the mapping has a syntax error
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Selection widget Selection Test, syntax error in mappings: =Morning/)

    // populated mappings are currently flagged by the mapping validator
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.mappings = [
      { command: '1', label: 'Morning' },
      { command: '2', label: 'Evening' },
      { command: '10', label: 'Cinéma' },
      { command: '11', label: 'TV' },
      { command: '3 time', label: 'Bed time' },
      { command: '4', label: 'Night', icon: 'moon' }
    ]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates mappings with release command', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Switch')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.label = 'Switch Test'
    wrapper.vm.selectedWidget.mappings = [{ command: 'Morning' }]

    // should not validate as the mapping has a syntax error
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Switch widget Switch Test, syntax error in mappings: Morning/)

    // configure a correct mapping and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.mappings = [{ command: 'ON', label: 'ON' }]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // releaseCommand does not change the current validator outcome when command and label are populated
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.mappings = [{ command: 'ON', releaseCommand: 'OFF', label: 'ON' }]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()

    // release-only mappings currently pass validation
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.mappings = [{ command: '0N command', releaseCommand: 'OFF command', label: 'ON', icon: 'icon' }]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates a buttongrid with buttons argument', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Buttongrid')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.label = 'Buttongrid Test'

    // should not validate as no buttons defined
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Buttongrid widget Buttongrid Test, no buttons defined/)

    // add button, should not validate as the button has no row defined
    lastDialogConfig = null
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.buttons = [{ column: 1, command: '1', label: 'Morning' }]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Buttongrid widget Buttongrid Test, Buttongrid button must have positive row index/)

    // configure a correct row, should not validate as wrong column set
    lastDialogConfig = null
    wrapper.vm.selectedWidget.buttons = [{ row: 1, column: 'column', command: '1', label: 'Morning' }]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Buttongrid widget Buttongrid Test, Buttongrid button must have positive column index/)

    // configure a correct column, should not validate as wrong command set
    lastDialogConfig = null
    wrapper.vm.selectedWidget.buttons = [{ row: 1, column: 2, command: 'Morning' }]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Buttongrid widget Buttongrid Test, syntax error in button command: Morning/)

    // configure correct commands, should not validate as duplicate positions
    lastDialogConfig = null
    wrapper.vm.selectedWidget.buttons = [
      { row: 1, column: 1, command: '1', label: 'Morning' },
      { row: 1, column: 1, command: '2', label: 'Evening' }
    ]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Buttongrid widget Buttongrid Test, Buttongrid button already exists for position \(1,1\)/)

    // configure a correct command and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectedWidget.buttons = [
      { row: 1, column: 1, command: '1', label: 'Morning' },
      { row: 1, column: 3, command: '2', label: 'Evening' },
      { row: 2, column: 1, command: '10', label: 'Cinéma' },
      { row: 2, column: 2, command: '11', label: 'TV' },
      { row: 2, column: 3, command: '3', label: 'Bed time' },
      { row: 3, column: 2, command: '4', label: 'night', icon: 'moon' }
    ]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates a buttongrid with button components', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Buttongrid')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.label = 'Buttongrid Test'
    await wrapper.vm.$nextTick()

    // should not validate as no buttons are defined
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Buttongrid widget Buttongrid Test, no buttons defined/)

    // add button, should not validate as the button has no row defined
    lastDialogConfig = null
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Button')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.label = 'Morning'
    wrapper.vm.selectedWidget.column = 1
    await wrapper.vm.$nextTick()
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Button widget Morning, doesn't have positive row index defined/)

    // configure a correct row, should not validate as wrong column set
    lastDialogConfig = null
    wrapper.vm.selectedWidget.row = 1
    wrapper.vm.selectedWidget.column = 'column'
    await wrapper.vm.$nextTick()
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Button widget Morning, doesn't have positive column index defined/)

    // configure a correct column, should not validate as no item set
    lastDialogConfig = null
    wrapper.vm.selectedWidget.column = 1
    await wrapper.vm.$nextTick()
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Button widget Morning, no item configured/)

    // configure an item, should not validate as no command set
    lastDialogConfig = null
    wrapper.vm.selectedWidget.item = 'Item1'
    await wrapper.vm.$nextTick()
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Button widget Morning, doesn't have click command defined/)

    // configure a command
    lastDialogConfig = null
    wrapper.vm.selectedWidget.command = 1
    await wrapper.vm.$nextTick()

    // add a second button with duplicate position, should not validate
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Button')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.label = 'Evening'
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.row = 1
    wrapper.vm.selectedWidget.column = 1
    wrapper.vm.selectedWidget.command = 2
    await wrapper.vm.$nextTick()
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Button widget Evening, already exists for position \(1,1\)/)

    // move second button and add third button; should validate
    lastDialogConfig = null
    wrapper.vm.selectedWidget.row = 1
    wrapper.vm.selectedWidget.column = 3
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Button')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.label = 'Cinéma'
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.row = 2
    wrapper.vm.selectedWidget.column = 1
    wrapper.vm.selectedWidget.command = 10
    await wrapper.vm.$nextTick()
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates visibility', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Text')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.label = 'Text Test'
    wrapper.vm.selectedWidget.visibilityRules = [{ conditions: [{ item: true, condition: '>=' }] }]

    // should not validate as the visibilityRules has a syntax error
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Text widget Text Test, syntax error in visibilityRules/)

    // configure a correct visibilityRules and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.visibilityRules = [
      { conditions: [{ item: 'Day_time', condition: '==', value: 'Morning Time' }] },
      { conditions: [{ item: 'Bettery', condition: '>', value: 50 }] },
      { conditions: [{ item: 'Battery_Level', condition: '>=', value: 20 }] }
    ]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })

  it('validates valuecolor', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Text')
    await wrapper.vm.$nextTick()
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.item = 'Item1'
    wrapper.vm.selectedWidget.label = 'Text Test'
    wrapper.vm.selectedWidget.valueColorRules = [{ conditions: [{ item: false, condition: '>=' }] }]

    // should not validate as the valueColorRules has a syntax error
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeTruthy()
    expect(lastDialogConfig.content).toMatch(/Text widget Text Test, syntax error in valueColorRules/)

    // configure a correct valueColorRules and check that there are no validation errors anymore
    lastDialogConfig = null
    wrapper.vm.selectWidget([wrapper.vm.sitemap.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.selectedWidget.valueColorRules = [
      { conditions: [{ item: 'Heat_Warning', condition: '==', value: 'It is hot' }], argument: 'gray' },
      { conditions: [{ item: 'Last_Update', condition: '==', value: 'Uninitialized' }], argument: 'grey' },
      { conditions: [{ item: 'Item_Name', condition: '>=', value: 25 }], argument: 'orange' },
      {
        conditions: [
          { item: 'Item', condition: '==', value: 15 },
          { item: 'Heat_Warning', condition: '==', value: 'It is a nice temperature' }
        ],
        argument: 'green'
      },
      { conditions: [{ item: 'Temperature', condition: '==', value: 20 }], argument: 'white' },
      { conditions: [{ item: 'Status', condition: '==', value: 'online' }], argument: 'blue' }
    ]
    wrapper.vm.validateWidgets()
    expect(lastDialogConfig).toBeFalsy()
  })
})
