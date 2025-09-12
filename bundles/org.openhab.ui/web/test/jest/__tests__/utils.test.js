import util from '@/js/openhab/utils.js'

describe('normalizeLabel', () => {
  test('normalize the label to be a valid item name', () => {
    expect('openHAB_3_0').toEqual(util.normalizeLabel('opénHAB? ₃?$_&.0'))
  })

  test('prepend leading digit with underscore', () => {
    expect('_123').toEqual(util.normalizeLabel('123'))
  })
})
