import cronstrue from 'cronstrue'

export default {
  methods: {
    findModuleType (mod, section) {
      if (!mod || !this.moduleTypes) {
        return undefined
      }
      let result
      if (section) {
        return this.moduleTypes[section]?.find((m) => m.uid === mod.type)
      } else {
        if (this.moduleTypes.actions) {
          result = this.moduleTypes.actions.find((m) => m.uid === mod.type)
        }
        if (!result && this.moduleTypes.triggers) {
          result = this.moduleTypes.triggers.find((m) => m.uid === mod.type)
        }
        if (!result && this.moduleTypes.conditions) {
          result = this.moduleTypes.conditions.find((m) => m.uid === mod.type)
        }
        return result
      }
    },
    suggestedModuleTitle (mod, moduleType, section) {
      if (!moduleType) {
        if (!this.moduleTypes) return 'Name'
        moduleType = this.findModuleType(mod, section)
        if (!moduleType) return 'Name'
      }
      const config = mod.configuration
      switch (moduleType.uid) {
        // triggers
        case 'timer.TimeOfDayTrigger':
          if (!config.time) return moduleType.label
          return 'the time is ' + config.time
        case 'timer.GenericCronTrigger':
          if (!config.cronExpression) return moduleType.label
          try {
            const cron = cronstrue.toString(config.cronExpression, {
              use24HourTimeFormat: true
            })
            return cron.charAt(0).toLowerCase() + cron.slice(1)
          } catch (err) {
            return err.toString()
          }
        case 'core.ItemCommandTrigger':
          if (!config.itemName && !config.command) return moduleType.label
          if (!config.command) return 'item ' + config.itemName + ' received a command'
          return 'item ' + config.itemName + ' received command ' + config.command
        case 'core.ItemStateUpdateTrigger':
          if (!config.itemName) return moduleType.label
          return 'item ' + config.itemName + ' was updated' +
                        ((config.state) ? ' to ' + config.state : '')
        case 'core.ItemStateChangeTrigger':
          if (!config.itemName) return moduleType.label
          return 'item ' + config.itemName + ' changed' +
              ((config.previousState) ? ' from ' + config.previousState : '') +
              ((config.state) ? ' to ' + config.state : '')
        case 'core.ChannelEventTrigger':
          if (!config.channelUID) return moduleType.label
          return 'channel ' + config.channelUID + ' was triggered'
        case 'core.GroupCommandTrigger':
          if (!config.groupName && !config.command) return moduleType.label
          if (!config.command) return 'a member of ' + config.groupName + ' received a command'
          return 'a member of ' + config.groupName + ' received command ' + config.command
        case 'core.GroupStateUpdateTrigger':
          if (!config.groupName) return moduleType.label
          return 'a member of ' + config.groupName + ' was updated' +
                        ((config.state) ? ' to ' + config.state : '')
        case 'core.GroupStateChangeTrigger':
          if (!config.groupName) return moduleType.label
          return 'a member of ' + config.groupName + ' changed' +
              ((config.previousState) ? ' from ' + config.previousState : '') +
              ((config.state) ? ' to ' + config.state : '')
        case 'core.ThingStatusUpdateTrigger':
          if (!config.thingUID) return moduleType.label
          return 'thing ' + config.thingUID + ' status was updated' +
                        ((config.status) ? ' to ' + config.status : '')
        case 'core.ThingStatusChangeTrigger':
          if (!config.thingUID) return moduleType.label
          return 'thing ' + config.thingUID + ' status changed' +
              ((config.previousStatus) ? ' from ' + config.previousStatus : '') +
              ((config.status) ? ' to ' + config.status : '')
        case 'core.SystemStartlevelTrigger':
          if (config.startlevel === undefined) return moduleType.label
          return 'the system has reached start level ' + config.startlevel
        // actions
        case 'core.ItemCommandAction':
          if (!config.itemName || !config.command) return moduleType.label
          return 'send command ' + config.command + ' to ' + config.itemName
        case 'core.ItemStateUpdateAction':
          if (!config.itemName || !config.state) return moduleType.label
          return 'update the state of ' + config.itemName + ' to ' + config.state
        case 'media.SayAction':
          if (!config.text) return moduleType.label
          return 'say "' + config.text + '"'
        case 'media.PlayAction':
          if (!config.sound) return moduleType.label
          return 'play "' + config.sound + '"'
        // conditions
        case 'timer.DayOfWeekCondition':
          if (!config.days || !config.days.join || !config.days.length) return moduleType.label
          return 'the day is ' + config.days.join(',')
        case 'core.TimeOfDayCondition':
          if (!config.startTime || !config.endTime) return moduleType.label
          return 'the time is between ' + config.startTime + ' and ' + config.endTime
        case 'core.ItemStateCondition':
          if (!config.itemName || !config.operator || !config.state) return moduleType.label
          return config.itemName + ' ' + config.operator + ' ' + config.state
        default:
          return moduleType.label
      }
    },
    suggestedModuleDescription (mod, moduleType, section) {
      if (!moduleType) {
        if (!this.moduleTypes) return 'Description'
        moduleType = this.findModuleType(mod, section)
        if (!moduleType) return 'Description'
      }
      const config = mod.configuration
      switch (moduleType.uid) {
        // triggers
        case 'timer.GenericCronTrigger':
          if (!config.cronExpression) return moduleType.description
          return 'Cron: ' + config.cronExpression

        default:
          return moduleType.description
      }
    }
  }
}
