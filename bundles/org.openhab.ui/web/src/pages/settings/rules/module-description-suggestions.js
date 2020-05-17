import cronstrue from 'cronstrue'

export default {
  methods: {
    suggestedModuleTitle (mod, moduleType, section) {
      if (!moduleType) {
        moduleType = this.moduleTypes[section].find((m) => m.uid === mod.type)
        if (!moduleType) return 'Name'
      }
      const config = mod.configuration
      switch (moduleType.uid) {
        // triggers
        case 'timer.TimeOfDayTrigger':
          if (!config.time) return moduleType.label
          return 'When the time is ' + config.time
        case 'timer.GenericCronTrigger':
          if (!config.cronExpression) return moduleType.label
          try {
            return cronstrue.toString(config.cronExpression, {
              use24HourTimeFormat: true
            })
          } catch (err) {
            return err.toString()
          }
        case 'core.ItemCommandTrigger':
          if (!config.itemName && !config.command) return moduleType.label
          if (!config.command) return 'When ' + config.itemName + ' received a command'
          return 'When ' + config.itemName + ' received command ' + config.command
        case 'core.ItemStateUpdateTrigger':
          if (!config.itemName) return moduleType.label
          return 'When ' + config.itemName + ' was updated' +
                        ((config.state) ? ' to ' + config.state : '')
        case 'core.ItemStateChangeTrigger':
          if (!config.itemName) return moduleType.label
          return 'When ' + config.itemName + ' changed' +
              ((config.previousState) ? ' from ' + config.previousState : '') +
              ((config.state) ? ' to ' + config.state : '')
        case 'core.ChannelEventTrigger':
          if (!config.channelUID) return moduleType.label
          return 'When channel ' + config.channelUID + ' was triggered'
        case 'core.GroupCommandTrigger':
          if (!config.groupName && !config.command) return moduleType.label
          if (!config.command) return 'When a member of ' + config.groupName + ' received a command'
          return 'When a member of ' + config.itemName + ' received command ' + config.command
        case 'core.GroupStateUpdateTrigger':
          if (!config.groupName) return moduleType.label
          return 'When ' + config.itemName + ' was updated' +
                        ((config.state) ? ' to ' + config.state : '')
        case 'core.GroupStateChangeTrigger':
          if (!config.groupName) return moduleType.label
          return 'When a member of ' + config.groupName + ' changed' +
              ((config.previousState) ? ' from ' + config.previousState : '') +
              ((config.state) ? ' to ' + config.state : '')
        // actions
        case 'core.ItemCommandAction':
          if (!config.itemName || !config.command) return moduleType.label
          return 'Send command ' + config.command + ' to ' + config.itemName
        case 'media.SayAction':
          if (!config.text) return moduleType.label
          return 'Say "' + config.text + '"'
        case 'media.PlaySound':
          if (!config.sound) return moduleType.label
          return 'Say ' + config.sound
        // conditions
        case 'timer.DayOfWeekCondition':
          if (!config.days || !config.days.join || !config.days.length) return moduleType.label
          return 'If the day is ' + config.days.join(',')
        case 'core.TimeOfDayCondition':
          if (!config.startTime || !config.endTime) return moduleType.label
          return 'If the time is between ' + config.startTime + ' and ' + config.endTime
        case 'core.ItemStateCondition':
          if (!config.itemName || !config.operator || !config.state) return moduleType.label
          return 'If ' + config.itemName + ' ' + config.operator + ' ' + config.state

        default:
          return moduleType.label
      }
    },
    suggestedModuleDescription (mod, moduleType, section) {
      if (!moduleType) {
        moduleType = this.moduleTypes[section].find((m) => m.uid === mod.type)
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
