import PagesList from '../../pages-list.vue'
import SitemapEdit from '../sitemap-edit.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Framework7 from 'framework7'
import Framework7Vue from 'f7vue'

let lastDialogConfig = null

describe('SitemapEdit', () => {
  const localVue = createLocalVue()
  Framework7.use(Framework7Vue)

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
  const wrapper = shallowMount(SitemapEdit, {
    localVue,
    propsData: {
      createMode: true,
      uid: 'test'
    }
  })

  it('has initialized with an empty sitemap', () => {
    expect(wrapper.vm.sitemap).toBeDefined()
    expect(wrapper.vm.sitemap.component).toEqual('Sitemap')
  })

  it('validates widgets correctly', async () => {
    wrapper.vm.selectWidget([wrapper.vm.sitemap, null])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Frame')
    wrapper.vm.selectWidget([wrapper.vm.sitemap.slots.widgets[0], wrapper.vm.sitemap])
    await wrapper.vm.$nextTick()
    wrapper.vm.addWidget('Switch')

    // should not validate as the Switch has no item configured
    lastDialogConfig = null
    wrapper.vm.validateWidgets()
    console.log(lastDialogConfig)
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
})
