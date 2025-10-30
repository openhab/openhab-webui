import { defineStore } from 'pinia'
import { ref } from 'vue'
import { compareItems } from '@/components/widgets/widget-order'
import { authorize } from '@/js/openhab/auth'
import { i18n } from '@/js/i18n'

import api from '@/js/openhab/api'

import { type Item } from '@/types/openhab'
import type { Composer } from 'vue-i18n'

interface ModelItem extends Item {
  modelPath: Item[]
  parent: ModelItem | null
  children: ModelItem[]
  points: ModelItem[]
  locations: ModelItem[]
  properties: ModelItem[]
  equipment: ModelItem[]
  equipmentOrPoints: ModelItem[]
  semanticLoopDetector?: boolean
}

interface FilteredItems {
  equipment: ModelItem[]
  properties: ModelItem[]
  locations: ModelItem[]
}

interface ModelCard {
  key: string
  defaultTitle: string
}

interface LocationModelCard extends ModelCard {
  item: ModelItem
  properties: ModelItem[]
  equipment: ModelItem[]
}

interface EquipmentModelCard extends ModelCard {
  equipment: ModelItem[]
}

interface PropertyModelCard extends ModelCard {
  points: ModelItem[]
}

function _compareObjects (o1: ModelItem | { item: ModelItem }, o2: ModelItem | { item: ModelItem }): number {
  const obj1 = (o1 && typeof o1 === 'object' && 'item' in o1) ? o1.item : o1
  const obj2 = (o2 && typeof o2 === 'object' && 'item' in o2) ? o2.item : o2

  return compareItems((obj1 as ModelItem), (obj2 as ModelItem))
}

function _buildLocationModelCard (item: ModelItem, key: string) : LocationModelCard {
  return {
    item,
    properties: item.points,
    defaultTitle: item.label || item.name,
    key,
    equipment: item.equipment
  }
}

function _buildEquipmentModelCard (items: ModelItem[], key: string): EquipmentModelCard {
  return {
    key,
    defaultTitle: (i18n.global as Composer).t(key),
    equipment: items
  }
}

function _buildPropertyModelCard (items: ModelItem[], key: string): PropertyModelCard {
  return {
    key,
    defaultTitle: (i18n.global as Composer).t(key),
    points: items
  }
}

function _sortModel (item: ModelItem) {
  item.children = item.children?.sort(compareItems)
  item.locations = item.locations.sort(compareItems)
  item.points = item.points.sort(compareItems)
  item.properties = item.properties.sort(compareItems)
  item.equipment = item.equipment.sort(compareItems)
  item.equipmentOrPoints = item.equipmentOrPoints.sort(compareItems)

  item.children.forEach((child) => _sortModel(child))
}

