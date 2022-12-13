import util from 'src/js/openhab/utils.js'

describe('normalizeLabel', () => {
  test('normalize the label to be a valid item name', () => {
    expect('openHAB_3_0').toEqual(util.normalizeLabel('opénHAB? ₃?$_&.0'))
  })
})
