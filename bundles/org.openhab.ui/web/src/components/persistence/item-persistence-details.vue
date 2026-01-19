<template>
  <f7-card v-if="item.type !== 'Group' || item.groupType">
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

<script>
export default {
  props: {
    item: Object
  },
  computed: {
    strategies () {
      const strategies = {}
      this.services.forEach((service) => strategies[service.id] = this.serviceStrategies(service.id))
      return strategies
    },
    persistedBadges () {
      const badges = {}
      this.services.forEach((service) => {
        badges[service.id] = service.persisted ? (Number.isInteger(service.persisted.count) ? service.persisted.count : 'values') : null
      })
      return badges
    }
  },
  data () {
    return {
      services: [],
      loaded: false
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      this.loaded = false
      const services = await this.$oh.api.get('/rest/persistence')
      this.services = await Promise.all(
        services.map((service) => this.loadService(service))
      )
      this.loaded = true
    },
    async loadService (service) {
      let serviceConfig = {}
      try {
        serviceConfig = await this.$oh.api.get('/rest/persistence/' + service.id)
      } catch (err) {
        if (err?.response?.status === 404) {
          // No configuration yet, continue with an empty one
        }
      }

      let itemsPersisted = []
      try {
        itemsPersisted = await this.$oh.api.get('/rest/persistence/items?serviceId=' + service.id)
      } catch (err) {
        // Do nothing if not found
      }

      return {
        ...service,
        configs: serviceConfig.configs || [],
        aliases: serviceConfig.aliases,
        editable: serviceConfig.editable === undefined ? true : serviceConfig.editable,
        persisted: itemsPersisted.find((item) => item.name === this.item.name) || null
      }
    },
    serviceStrategies (serviceId) {
      let strategies = []
      const persistenceConfig = this.services.find((persistence) => persistence.id === serviceId)
      persistenceConfig?.configs?.forEach((config) => {
        const items = config.items
        if (items && config.strategies?.length) {
          if (!this.matchesItem(this.item, items, true) && this.matchesItem(this.item, items, false)) {
            // No negative match and a positive match
            strategies = [...strategies, ...config.strategies]
          }
        }
      })
      return [...new Set(strategies)]
    },
    matchesItem (item, items, negativeMatch) {
      if (!items || !Array.isArray(items)) {
        return false
      }
      const itemName = item.name
      const groupNames = item.groupNames || []
      let itemPattern
      let groupPatterns
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
  }
}
</script>
