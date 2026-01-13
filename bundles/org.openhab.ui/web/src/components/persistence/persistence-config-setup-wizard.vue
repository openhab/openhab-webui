<template>
  <f7-block>
    <f7-block-title>
      {{ t('setupwizard.persistence-config.default.title') }}
    </f7-block-title>
    {{ t('setupwizard.persistence-config.default.header') }}
    <f7-list v-if="servicesLoaded" form>
      <f7-list-item title="Default" smart-select :smart-select-params="{ openIn: 'popup', closeOnSelect: true }">
        <select name="defaultPersistence" v-model="defaultPersistence">
          <option v-if="!services.length" disabled value="">No services available</option>
          <option v-for="service in services" :key="service.id" :value="service.id">
            {{ service.label }}
          </option>
        </select>
      </f7-list-item>
    </f7-list>
  </f7-block>
  <f7-block strong>
    <f7-block-title>
      {{ t('setupwizard.persistence-config.services.title') }}
    </f7-block-title>
    {{ t('setupwizard.persistence-config.services.header1') }}<br />
    <br />
    {{ t('setupwizard.persistence-config.services.header2') }}
    {{ t('setupwizard.persistence-config.services.header3') }}
    {{ t('setupwizard.persistence-config.services.header4') }}<br />
    <br />
    {{ t('setupwizard.persistence-config.services.header5') }}
    {{ t('setupwizard.persistence-config.services.header6') }}
    {{ t('setupwizard.persistence-config.services.header7') }}<br />
    <br />
    {{ t('setupwizard.persistence-config.services.header8') }}<br />
    <f7-block v-for="service in services" :key="service.id" class="persistence-config-setup-wizard">
      <f7-block-title>
        {{ service.label }}
      </f7-block-title>
      <f7-row v-if="isBasicConfig(configuration[service.id])" no-gap style="margin-top: 0rem; margin-bottom: 0">
        <div class="service">
          <addon-logo class="logo-square" :addon="addons.find((addon) => addon.uid === 'persistence-' + service.id)" size="54" />
          <span class="config">
            <f7-list form v-if="servicesLoaded">
              <f7-list-item title="Items" smart-select :smart-select-params="{ openIn: 'popup', closeOnSelect: true }">
                <select :name="'items_' + service.id" v-model="items[service.id]">
                  <option value="*">
                    {{ this.t('setupwizard.persistence-config.services.items.all') }}
                  </option>
                  <option :value="itemPersistGroups[service.id] + '*'">
                    {{ groupLabels[itemPersistGroups[service.id]] }}
                  </option>
                  <option value="">
                    {{ this.t('setupwizard.persistence-config.services.items.none') }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item title="Strategies" smart-select :smart-select-params="{ openIn: 'popup' }">
                <select :name="'strategies_' + service.id" multiple v-model="selectedStrategies[service.id]">
                  <option
                    v-for="strategy in strategies[service.id]"
                    :key="service.id + '_' + strategy"
                    :value="strategy"
                    :disabled="service.id === 'rrd4j' && strategy === 'everyMinute'">
                    {{ this.t('setupwizard.persistence.strategy.' + strategy) || strategy }}
                  </option>
                </select>
              </f7-list-item>
            </f7-list>
          </span>
        </div>
      </f7-row>
      <f7-row v-else-if="isEditable(configuration[service.id])" no-gap style="margin-top: 0.5rem; margin-bottom: 0">
        <div class="service">
          <addon-logo class="logo-square" :addon="addons.find((addon) => addon.uid === 'persistence-' + service.id)" size="54" />
          <span class="config">
            <f7-list>
              <f7-list-item>
                {{ this.t('setupwizard.persistence-config.services.advancedConfig') }}
              </f7-list-item>
              <f7-list-button color="blue" @click="resetConfiguration(service.id)">
                {{ this.t('setupwizard.persistence-config.services.resetConfig') }}
              </f7-list-button>
            </f7-list>
          </span>
        </div>
      </f7-row>
      <f7-row v-else-if="configuration[service.id]" no-gap style="margin-top: 0.5rem; margin-bottom: 0">
        <div class="service">
          <addon-logo class="logo-square" :addon="addons.find((addon) => addon.uid === 'persistence-' + service.id)" size="54" />
          <span class="config">
            <f7-list>
              <f7-list-item>
                {{ this.t('setupwizard.persistence-config.services.notEditable') }}
              </f7-list-item>
            </f7-list>
          </span>
        </div>
      </f7-row>
    </f7-block>
  </f7-block>
</template>

<style lang="stylus">
.persistence-config-setup-wizard
    .service
      width 100%
      display flex
      align-items top
      .logo-square
        background white
        border-radius 10%
        width 64px
        height 64px
        margin-top 10px
        display flex
        justify-content center
        align-items center
        .logo
          margin-left 0
          max-height 54px
          max-width 54px
      .config
        margin-left 0.5rem
        width calc(100% - 64px - 0.5rem)
        .list
          margin-top 0px
          margin-bottom 0
</style>

<script>
import { f7 } from 'framework7-vue'
import AddonLogo from '@/components/addons/addon-logo.vue'
import { PredefinedStrategies, CommonCronStrategies } from '@/assets/definitions/persistence'

export default {
  props: {
    addons: Array,
    addonsReady: Boolean,
    confirm: Boolean,
    t: Function
  },
  components: {
    AddonLogo
  },
  data () {
    return {
      persistenceServiceId: 'org.openhab.persistence',
      defaultPersistence: null,
      configuration: {},
      services: [],
      items: {},
      itemPersistGroups: {},
      groupExists: {},
      groupLabels: {},
      strategies: {},
      strategyLabels: null,
      PredefinedStrategies: null,
      CommonCronStrategies: null,
      suggestedStrategies: {},
      configuredStrategies: {},
      selectedStrategies: {},
      servicesLoaded: false
    }
  },
  watch: {
    addonsReady (val) {
      if (val) {
        this.loadPersistenceConfig()
      }
    },
    confirm (val) {
      if (val) {
        this.updatePersistenceConfig()
      }
    }
  },
  methods: {
    async loadPersistenceConfig () {
      try {
        try {
          const serviceConfig = await this.$oh.api.get('/rest/services/' + this.persistenceServiceId + '/config')
          this.defaultPersistence = serviceConfig?.default
        } catch {
          // Continue if no default persistence configuration
        }

        const services = await this.$oh.api.get('/rest/persistence')
        this.services = services

        services.forEach((service) => {
          this.selectedStrategies[service.id] = []
          this.items[service.id] = '*'
          const groupName = 'gPersist_' + service.id
          this.itemPersistGroups[service.id] = groupName
          this.groupLabels[groupName] = 'Persistence ' + this.t('setupwizard.persistence-config.services.items.group') + ' ' + service.label

          if (!this.defaultPersistence && service.id === 'rrd4j') {
            // Use rrd4j as the default service if it is installed and nothing was set as a default before
            this.defaultPersistence = 'rrd4j'
          }
        })

        await Promise.all(services.map((service) => this.loadServiceConfig(service)))
      } finally {
        this.servicesLoaded = true
      }
    },
    async loadServiceConfig (service) {
      try {
        const suggestions = await this.$oh.api.get('/rest/persistence/strategysuggestions?serviceId=' + service.id)
        this.suggestedStrategies[service.id] = suggestions.map((suggestion) => suggestion.name)
      } catch {
        // Ignore if suggestions not found
      }

      try {
        const persistenceConfig = await this.$oh.api.get('/rest/persistence/' + service.id)
        this.configuration[service.id] = persistenceConfig
        if (this.isBasicConfig(persistenceConfig)) {
          const configs = persistenceConfig.configs
          const items = configs[0].items || ['']
          this.items[service.id] = items[0]
          if (items[0].match(/[^!].+\*/)) {
            this.itemPersistGroups[service.id] = items[0].slice(0, -1)
          }
          this.configuredStrategies[service.id] = configs[0].strategies
        } else {
          this.items[service.id] = '*'
        }
      } catch(err) {
        if (err === 'Not Found' || err === 404) {
          this.items[service.id] = '*'
          this.configuration[service.id] = this.updateOrCreateConfiguration(service.id)
        }
      }
      this.strategies[service.id] = this.getStrategies(service)
      this.selectedStrategies[service.id] = this.getPreSelectedStrategies(service)

      const groupName = this.itemPersistGroups[service.id]
      this.groupExists[groupName] = true
      try {
        const group = await this.$oh.api.get('/rest/items/' + groupName)
        this.groupLabels[groupName] = group.label
      } catch(err) {
        if (err === 'Not Found' || err === 404) {
          this.groupExists[groupName] = false
        } else {
          console.log('Unexpected error trying to find Group \'' + groupName + '\', will not be created if selected when saving: ', err)
        }
      }
    },
    isEditable (configuration) {
      return configuration?.editable
    },
    isBasicConfig (configuration) {
      // If there is an existing configuration, we will only present it for configuration in the wizard if it has a basic configuration:
      // - Editable (not defined in a file)
      // - A single configuration
      // - No, or a single item definition (all, or group)
      // - No filters
      // When there is no item definition, we default to all items.
      // If there is an existing, non-basic configuration (file-based, multiple configuration, other or multiple item definitions, filters),
      // we don't show any configuration option in the wizard to avoid overwriting the existing configuration.
      if (!this.isEditable(configuration)) return false
      const configs = configuration.configs
      if (configs?.length !== 1) return false
      const items = configs[0].items || ['']
      const filters = configs[0].filters || []
      const itemsAll = items.length === 1 && items[0] === '*'
      const itemsGroup = items.length === 1 && items[0].match(/[^!].+\*/)
      const itemsEmpty = !items.length || (items.length === 1 && items[0] === '')
      return (itemsAll || itemsGroup || itemsEmpty) && !filters.length
    },
    getStrategies (service) {
      const suggested = this.suggestedStrategies[service.id] || []
      const configured = this.configuredStrategies[service.id] || []
      const common = this.CommonCronStrategies.map((strategy) => strategy.name)
      const strategies = [...new Set([...suggested, ...configured, ...PredefinedStrategies, ...common])]
      if (service.id === 'inmemory') {
        const index = strategies.indexOf('restoreOnStartup')
        if (index >= 0) {
          strategies.splice(index, 1)
        }
      }
      if (service.type !== 'Modifiable') {
        const index = strategies.indexOf('forecast')
        if (index >= 0) {
          strategies.splice(index, 1)
        }
      }
      return strategies
    },
    resetConfiguration (serviceId) {
      const label = this.services.find((service) => service.id === serviceId)?.label || serviceId
      f7.dialog.confirm(this.t('setupwizard.persistence-config.services.resetConfig.confirm', label), () => {
        this.configuration[serviceId] = this.updateOrCreateConfiguration(serviceId)
      })
    },
    updateOrCreateConfiguration (serviceId) {
      const configuration = this.configuration[serviceId] || {}
      configuration.serviceId = serviceId
      configuration.configs = [{
        items: [ this.items[serviceId] ],
        strategies: this.selectedStrategies[serviceId]
      }]
      configuration.editable = true
      return configuration
    },
    getPreSelectedStrategies (service) {
      const suggested = this.suggestedStrategies[service.id] || []
      const configured = this.configuredStrategies[service.id] || []
      const selectedStrategies = [...(configured.length ? configured : suggested)]

      // Special case: rrd4j always needs the everyMinute strategy
      if (service.id === 'rrd4j' && !selectedStrategies.includes('everyMinute')) {
        selectedStrategies.push('everyMinute')
      }

      // Special case: if mapdb restoreOnStartup is turned on, it doesn't make sense to have it on for other services as well
      if (service.id !== 'mapdb' && this.selectedStrategies.mapdb?.includes('restoreOnStartup')) {
        const index = selectedStrategies.indexOf('restoreOnStartup')
        if (index >= 0) {
          selectedStrategies.splice(index, 1)
        }
      } else if (service.id === 'mapdb' && selectedStrategies.includes('restoreOnStartup')) {
        Object.keys(this.selectedStrategies).forEach((serviceId) => {
          const index = this.selectedStrategies[serviceId].indexOf('restoreOnStartup')
          if (index >= 0) {
            this.selectedStrategies[serviceId].splice(index, 1)
          }
        })
      }
      return selectedStrategies
    },
    updatePersistenceConfig () {
      this.$oh.api.put('/rest/services/' + this.persistenceServiceId + '/config', {
        default: this.defaultPersistence
      })
      const groupsToAdd = []
      this.services.map((service) => service.id)
        .filter((serviceId) => this.isBasicConfig(this.configuration[serviceId]))
        .forEach((serviceId) => {
          this.configuration[serviceId] = this.updateOrCreateConfiguration(serviceId)
          // Define all common cron strategies in the persistence configuration
          const cronStrategies = this.configuration[serviceId].cronStrategies || []
          const cronStrategyNames = cronStrategies.map((strategy) => strategy.name)
          this.CommonCronStrategies.forEach((strategy) => {
            if (!cronStrategyNames.includes(strategy.name)) {
              cronStrategies.push(strategy)
            }
          })
          this.configuration[serviceId].cronStrategies = cronStrategies
          this.$oh.api.put('/rest/persistence/' + serviceId, this.configuration[serviceId])
          if (this.items[serviceId].length > 1) {
            const groupName = this.items[serviceId].slice(0, -1)
            if (!this.groupExists[groupName]) {
              groupsToAdd.push({
                type: 'Group',
                name: groupName,
                label: this.groupLabels[groupName]
              })
            }
          }
        })
      if (groupsToAdd.length) {
        this.$oh.api.put('/rest/items', groupsToAdd)
      }
    }
  },
  created () {
    this.PredefinedStrategies = PredefinedStrategies
    this.CommonCronStrategies = CommonCronStrategies
  }
}
</script>
