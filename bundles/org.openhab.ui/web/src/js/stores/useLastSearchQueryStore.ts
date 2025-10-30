import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLastSearchQueryStore = defineStore('lastSearchQuery', () => {
  // States
  const lastItemSearchQuery = ref<string>('')
  const lastThingsSearchQuery = ref<string>('')
  const lastPagesSearchQuery = ref<string>('')
  const lastScheduleSearchQuery = ref<string>('')
  const lastModelSearchQuery = ref<string>('')
  const lastRulesSearchQuery = ref<object>({})
  const lastTransformationSearchQuery = ref<string>('')

  return {
    lastItemSearchQuery,
    lastThingsSearchQuery,
    lastPagesSearchQuery,
    lastScheduleSearchQuery,
    lastModelSearchQuery,
    lastRulesSearchQuery,
    lastTransformationSearchQuery
  }
})
