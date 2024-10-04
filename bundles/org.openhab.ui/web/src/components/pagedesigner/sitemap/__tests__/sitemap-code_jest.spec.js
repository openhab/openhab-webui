import SitemapCode from '../sitemap-code.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Framework7 from 'framework7'
import Framework7Vue from 'f7vue'

describe('SitemapCode', () => {
  const localVue = createLocalVue()
  Framework7.use(Framework7Vue)
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(SitemapCode, {
      localVue,
      propsData: {
        sitemap: { uid: 'test', config: { label: 'Test' } }
      },
      stubs: [
        'editor'
      ]
    })
  })

  afterEach(() => wrapper.destroy())

  it('has generated a sitemap definition from the component', () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
  })

  it('parses a new sitemap code back to a component', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    wrapper.vm.updateSitemap('sitemap test1 label="Test1" {\n    Switch item=Item1\n}\n')
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test1 label="Test1"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.config).toBeDefined()
    expect(payload.config.label).toEqual('Test1')
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Switch',
      config: {
        item: 'Item1'
      }
    })
  })

  it('parses a frame definition to a frame component', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Frame {',
      '        Switch item=Item1',
      '        Text label="Text Widget" item=Item2',
      '    }',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toBeDefined()
    expect(payload.slots.widgets[0].component).toEqual('Frame')
    expect(payload.slots.widgets[0].slots.widgets.length).toBe(2)
    expect(payload.slots.widgets[0].slots.widgets[0]).toBeDefined()
    expect(payload.slots.widgets[0].slots.widgets[0]).toEqual({
      component: 'Switch',
      config: {
        item: 'Item1'
      }
    })
    expect(payload.slots.widgets[0].slots.widgets[1]).toBeDefined()
    expect(payload.slots.widgets[0].slots.widgets[1]).toEqual({
      component: 'Text',
      config: {
        item: 'Item2',
        label: 'Text Widget'
      }
    })
  })

  it('parses a staticIcon definition', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Switch item=Item_Icon icon=lightbulb',
      '    Switch item=Item_Icon staticIcon=lightbulb_static',
      '    Switch item=Item_Icon icon=lightbulb staticIcon=lightbulb_static',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(3)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Switch',
      config: {
        item: 'Item_Icon',
        icon: 'lightbulb'
      }
    })
    expect(payload.slots.widgets[1]).toEqual({
      component: 'Switch',
      config: {
        item: 'Item_Icon',
        icon: 'lightbulb_static',
        staticIcon: true
      }
    })
    expect(payload.slots.widgets[2]).toEqual({
      component: 'Switch',
      config: {
        item: 'Item_Icon',
        icon: 'lightbulb'
      }
    })
  })

  it('parses an icon rule correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Default item=Item_Icon icon=[>5=iconify:wi:day-sunny-overcast,<=5 AND Test_Item=="check error"=error]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Default',
      config: {
        item: 'Item_Icon',
        iconrules: [
          '>5=iconify:wi:day-sunny-overcast',
          '<=5 AND Test_Item=="check error"=error'
        ]
      }
    })
  })

  it('parses a Buttongrid component correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Buttongrid item=Scene_General buttons=[1:1:1=Morning, 1:2:2="Evening", 1:3:10="Cinéma",',
      '                                           2:1:11=TV, 2:2:3="Bed time", 2:3:4=Night=moon]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Buttongrid',
      config: {
        item: 'Scene_General',
        buttons: [
          { row: 1, column: 1, command: '1=Morning' },
          { row: 1, column: 2, command: '2="Evening"' },
          { row: 1, column: 3, command: '10="Cinéma"' },
          { row: 2, column: 1, command: '11=TV' },
          { row: 2, column: 2, command: '3="Bed time"' },
          { row: 2, column: 3, command: '4=Night=moon' }
        ]
      }
    })
  })

  it('parses a Buttongrid with Button components correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Buttongrid label="Scenes" staticIcon=screen {',
      '        Button row=1 column=1 item=Scene_General label=Morning stateless click=1',
      '        Button row=1 column=2 item=Scene_General label="Cinéma" click="10" release="11"',
      '    }',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Buttongrid',
      config: {
        label: 'Scenes',
        staticIcon: true,
        icon: 'screen'
      },
      slots: {
        widgets: [{
          component: 'Button',
          config: {
            row: 1,
            column: 1,
            item: 'Scene_General',
            label: 'Morning',
            stateless: true,
            cmd: 1
          }
        },
        {
          component: 'Button',
          config: {
            row: 1,
            column: 2,
            item: 'Scene_General',
            label: 'Cinéma',
            cmd: '10',
            releaseCmd: '11'
          }
        }]
      }
    })
  })

  it('parses a mapping code back to a mapping on a component', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Selection item=Scene_General mappings=[1=Morning,2="Evening",10="Cinéma",11=TV,3="Bed time",4=Night=moon]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Selection',
      config: {
        item: 'Scene_General',
        mappings: [
          '1=Morning',
          '2="Evening"',
          '10="Cinéma"',
          '11=TV',
          '3="Bed time"',
          '4=Night=moon'
        ]
      }
    })
  })

  it('parses a mapping with string keys', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Selection item=Echos mappings=[EchoDot1="Echo 1", EchoDot2="Echo 2", "EchoDot1,EchoDot2"=Alle]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Selection',
      config: {
        item: 'Echos',
        mappings: [
          'EchoDot1="Echo 1"',
          'EchoDot2="Echo 2"',
          '"EchoDot1,EchoDot2"=Alle'
        ]
      }
    })
  })

  it('parses a mapping with release command', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Switch item=PressAndRelease mappings=[ON:OFF=ON]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Switch',
      config: {
        item: 'PressAndRelease',
        mappings: [
          'ON:OFF=ON'
        ]
      }
    })
  })

  it('parses a mapping with release command and string commands', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Switch item=PressAndRelease mappings=["ON command":"OFF command"="ON"]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Switch',
      config: {
        item: 'PressAndRelease',
        mappings: [
          '"ON command":"OFF command"="ON"'
        ]
      }
    })
  })

  it('parses a widget with visibility correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Text item=Test visibility=[Battery<30,Battery>50,Battery_Level>=20]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Text',
      config: {
        item: 'Test',
        visibility: [
          'Battery<30',
          'Battery>50',
          'Battery_Level>=20'
        ]
      }
    })
  })

  it('parses a widget with visibility and text condition correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Switch item=Test visibility=[Day_Time=="Morning Time",Temperature>19]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Switch',
      config: {
        item: 'Test',
        visibility: [
          'Day_Time=="Morning Time"',
          'Temperature>19'
        ]
      }
    })
  })

  it('parses a widget with valuecolor correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Text item=Temperature valuecolor=[Last_Update==Uninitialized=gray,>=25=orange,==15=green,0=white,blue]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Text',
      config: {
        item: 'Temperature',
        valuecolor: [
          'Last_Update==Uninitialized=gray',
          '>=25=orange',
          '==15=green',
          '0=white',
          'blue'
        ]
      }
    })
  })

  it('parses a widget with valuecolor and text condition correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Text item=Temperature valuecolor=[Heat_Warning=="It is hot"=gray]',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Text',
      config: {
        item: 'Temperature',
        valuecolor: [
          'Heat_Warning=="It is hot"=gray'
        ]
      }
    })
  })

  it('parses a chart widget correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Chart item=Temperature period=4h',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Chart',
      config: {
        item: 'Temperature',
        period: '4h'
      }
    })
  })

  it('parses a chart widget with future period correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Chart item=Temperature period=-4h',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Chart',
      config: {
        item: 'Temperature',
        period: '-4h'
      }
    })
  })

  it('parses a chart widget with past and ISO-8601 future period correctly', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    const sitemap = [
      'sitemap test label="Test" {',
      '    Chart item=Temperature period=4h-P1DT12H',
      '}',
      ''
    ].join('\n')
    wrapper.vm.updateSitemap(sitemap)
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
    expect(wrapper.vm.parsedSitemap.error).toBeFalsy()

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.slots).toBeDefined()
    expect(payload.slots.widgets).toBeDefined()
    expect(payload.slots.widgets.length).toBe(1)
    expect(payload.slots.widgets[0]).toEqual({
      component: 'Chart',
      config: {
        item: 'Temperature',
        period: '4h-P1DT12H'
      }
    })
  })
})
