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
          :link="p.editable ? ('/settings/persistence/' + p.id) : null">
          <template #media>
            <span class="item-initial">{{ p.id ? p.id[0] : '?' }}</span>
          </template>
          <template #after-title>
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
    configuredServices () {
      return this.services.filter((service) => this.strategies[service.id]?.length)
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
      this.ready = false
      this.services = await Promise.all(
        services.map((service) => this.loadService(service))
      )
      this.loaded = true
    },
    async loadService (service) {
      const serviceId = service.id
      let serviceConfig = {}
      try {
        serviceConfig = await this.$oh.api.get('/rest/persistence/' + serviceId)
      } catch (err) {
        if (err?.response?.status === 404) {
          // No configuration yet, continue with an empty one
        }
      }
      return {
        ...service,
        configs: serviceConfig.configs  || [],
        aliases: serviceConfig.aliases,
        editable: serviceConfig.editable === undefined ? true : serviceConfig.editable
      }
    },
    serviceStrategies (serviceId) {
      let strategies = []
      const persistenceConfig = this.services.find((persistence) => persistence.id === serviceId)
      persistenceConfig?.configs?.forEach((config) => {
        const items = config.items
        if (items && config.strategies?.length) {
          let match = false
          // First find all positive matches for the item
          if (items.includes('*') || items.includes(this.item.name) || items.filter((configItem) => configItem.endsWith('*')).map((configItem) => configItem.slice(0, -1)).find((groupName) => this.item.groupNames.includes(groupName))) {
            match = true
          }
          // Remove negative matches
          if (items.includes('!' + this.item.name) || items.filter((configItem) => configItem.startsWith('!') && configItem.endsWith('*')).map((configItem) => configItem.slice(1, -1)).find((groupName) => this.item.groupNames.includes(groupName))) {
            match = false
          }
          if (match) {
            strategies = [...strategies, ...config.strategies]
          }
        }
      })
      return [...new Set(strategies)]
    }
  }
}
</script>
