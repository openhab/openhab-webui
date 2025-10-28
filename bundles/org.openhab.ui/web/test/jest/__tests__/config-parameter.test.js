import ConfigParameter from '@/components/config/config-parameter.vue'
import { mount } from '@vue/test-utils'

describe('ConfigParameter', () => {
  const configDescription = {
    name: 'test',
    description: 'Test Parameter',
    type: 'TEXT',
    options: ['choice', 'choice2'],
    limitToOptions: true
  }
  const wrapper = mount(ConfigParameter, {
    props: {
      configDescription,
      value: 'foo'
    }
  })

  it('is an option control', () => {
    expect(wrapper.vm.control).toBeDefined()
    // console.log(wrapper.vm.control.data())
    expect(wrapper.vm.control.data().smartSelectParams).toBeDefined()
    // expect(wrapper.vm.control.data().smartSelectParams.openIn).toBe('popover')
  })
  // it('shows a list of options', () => {
  //   expect(wrapper.vm.smartSelectParams).toBeDefined()
  //   expect(wrapper.vm.smartSelectParams.openIn).toBe('popover')
  // })
  it('renders the description', () => {
    expect(wrapper.find('.param-description').text()).toBe(configDescription.description)
  })
})
