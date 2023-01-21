export default (aggregationFunction, arr, idx, values) => {
  let aggregate
  switch (aggregationFunction) {
    case 'sum':
      aggregate = arr[1].reduce((sum, state) => sum + parseFloat(state), 0)
      break
    case 'min':
      aggregate = arr[1].reduce((min, state) => parseFloat(state) < min ? parseFloat(state) : min, +Infinity)
      break
    case 'max':
      aggregate = arr[1].reduce((max, state) => parseFloat(state) > max ? parseFloat(state) : max, -Infinity)
      break
    case 'first':
      aggregate = arr[1][0]
      break
    case 'last':
      aggregate = arr[1][arr[1].length - 1]
      break
    case 'diff_first':
      aggregate = idx < 1 ? NaN : arr[1][0] - values[idx - 1][1][0]
      break
    case 'diff_last':
      if (idx < 1) {
        aggregate = arr[1][arr[1].length - 1] - arr[1][0]
      } else {
        aggregate = arr[1][arr[1].length - 1] - values[idx - 1][1][values[idx - 1][1].length - 1]
      }
      break
    case 'average':
      aggregate = arr[1].reduce((sum, state) => sum + parseFloat(state), 0) / arr[1].length
      break
    default:
      aggregate = arr[1][0]
      break
  }

  return aggregate
}