export const useModelStore = defineStore('model', () => {
  // State
  const locations = ref<LocationModelCard[]>([])
  const equipment = ref<EquipmentModelCard[]>([])
  const properties = ref<PropertyModelCard[]>([])
  const error = ref<any>(null)
  const ready = ref<boolean>(false)

  // Getters
  function getSemanticModelElement (key : string, type : string) : LocationModelCard | EquipmentModelCard | PropertyModelCard | null {
    if(!ready.value) return null

    switch (type) {
      case 'location':
        return locations.value.find((e) => e.key === key) || null
      case 'equipment':
        return equipment.value.find((e) => e.key === key) || null
      case 'property':
        return properties.value.find((e) => e.key === key) || null
      default:
        return null
    }
  }

  // Actions
  // Recursively builds path in model (sorted array of relations to ancestors, either Equipment or Location) for an item
  // that has semantics configuration and returns it.
  // At the same time, adds all items not already processed to the filteredItems property depending on their semantic type.
  function buildPathInModel (item: ModelItem, items: ModelItem[], filteredItems: FilteredItems): Item[] {
    if (!item.metadata || !item.metadata.semantics) return []

    if (item.modelPath) return item.modelPath
    let parent: ModelItem | null | undefined = null
    if (item.metadata.semantics.config && item.metadata.semantics.config.hasLocation) {
      parent = items.find((i) => i.name === item.metadata?.semantics.config?.hasLocation)
    } else if (item.metadata.semantics.config && item.metadata.semantics.config.isPointOf) {
      parent = items.find((i) => i.name === item.metadata?.semantics.config?.isPointOf)
    } else if (item.metadata.semantics.config && item.metadata.semantics.config.isPartOf) {
      parent = items.find((i) => i.name === item.metadata?.semantics.config?.isPartOf)
    }
    if (parent && parent.semanticLoopDetector) {
      throw new Error(
        `A a loop has been detected in the semantic model: ${parent.name} is both descendant and parent of ${item.name}`
      )
    }
    item.parent = (parent) ? parent : null

    item.semanticLoopDetector = true
    item.modelPath = item.parent
      ? [...buildPathInModel(item.parent, items, filteredItems), item.parent]
      : []
    delete item.semanticLoopDetector
    item.children = []
    item.locations = []
    item.points = []
    item.properties = []
    item.equipment = []
    item.equipmentOrPoints = []

    if (parent) parent.children?.push(item)

    if (item.metadata.semantics.value?.startsWith('Location')) {
      if (parent) parent.locations.push(item)
      filteredItems.locations.push(item)
    }

    if (item.metadata.semantics.value?.startsWith('Point')) {
      if (parent) {
        parent.points.push(item)
        parent.equipmentOrPoints.push(item)
      }
    }

    if (item.metadata.semantics.config && item.metadata.semantics.config.relatesTo) {
      if (parent) parent.properties.push(item)
      filteredItems.properties.push(item)
    }

    if (item.metadata.semantics.value?.startsWith('Equipment')) {
      if (parent) {
        parent.equipment.push(item)
        parent.equipmentOrPoints.push(item)
      }
      filteredItems.equipment.push(item)
    }

    return item.modelPath
  }

  async function loadSemanticModel () {
    api.get('/rest/items?staticDataOnly=true&metadata=semantics,listWidget,widgetOrder').then((data: Item[]) => {
      let modelItems = data as ModelItem[]

      let filteredItems: FilteredItems = {
        equipment: [],
        properties: [],
        locations: []
      }

      // build model path for all model items
      modelItems.forEach((item) => {
        if (item.metadata && item.metadata.semantics) buildPathInModel(item, modelItems, filteredItems)
      })

      // Sort each semantic model item children arrays (start at top-level nodes)
      modelItems
        .filter((item) => item.modelPath && item.modelPath.length === 0)
        .forEach((item) => _sortModel(item))

      // get the location items
      const locationItems = filteredItems.locations.sort(_compareObjects)

      // get the equipment items
      const equipmentStruct : { [key: string]: ModelItem[] } = {}
      filteredItems.equipment
        .sort(_compareObjects)
        .forEach((item) => {
          const equipmentType = item.metadata?.semantics.value?.substring(item.metadata.semantics.value.lastIndexOf('_'))
            .replace('_', '')
          if(equipmentType) {
            if(!equipmentStruct[equipmentType]) equipmentStruct[equipmentType] = []
            equipmentStruct[equipmentType].push(item)
          }
        })

      // get the property items
      const propertyStruct : { [key: string]: ModelItem[] } = {}
      filteredItems.properties
        .sort(_compareObjects)
        .forEach((item) => {
          const property = item.metadata?.semantics.config?.relatesTo.split('_')[1]
          if (property) {
            if (!propertyStruct[property]) propertyStruct[property] = []
            propertyStruct[property].push(item)
          }
        })

      locations.value = locationItems.map((l) => _buildLocationModelCard(l, l.name))
      equipment.value = Object.keys(equipmentStruct)
        .sort((a: string, b: string) => (i18n.global as Composer).t(a).localeCompare((i18n.global as Composer).t(b)))
        .map((k) => _buildEquipmentModelCard(equipmentStruct[k], k))
      properties.value = Object.keys(propertyStruct)
        .sort((a: string, b: string) => (i18n.global as Composer).t(a).localeCompare((i18n.global as Composer).t(b)))
        .map((k) => _buildPropertyModelCard(propertyStruct[k], k))

      ready.value = true
    })
      .catch((e) => {
        console.error('Error while loading model:')
        console.error(e)
        if (e === 'Unauthorized' || e === 401) {
          authorize()
        }
        error.value = e
        Promise.reject('Failed to load semantic model: ' + e)
      })
  }

  return { locations, equipment, properties, ready, loadSemanticModel, getSemanticModelElement }
})
