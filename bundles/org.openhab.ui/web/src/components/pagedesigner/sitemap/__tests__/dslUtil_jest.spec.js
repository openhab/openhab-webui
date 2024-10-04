import dslUtil from '../dslUtil'

function createSitemapComponent (uid, label) {
  return {
    uid: 'test',
    component: 'Sitemap',
    config: {
      label: 'Test'
    },
    slots: {
      widgets: []
    }
  }
}
function addWidget (parentWidget, component, config) {
  if (!parentWidget.slots) {
    parentWidget.slots = { widgets: [] }
  }
  const widget = { component, config }
  parentWidget.slots.widgets.push(widget)
  return widget
}

describe('dslUtil', () => {
  it('renders an empty sitemap correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap).toEqual([
      'sitemap test label="Test" {',
      '}',
      ''
    ])
    // console.log(sitemap)
  })

  it('renders a single simple widget correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Switch', {
      item: 'TestItem',
      label: 'Test Switch'
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap).toEqual([
      'sitemap test label="Test" {',
      '    Switch item=TestItem label="Test Switch"',
      '}',
      ''
    ])
  })

  it('renders a widget with icon correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Switch', {
      item: 'TestItem',
      label: 'Test Switch',
      icon: 'lightbulb'
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap).toEqual([
      'sitemap test label="Test" {',
      '    Switch item=TestItem label="Test Switch" icon=lightbulb',
      '}',
      ''
    ])
  })

  it('renders a widget with static icon correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Switch', {
      item: 'TestItem',
      label: 'Test Switch',
      icon: 'lightbulb',
      staticIcon: true
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap).toEqual([
      'sitemap test label="Test" {',
      '    Switch item=TestItem label="Test Switch" staticIcon=lightbulb',
      '}',
      ''
    ])
  })

  it('renders a sitemap with a frame container widget correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    const frame = addWidget(component, 'Frame', {})
    addWidget(frame, 'Switch', { item: 'Item1' })
    addWidget(frame, 'Text', { label: 'Text Widget', item: 'Item2' })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap).toEqual([
      'sitemap test label="Test" {',
      '    Frame {',
      '        Switch item=Item1',
      '        Text label="Text Widget" item=Item2',
      '    }',
      '}',
      ''
    ])
  })

  it('renders a widget with mappings correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Selection', {
      item: 'Scene_General',
      mappings: [
        '1=Morning',
        '2=Evening',
        '10="Cinéma"',
        '11=TV',
        '3="Bed time"',
        '4=Night=moon'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Selection item=Scene_General mappings=[1=Morning, 2=Evening, 10="Cinéma", 11=TV, 3="Bed time", 4=Night=moon]')
  })

  it('renders a Buttongrid widget correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Buttongrid', {
      item: 'Scene_General',
      buttons: [
        { row: 1, column: 1, command: '1=Morning' },
        { row: 1, column: 2, command: '2=Evening' },
        { row: 1, column: 3, command: '10="Cinéma"' },
        { row: 2, column: 1, command: '11=TV' },
        { row: 2, column: 2, command: '3="Bed time"' },
        { row: 2, column: 3, command: '4=Night=moon' }
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Buttongrid item=Scene_General buttons=[1:1:1=Morning, 1:2:2=Evening, 1:3:10="Cinéma", 2:1:11=TV, 2:2:3="Bed time", 2:3:4=Night=moon]')
  })

  it('renders a Buttongrid with Buttons widget correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    const widget = addWidget(component, 'Buttongrid', {
      label: "Scenes",
      staticIcon: true,
      icon: "screen"
    })
    addWidget(widget, "Button", {
      row: 1,
      column: 1,
      item: "Scene_General",
      label: "Morning",
      stateless: true,
      cmd: 1
    })
    addWidget(widget, "Button", {
      row: 1,
      column: 2,
      item: "Scene_General",
      label: "Cinéma",
      cmd: "10",
      releaseCmd: "test 11"
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Buttongrid label="Scenes" staticIcon=screen {')
    expect(sitemap[2]).toEqual('        Button row=1 column=1 item=Scene_General label="Morning" stateless click=1')
    expect(sitemap[3]).toEqual('        Button row=1 column=2 item=Scene_General label="Cinéma" click="10" release="test 11"')
  })

  it('renders a widget with mappings and string keys correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Selection', {
      item: 'Echos',
      mappings: [
        'EchoDot1="Echo 1"',
        'EchoDot2="Echo 2"',
        '"EchoDot1,EchoDot2"=Alle'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Selection item=Echos mappings=[EchoDot1="Echo 1", EchoDot2="Echo 2", "EchoDot1,EchoDot2"=Alle]')
  })

  it('renders a widget with mappings and release command correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Switch', {
      item: 'pressAndRelease',
      mappings: ['ON:OFF=ON']
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Switch item=pressAndRelease mappings=[ON:OFF=ON]')
  })

  it('renders a widget with mappings and release command and string commands correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Switch', {
      item: 'pressAndRelease',
      mappings: ['"ON command":"OFF command"="ON"']
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Switch item=pressAndRelease mappings=["ON command":"OFF command"="ON"]')
  })

  it('renders a widget with 0 value parameter correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Slider', {
      item: 'Dimmer1',
      minValue: 0,
      maxValue: 100,
      step: 5
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Slider item=Dimmer1 minValue=0 maxValue=100 step=5')
  })

  it('renders widget with visibility correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Text', {
      item: 'Test',
      visibility: [
        'Battery<30',
        'Battery>50',
        'Battery_Level>=20'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Text item=Test visibility=[Battery<30, Battery>50, Battery_Level>=20]')
  })

  it('renders widget with visibility and text condition correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Switch', {
      item: 'Test',
      visibility: [
        'Day_Time==Morning Time',
        'Temperature>19'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Switch item=Test visibility=[Day_Time=="Morning Time", Temperature>19]')
  })

  it('renders widget with valuecolor correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Text', {
      item: 'Temperature',
      valuecolor: [
        'Last_Update==Uninitialized=gray',
        '>=25=orange',
        '==15=green',
        '0=white',
        'blue'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Text item=Temperature valuecolor=[Last_Update==Uninitialized="gray", >=25="orange", ==15="green", 0="white", "blue"]')
  })

  it('renders widget with valuecolor and text condition correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Text', {
      item: 'Temperature',
      valuecolor: [
        'Heat_Warning==It is hot=gray'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Text item=Temperature valuecolor=[Heat_Warning=="It is hot"="gray"]')
  })

  it('renders widget with valuecolor and AND condition correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    addWidget(component, 'Text', {
      item: 'Temperature',
      valuecolor: [
        'Heat_Warning==It is hot AND >=25=gray'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Text item=Temperature valuecolor=[Heat_Warning=="It is hot" AND >=25="gray"]')
  })
})
