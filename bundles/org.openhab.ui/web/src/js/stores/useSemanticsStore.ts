import { defineStore } from 'pinia'
import { ref } from 'vue'

import api from '@/js/openhab/api'
import { type I18n } from 'vue-i18n'
import { useRuntimeStore } from './useRuntimeStore'

import { type Tag } from '@/types/openhab'
interface ModelTag extends Tag {
  parent: string
}

export const useSemanticsStore = defineStore('semantics', () => {
  // State
  const Tags = ref<ModelTag[]>([])
  const Locations = ref<string[]>([])
  const Equipment = ref<string[]>([])
  const Points = ref<string[]>([])
  const Properties = ref<string[]>([])
  const Labels = ref<{ [key: string]: string }>({})
  const Descriptions = ref<{ [key: string]: string }>({})
  const Synonyms = ref<{ [key: string]: string | string[] }>({})
  const ready = ref<boolean>(false)

  // Actions
  function setSemantics (tags: ModelTag[], i18n: I18n) {
    Tags.value = tags
    Tags.value.forEach((tag) => {
      const tagParts = tag.uid.split('_')
      tag.parent = tagParts.slice(0, -1).join('_')
    })
    Locations.value = tags.filter((t) => t.uid.startsWith('Location')).map((t) => t.name)
    Equipment.value = tags.filter((t) => t.uid.startsWith('Equipment')).map((t) => t.name)
    Points.value = tags.filter((t) => t.uid.startsWith('Point')).map((t) => t.name)
    Properties.value = tags.filter((t) => t.uid.startsWith('Property')).map((t) => t.name)
    // Clear existing labels, descriptions & synonyms
    Labels.value = {}
    Descriptions.value = {}
    Synonyms.value = {}
    // Store labels, descriptions & synonyms
    for (const i in tags) {
      const t = tags[i]
      Labels.value[t.name] = t.label || t.name
      Descriptions.value[t.name] = t.description || ''
      Synonyms.value[t.name] = t.synonyms || []
    }
    // Save labels as i18n messages
    // @ts-expect-error   TODO-V3.1
    i18n.global.mergeLocaleMessage(i18n.global.locale.value as string, Labels.value)
  }

  async function loadSemantics (i18n: I18n) {
    console.log('Loading semantic tags ...')
    if (useRuntimeStore().apiEndpoint('tags')) {
      return api
        .get('/rest/tags')
        .then((tags : Tag[]) => {
          let modelTags  = tags as ModelTag[]
          setSemantics(modelTags, i18n)
          console.debug('Successfully loaded semantic tags.')
          ready.value = true
        })
        .catch((e) => {
          console.error('Failed to load semantic tags:')
          console.error(e)
          ready.value = false
          return Promise.reject('Failed to load semantic tags: ' + e)
        })
    } else {
      ready.value = true
      return Promise.resolve()
    }
  }

  return { Locations, Equipment, Points, Properties, Labels, Descriptions, Synonyms, Tags, ready, loadSemantics }
})
