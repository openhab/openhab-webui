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
    const widget = {
    }
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
    const widget = {
    }
    addWidget(component, 'Selection', {
      item: 'Scene_General',
      mappings: [
        '1=Morning',
        '2=Evening',
        '10=Cinéma',
        '11=TV',
        '3=Bed time',
        '4=Night'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Selection item=Scene_General mappings=[1=Morning,2=Evening,10="Cinéma",11=TV,3="Bed time",4=Night]')
  })

  it('renders a widget with mappings and string keys correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    const widget = {
    }
    addWidget(component, 'Selection', {
      item: 'Echos',
      mappings: [
        'EchoDot1=Echo 1',
        'EchoDot2=Echo 2',
        'EchoDot1,EchoDot2=Alle'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Selection item=Echos mappings=[EchoDot1="Echo 1",EchoDot2="Echo 2","EchoDot1,EchoDot2"=Alle]')
  })

  it('renders a widget with 0 value parameter correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    const widget = {
    }
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
    const widget = {
    }
    addWidget(component, 'Text', {
      item: 'Test',
      visibility: [
        'Battery<30',
        'Battery>50',
        'Battery_Level>=20'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Text item=Test visibility=[Battery<30,Battery>50,Battery_Level>=20]')
  })

  it('renders widget with visibility and text condition correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    const widget = {
    }
    addWidget(component, 'Switch', {
      item: 'Test',
      visibility: [
        'Day_Time==Morning Time',
        'Temperature>19'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Switch item=Test visibility=[Day_Time=="Morning Time",Temperature>19]')
  })

  it('renders widget with valuecolor correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    const widget = {
    }
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
    expect(sitemap[1]).toEqual('    Text item=Temperature valuecolor=[Last_Update==Uninitialized="gray",>=25="orange",==15="green",0="white","blue"]')
  })

  it('renders widget with valuecolor and text condition correctly', () => {
    const component = createSitemapComponent('test', 'Test')
    const widget = {
    }
    addWidget(component, 'Text', {
      item: 'Temperature',
      valuecolor: [
        'Heat_Warning==It is hot=gray'
      ]
    })
    const sitemap = dslUtil.toDsl(component).split('\n')
    expect(sitemap[1]).toEqual('    Text item=Temperature valuecolor=[Heat_Warning=="It is hot"="gray"]')
  })
})
