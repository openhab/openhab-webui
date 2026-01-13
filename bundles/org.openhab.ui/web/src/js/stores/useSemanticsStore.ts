import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import { type Composer, type I18n } from 'vue-i18n'
import { useRuntimeStore } from './useRuntimeStore'

import * as api from '@/api'

interface SemanticTagWithParent extends api.EnrichedSemanticTag {
  parent: string
}

export const useSemanticsStore = defineStore('semantics', () => {
  // State
  const Tags = ref<api.EnrichedSemanticTag[]>([])
  const Locations = ref<string[]>([])
  const Equipment = ref<string[]>([])
  const Points = ref<string[]>([])
  const Properties = ref<string[]>([])
  const Labels = ref<{ [key: string]: string }>({})
  const Descriptions = ref<{ [key: string]: string }>({})
  const Synonyms = ref<{ [key: string]: string | string[] }>({})
  const ready = ref<boolean>(false)

  // Actions
  function setSemantics(tags: api.EnrichedSemanticTag[], i18n: I18n) {
    // local variables to avoid writing to reactive refs multiple times
    const modelTags: SemanticTagWithParent[] = []
    const locations: string[] = []
    const equipment: string[] = []
    const points: string[] = []
    const properties: string[] = []
    const labels: { [key: string]: string } = {}
    const descriptions: { [key: string]: string } = {}
    const synonyms: { [key: string]: string | string[] } = {}

    // perform all operations in a single loop to avoid looping through the tags multiple times
    for (const t of tags) {
      const uid = t.uid
      // get parent tag
      const parent = uid.split('_').slice(0, -1).join('_')
      const mt: SemanticTagWithParent = { ...t, parent } // copy into a new ModelTag so we don't mutate the incoming object in-place
      modelTags.push(mt)

      // categorise by type
      if (uid.startsWith('Location')) {
        locations.push(mt.name)
      } else if (uid.startsWith('Equipment')) {
        equipment.push(mt.name)
      } else if (uid.startsWith('Point')) {
        points.push(mt.name)
      } else if (uid.startsWith('Property')) {
        properties.push(mt.name)
      }

      // store labels, descriptions & synonyms
      labels[mt.name] = mt.label || mt.name
      descriptions[mt.name] = mt.description || ''
      synonyms[mt.name] = mt.synonyms || []
    }

    // single assignments to reactive refs to minimise reactivity churn
    Tags.value = modelTags
    Locations.value = locations
    Equipment.value = equipment
    Points.value = points
    Properties.value = properties
    Labels.value = labels
    Descriptions.value = descriptions
    Synonyms.value = synonyms

    // merge labels into i18n once
    try {
      const locale = (i18n.global as Composer).locale.value as string
      ;(i18n.global as Composer).mergeLocaleMessage(locale, labels)
    } catch (e) {
      console.warn('Failed to merge semantic labels into i18n globals', e)
    }
  }

  async function loadSemantics(i18n: I18n) {
    if (useRuntimeStore().apiEndpoint('tags')) {
      return api
        .getSemanticTags()
        .then((data) => {
          if (!data || !data.length) {
            console.warn('No semantic tags found in the API response.')
            ready.value = true
            return Promise.resolve()
          }

          setSemantics(data, i18n)
          console.debug('Successfully loaded semantic tags.')
          ready.value = true
        })
        .catch((e) => {
          console.error('Failed to load semantic tags:', e.message)
          ready.value = false
          return Promise.reject(e)
        })
    } else {
      ready.value = true
      return Promise.resolve()
    }
  }

  return {
    Locations: readonly(Locations),
    Equipment: readonly(Equipment),
    Points: readonly(Points),
    Properties: readonly(Properties),
    Labels: readonly(Labels),
    Descriptions: readonly(Descriptions),
    Synonyms: readonly(Synonyms),
    Tags: readonly(Tags),
    ready: readonly(ready),
    loadSemantics
  }
})
