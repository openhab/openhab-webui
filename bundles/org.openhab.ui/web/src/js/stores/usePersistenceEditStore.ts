import { defineStore } from 'pinia'
import { watch, computed, ref } from 'vue'
import fastDeepEqual from 'fast-deep-equal/es6'
import cloneDeep from 'lodash/cloneDeep'

import * as api from '@/api'
import { f7 } from 'framework7-vue'

/**
 * The persistence edit store is used by persistence-edit.vue to store data independent of the component's lifecycle.
 */

export const usePersistenceEditStore = defineStore('persistenceEdit', () => {
  // data
  const loading = ref(false)
  const persistenceDirty = ref(false)
  const newPersistence = ref(false)
  const skipLoadOnReturn = ref(false)

  // Store both the current (potentially dirty) and saved (clean) persistence data
  const persistence = ref<api.PersistenceServiceConfiguration>({})
  const savedPersistence = ref<api.PersistenceServiceConfiguration>({})
  const suggestedStrategies = ref<Array<api.PersistenceStrategy>>([])

  // watch
  watch(
    persistence,
    () => {
      if (!loading.value) {
        // ignore changes during loading
        persistenceDirty.value = !fastDeepEqual(persistence.value, savedPersistence.value)
      }
    },
    { deep: true }
  )

  // computed
  const editable = computed(() => newPersistence.value || persistence.value?.editable)

  function loadPersistence(serviceId: string, loadingFinishedCallback: (success: boolean) => void) {
    if (loading.value) return
    if (skipLoadOnReturn.value) {
      loadingFinishedCallback(true)
      skipLoadOnReturn.value = false
      return
    }
    loading.value = true

    api
      .getPersistenceServiceStrategySuggestions({ serviceId })
      .then((suggestions) => {
        suggestedStrategies.value = suggestions
      })
      .catch(() => {
        console.log('Getting persistence strategy suggestions failed for serviceId:', serviceId, '- default to no suggestions')
        suggestedStrategies.value = []
      })
      .then(() => {
        return api.getPersistenceServiceConfiguration({ serviceId })
      })
      .then((data) => {
        persistence.value = data
        savedPersistence.value = cloneDeep(persistence.value)
        loadingFinishedCallback(true)
        skipLoadOnReturn.value = false
        loading.value = false
      })
      .catch((err) => {
        // Only handle 404 from persistence endpoint as "new persistence"
        if (err === 404 || err === 'Not Found') {
          console.log('Persistence configuration not found (404) for serviceId:', serviceId, '- creating new configuration')
          newPersistence.value = true
          loadingFinishedCallback(true)
          skipLoadOnReturn.value = false
          loading.value = false
        } else {
          console.error('Error loading persistence configuration for serviceId:', serviceId, '- Error:', err)
          f7.toast
            .create({
              text: 'Error loading persistence configuration',
              destroyOnClose: true,
              closeTimeout: 2000
            })
            .open()
          loadingFinishedCallback(false)
          skipLoadOnReturn.value = false
          loading.value = false
        }
      })
  }

  async function savePersistence() {
    if (!editable.value) return

    const serviceId = persistence.value.serviceId
    api
      .updatePersistenceServiceConfiguration({ serviceId: serviceId, body: persistence.value})
      .then(() => {
        persistence.value.editable = true
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
    const serviceId = persistence.value.serviceId
    api
      .deletePersistenceServiceConfiguration({serviceId: serviceId})
      .then(() => {
        persistence.value = {}
        savedPersistence.value = {}
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
    skipLoadOnReturn,

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
