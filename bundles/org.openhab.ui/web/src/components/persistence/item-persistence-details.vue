<template>
  <f7-card v-if="item.type !== 'Group' || 'groupType' in item">
    <f7-card-content v-if="loaded && services.length > 0">
      <f7-list media-list>
        <f7-list-item
          v-for="p in services"
          :key="p.id"
          media-item
          :title="p.label"
          :subtitle="strategies[p.id]?.join(', ') || 'Not persisted'"
          :badge="persistedBadges[p.id]"
          badge-color="green"
          :class="!p.editable ? 'item-persistence-badge-non-editable' : ''"
          :link="p.editable ? '/settings/persistence/' + p.id : null">
          <template #media>
            <span class="item-initial">{{ p.id ? p.id[0] : '?' }}</span>
          </template>
          <template #after>
            <f7-icon v-if="!p.editable" f7="lock_fill" size="1rem" color="gray" />
          </template>
        </f7-list-item>
      </f7-list>
    </f7-card-content>
    <f7-card-footer>
      <f7-button color="blue" href="/settings/persistence/"> Configure Persistence Policies </f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.item-persistence-badge-non-editable
  .badge
    right 6px
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import * as api from '@/api'
import { ApiError } from '@/js/hey-api.ts'

// props
const props = defineProps<{ item: api.EnrichedItem | api.EnrichedGroupItem }>()

// data
interface PersistenceService extends api.PersistenceService {
  configs: Array<api.PersistenceItemConfiguration>
  aliases: Record<string, string>
  editable: boolean
  persisted: api.PersistenceItemInfo | null
}

const services = ref<Array<PersistenceService>>([])
const loaded = ref<boolean>(false)

// computed
const strategies = computed(() => {
  const strategies: Record<string, Array<string>> = {}
  services.value.forEach((service) => strategies[service.id] = serviceStrategies(service))
  return strategies
})

const persistedBadges = computed(() => {
  const badges: Record<string, string | null> = {}
  services.value.forEach((service) => {
    const persisted = service.persisted
    if (!persisted) {
      // Query for persistence items not supported
      badges[service.id] = null
    } else if (persisted.count != null && Number.isInteger(Number(persisted.count))) {
      // Show numeric count when available
      badges[service.id] = String(persisted.count)
    } else if (persisted.name) {
      // No numeric count, but persisted value(s): show a presence indicator (empty badge)
      badges[service.id] = ' '
    } else {
      // Item has not been persisted
      // badges[service.id] = '0'
      // TODO: Currently, the API call does not distinguish between API call not supported for service and item not persisted.
      // To avoid showing misleading information, don't show badge if we don't get anything back (should be covered by first case if REST API is fixed.)
      // This can be reverted to showing 0 if the API is fixed.
      badges[service.id] = null
    }
  })
  return badges
})

// hooks
onMounted(() => {
  load()
})

// methods
const load = async () => {
  loaded.value = false
  const availableServices = (await api.getPersistenceServices())!
  services.value = (await Promise.all(
    availableServices.map((service) => loadService(service))
  )).sort((s1, s2) => s1.label.localeCompare(s2.label))
  loaded.value = true
}

const loadService = async (service: api.PersistenceService): Promise<PersistenceService> => {
  let serviceConfig: api.PersistenceServiceConfiguration | null = null
  try {
    serviceConfig = (await api.getPersistenceServiceConfiguration({ serviceId: service.id })) ?? null
  } catch (err: unknown) {
    if (err instanceof ApiError && (err.response.statusText === 'Not Found' || err.response.status === 404)) {
      // No configuration yet, continue with an empty one
    } else {
      console.debug('Error loading persistence config for', service.id, err)
    }
  }

  let itemsPersisted: Array<api.PersistenceItemInfo> = []
  try {
    itemsPersisted = await api.getItemsForPersistenceService({ serviceId: service.id }) ?? []
  } catch (err: unknown) {
    if (err instanceof ApiError && (err.response.statusText === 'Not Found' || err.response.status === 404)) {
      // Not supported for service, leave itemsPersisted null
    } else {
      console.debug('Error loading persistence items for', service.id, err)
    }
  }

  // TODO: Currently, the API returns null entries if the service doesn't know its items
  itemsPersisted = itemsPersisted.filter((item) => item)

  return {
    ...service,
    configs: serviceConfig?.configs ?? [],
    aliases: serviceConfig?.aliases ?? {},
    editable: serviceConfig?.editable === undefined ? true : serviceConfig?.editable,
    persisted: itemsPersisted.find((item) => item.name === props.item.name) ?? null
  } satisfies PersistenceService
}

const serviceStrategies = (service: PersistenceService) => {
  let strategies: Array<string> = []
  service.configs?.forEach((config) => {
    const items = config.items
    if (items && config.strategies?.length) {
      if (!matchesItem(props.item, items, true) && matchesItem(props.item, items, false)) {
        // No negative match and a positive match
        strategies = [...strategies, ...config.strategies]
      }
    }
  })
  return [...new Set(strategies)]
}

const matchesItem = (item: api.EnrichedItem | api.EnrichedGroupItem, items: Array<string>, negativeMatch: boolean) => {
  if (!items || !Array.isArray(items)) {
    return false
  }
  const itemName = item.name
  const groupNames = item.groupNames || []
  let itemPattern: string | null = null
  let groupPatterns: Array<string> = []
  if (!negativeMatch) {
    if (items.includes('*')) return true
    itemPattern = itemName
    groupPatterns = items.filter((configItem) => !configItem.startsWith('!') && configItem.endsWith('*')).map((configItem) => configItem.slice(0, -1))
  } else {
    itemPattern = '!' + itemName
    groupPatterns = items.filter((configItem) => configItem.startsWith('!') && configItem.endsWith('*')).map((configItem) => configItem.slice(1, -1))
  }
  if (items.includes(itemPattern)) return true
  return groupPatterns.some((groupName) => groupNames.includes(groupName))
}
</script>
