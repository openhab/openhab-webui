import item2sitemap from 'src/components/cards/item2SitemapModel'

describe('item2sitemap', () => {
  const item = {
    name: 'MyItem',
    label: 'Item label',
    category: 'lightbulb',
    type: 'Dimmer'
  }
  const widget = item2sitemap(item)

  it('puts the item category as icon', () => {
    expect(widget.icon).toEqual(item.category)
  })
  it('transforms Dimmer into sliders', () => {
    expect(widget.type).toEqual('Slider')
  })
})
