import { describe, expect, it } from 'vitest'
import { AudioHistory } from './audio-history'

const range = (start: number, end: number) => Float32Array.from({ length: end - start }, (_, i) => start + i)

describe('AudioHistory', () => {
  it('returns the samples from a stream index on', () => {
    const history = new AudioHistory(10)
    history.write(range(0, 4))
    history.write(range(4, 7))

    expect(history.length).toBe(7)
    expect(Array.from(history.readFrom(2))).toEqual([2, 3, 4, 5, 6])
    expect(Array.from(history.readFrom(0))).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('keeps only the most recent samples', () => {
    const history = new AudioHistory(10)
    for (let i = 0; i < 25; i += 3) {
      history.write(range(i, i + 3))
    }

    expect(history.length).toBe(27)
    expect(Array.from(history.readFrom(0))).toEqual(Array.from(range(17, 27)))
    expect(Array.from(history.readFrom(20))).toEqual(Array.from(range(20, 27)))
  })

  it('keeps the end of a write that is longer than the history', () => {
    const history = new AudioHistory(10)
    history.write(range(0, 3))
    history.write(range(3, 18))

    expect(Array.from(history.readFrom(0))).toEqual(Array.from(range(8, 18)))
  })

  it('returns nothing from the next index on', () => {
    const history = new AudioHistory(10)
    history.write(range(0, 5))

    expect(history.readFrom(5).length).toBe(0)
    expect(history.readFrom(8).length).toBe(0)
  })
})
