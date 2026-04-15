import type { Dayjs } from 'dayjs'
import { AggregationFunction } from '@/types/components/widgets'
import type { HistoryDataBean } from '@/api'

export default (
  aggregationFunction: AggregationFunction,
  arr: [Dayjs, HistoryDataBean['state'][]],
  idx: number,
  values: [Dayjs, HistoryDataBean['state'][]][]
) => {
  switch (aggregationFunction) {
    case AggregationFunction.sum:
      return arr[1].reduce((sum: number, state) => sum + parseFloat(state), 0)
    case AggregationFunction.min:
      return arr[1].reduce((min: number, state) => (parseFloat(state) < min ? parseFloat(state) : min), +Infinity)
    case AggregationFunction.max:
      return arr[1].reduce((max: number, state) => (parseFloat(state) > max ? parseFloat(state) : max), -Infinity)
    case AggregationFunction.first:
      return parseFloat(arr[1][0])
    case AggregationFunction.last:
      return parseFloat(arr[1][arr[1].length - 1])
    case AggregationFunction.diffFirst:
      return idx < 1 ? NaN : parseFloat(arr[1][0]) - parseFloat(values[idx - 1][1][0])
    case AggregationFunction.diffLast:
      if (idx < 1) {
        return parseFloat(arr[1][arr[1].length - 1]) - parseFloat(arr[1][0])
      } else {
        return parseFloat(arr[1][arr[1].length - 1]) - parseFloat(values[idx - 1][1][values[idx - 1][1].length - 1])
      }
    case AggregationFunction.average:
      return arr[1].reduce((sum: number, state) => sum + parseFloat(state), 0) / arr[1].length
    default:
      const exhaustiveCheck: never = aggregationFunction
      console.warn('Unknown aggregation function', exhaustiveCheck)
      return parseFloat(arr[1][0])
  }
}
