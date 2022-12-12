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
})
