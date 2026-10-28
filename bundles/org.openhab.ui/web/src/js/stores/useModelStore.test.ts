import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import * as api from '@/api'
import { useModelStore } from '@/js/stores/useModelStore'

vi.mock('@/api', () => ({ getItems: vi.fn() }))
vi.mock('@/js/openhab/auth', () => ({ authorize: vi.fn() }))
vi.mock('@/js/i18n', () => ({ i18n: { global: { t: (key: string) => key } } }))

function item(name: string, semanticsValue: string, config: Record<string, string> = {}) {
  return {
    name,
    label: name,
    type: semanticsValue.startsWith('Point') ? 'Number' : 'Group',
    metadata: { semantics: { value: semanticsValue, config } }
  }
}

describe('useModelStore.loadSemanticModel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  async function load(items: ReturnType<typeof item>[]) {
    vi.mocked(api.getItems).mockResolvedValue(items as never)
    const store = useModelStore()
    await store.loadSemanticModel()
    return store
  }

  it('lists a Point that is a direct member of a Location and an Equipment on both', async () => {
    const store = await load([
      item('Room', 'Location_Indoor_Room'),
      item('Sensor', 'Equipment_Sensor', { hasLocation: 'Room' }),
      item('Humidity', 'Point_Measurement', { hasLocation: 'Room', isPointOf: 'Sensor', relatesTo: 'Property_Humidity' }),
      item('Temperature', 'Point_Measurement', { isPointOf: 'Sensor', relatesTo: 'Property_Temperature' })
    ])

    const room = store.locations.find((l) => l.key === 'Room')!
    expect(room.properties.map((p) => p.name)).toEqual(['Humidity'])

    const sensor = room.equipment.find((e) => e.name === 'Sensor')!
    expect(sensor.points.map((p) => p.name).sort()).toEqual(['Humidity', 'Temperature'])
    expect(sensor.equipmentOrPoints.map((p) => p.name).sort()).toEqual(['Humidity', 'Temperature'])
    expect(sensor.properties.map((p) => p.name).sort()).toEqual(['Humidity', 'Temperature'])
  })

  it('keeps the Location as parent of such a Point', async () => {
    const store = await load([
      item('Room', 'Location_Indoor_Room'),
      item('Sensor', 'Equipment_Sensor', { hasLocation: 'Room' }),
      item('Humidity', 'Point_Measurement', { hasLocation: 'Room', isPointOf: 'Sensor' })
    ])

    const room = store.locations.find((l) => l.key === 'Room')!
    const sensor = room.equipment.find((e) => e.name === 'Sensor')!
    expect(room.item.points.map((p) => p.name)).toEqual(['Humidity'])
    expect(room.item.children.map((c) => c.name).sort()).toEqual(['Humidity', 'Sensor'])
    expect(sensor.children).toEqual([])
  })

  it('does not duplicate a Point that only belongs to an Equipment', async () => {
    const store = await load([
      item('Room', 'Location_Indoor_Room'),
      item('Sensor', 'Equipment_Sensor', { hasLocation: 'Room' }),
      item('Temperature', 'Point_Measurement', { isPointOf: 'Sensor' })
    ])

    const sensor = store.locations.find((l) => l.key === 'Room')!.equipment.find((e) => e.name === 'Sensor')!
    expect(sensor.points.map((p) => p.name)).toEqual(['Temperature'])
    expect(store.locations.find((l) => l.key === 'Room')!.item.points).toEqual([])
  })

  it('does not add a Point that only belongs to a Location to any Equipment', async () => {
    const store = await load([
      item('Room', 'Location_Indoor_Room'),
      item('Sensor', 'Equipment_Sensor', { hasLocation: 'Room' }),
      item('Humidity', 'Point_Measurement', { hasLocation: 'Room' })
    ])

    const room = store.locations.find((l) => l.key === 'Room')!
    expect(room.item.points.map((p) => p.name)).toEqual(['Humidity'])
    expect(room.equipment.find((e) => e.name === 'Sensor')!.points).toEqual([])
  })
})
