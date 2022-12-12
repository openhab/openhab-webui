import SitemapCode from '../sitemap-code.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Framework7 from 'framework7'
import Framework7Vue from 'f7vue'

describe('SitemapCode', () => {
  const localVue = createLocalVue()
  // localVue.use(AsyncComputed)
  Framework7.use(Framework7Vue)
  const configDescription = {
    name: 'test',
    description: 'Test Parameter',
    type: 'TEXT',
    options: ['choice', 'choice2'],
    limitToOptions: true
  }
  const wrapper = shallowMount(SitemapCode, {
    propsData: {
      sitemap: { uid: 'test', config: { label: 'Test' } }
    },
    stubs: [
      'editor'
    ]
  })

  it('has generated a sitemap definition from the component', () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test label="Test"/)
  })

  it('parses a new sitemap code back to a component', async () => {
    expect(wrapper.vm.sitemapDsl).toBeDefined()
    // simulate updating the sitemap in code
    wrapper.vm.updateSitemap('sitemap test2 label="Test2" {\n    Switch item=Item1\n}\n')
    expect(wrapper.vm.sitemapDsl).toMatch(/^sitemap test2 label="Test2"/)

    await wrapper.vm.$nextTick()

    // check whether an 'updated' event was emitted and its payload
    // (should contain the parsing result for the new sitemap definition)
    const events = wrapper.emitted().updated
    expect(events).toBeTruthy()
    expect(events.length).toBe(1)
    const payload = events[0][0]
    expect(payload.config).toBeDefined()
    expect(payload.config.label).toEqual('Test2')
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
})
