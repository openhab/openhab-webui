import { defineStore } from 'pinia'
import { watch, computed, ref } from 'vue'
import fastDeepEqual from 'fast-deep-equal/es6'
import cloneDeep from 'lodash/cloneDeep'

import * as api from '@/api'
import { ApiError } from '@/js/hey-api'
import { f7 } from 'framework7-vue'

/**
 * The persistence edit store is used by persistence-edit.vue to store data independent of the component's lifecycle.
 */

export const usePersistenceEditStore = defineStore('persistenceEdit', () => {
  // data
  const persistenceDirty = ref(false)
  const newPersistence = ref(false)

  // Store both the current (potentially dirty) and saved (clean) persistence data
  const persistence = ref<api.PersistenceServiceConfiguration | null>(null)
  const savedPersistence = ref<api.PersistenceServiceConfiguration | null>(null)
  const suggestedStrategies = ref<Array<api.PersistenceStrategy>>([])

  // local variables
  let loading = false

  // watch
  watch(
    persistence,
    () => {
      if (!loading) {
        // ignore changes during loading
        persistenceDirty.value = !fastDeepEqual(persistence.value, savedPersistence.value)
      }
    },
    { deep: true }
  )

  // computed
  const editable = computed(() => newPersistence.value || persistence.value?.editable)

  async function loadPersistence(serviceId: string) {
    if (loading) return false
    loading = true

    // Load suggestions in parallel (don't await, failure is OK)
    api
      .getPersistenceServiceStrategySuggestions({ serviceId })
      .then((suggestions) => {
        suggestedStrategies.value = suggestions || []
      })
      .catch(() => {
        console.log('Getting persistence strategy suggestions failed for serviceId:', serviceId, '- default to no suggestions')
        suggestedStrategies.value = []
      })

    try {
      const data = await api.getPersistenceServiceConfiguration({ serviceId })
      persistence.value = data || null
      savedPersistence.value = cloneDeep(persistence.value)
      loading = false
      return true
    } catch (err) {
      // Only handle 404 from persistence endpoint as "new persistence"
      if (err instanceof ApiError && (err.response.status === 204 || err.response.status === 404)) {
        console.log('Persistence configuration not found (204) for serviceId:', serviceId, '- creating new configuration')
        newPersistence.value = true
        loading = false
        return true
      } else {
        console.error('Error loading persistence configuration for serviceId:', serviceId, '- Error:', err)
        f7.toast
          .create({
            text: 'Error loading persistence configuration',
            destroyOnClose: true,
            closeTimeout: 2000
          })
          .open()
        loading = false
        return false
      }
    }
  }

  async function savePersistence() {
    if (!editable.value) return
    if (!persistence.value) return

    const serviceId = persistence.value.serviceId
    api
      .putPersistenceServiceConfiguration({ serviceId: serviceId, persistenceServiceConfiguration: persistence.value })
      .then(() => {
        if (persistence.value) {
          persistence.value.editable = true
        }
        newPersistence.value = false
        savedPersistence.value = cloneDeep(persistence.value)
        persistenceDirty.value = false
        f7.toast
          .create({
            text: 'Persistence configuration saved',
            destroyOnClose: true,
            closeTimeout: 2000
          })
          .open()
      })
      .catch((err) => {
        f7.toast
          .create({
            text: 'Error saving persistence configuration: ' + err,
            destroyOnClose: true,
            closeTimeout: 2000
          })
          .open()
      })
  }

  async function deletePersistence() {
    if (!editable.value) return
    if (!persistence.value) return

    const serviceId = persistence.value.serviceId
    api
      .deletePersistenceServiceConfiguration({ serviceId: serviceId })
      .then(() => {
        persistence.value = null
        savedPersistence.value = null
        newPersistence.value = true
        persistenceDirty.value = false
      })
      .catch((err) => {
        f7.toast
          .create({
            text: 'Error deleting persistence configuration: ' + err,
            destroyOnClose: true,
            closeTimeout: 2000
          })
          .open()
      })
  }

  function revertPersistence() {
    persistence.value = cloneDeep(savedPersistence.value)
    persistenceDirty.value = false
  }

  return {
    persistenceDirty,

    persistence,
    suggestedStrategies,

    editable,
    newPersistence,

    loadPersistence,
    savePersistence,
    deletePersistence,
    revertPersistence
  }
})
