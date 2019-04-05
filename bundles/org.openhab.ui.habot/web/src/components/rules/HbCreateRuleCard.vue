<template>
  <q-stepper :order="1" class="create-rule-card hb-card" ref="stepper" :color="(ruleCreated) ? 'positive' : 'black'" v-model="step" vertical>
    <q-step default name="when" title="When" :subtitle="whenSubtitle" :disable="ruleCreated">
      <div class="row">
        <q-radio v-model="trigger" val="time" label="When the time is" class="col" style="padding-bottom: 8px" />
        <q-datetime v-model="triggerTime" type="time" format24h class="col" :disable="trigger !== 'time'" :disabled="trigger !== 'time'" />
      </div>
      <q-radio v-model="trigger" val="item" label="When something happens" style="padding-bottom: 8px" />
      <q-field v-if="trigger === 'time'" label="Recurrence" icon="update" orientation="horizontal">
        <q-option-group
          color="primary"
          v-model="triggerRecurrence"
          :options="[
            {label: 'Once', value: 'once'},
            {label: 'Every day', value: 'everyday'},
            {label: 'On weekdays', value: 'weekdays'},
            {label: 'On weekends', value: 'weekends'},
            {label: 'Custom', value: 'custom'}
          ]" />
      </q-field>
      <q-field v-if="trigger === 'time' && triggerRecurrence === 'custom'" label="Days" icon="date_range">
        <q-select
          multiple toggle
          v-model="triggerDays"
          :options="[
            {label: 'Mondays', value: 'MON'},
            {label: 'Tuesdays', value: 'TUE'},
            {label: 'Wednesdays', value: 'WED'},
            {label: 'Thursdays', value: 'THU'},
            {label: 'Fridays', value: 'FRI'},
            {label: 'Saturdays', value: 'SAT'},
            {label: 'Sundays', value: 'SUN'}
          ]" />
      </q-field>
      <q-field v-if="trigger === 'item'" icon="device_hub" orientation="vertical">
        <q-select
          multiple filter
          placeholder="Item(s)"
          color="primary"
          v-model="triggerItems"
          :options="items" />
      </q-field>
      <div v-if="trigger === 'item'" class="row" style="padding-bottom: 8px">
        <q-select class="col" v-model="triggerItemEvent" :options="[
          {label: triggerItems.length !== 1 ? 'change' : 'changes', value: 'change'},
          {label: triggerItems.length !== 1 ? 'are updated' : 'is updated', value: 'update'},
          {label: triggerItems.length !== 1 ? 'receive' : 'receives', value: 'command'}
        ]" />
        <q-input class="col" v-if="triggerItemEvent === 'change'" v-model="triggerStateFrom" prefix="from&nbsp;" />
        <q-input class="col" v-if="triggerItemEvent === 'change'" v-model="triggerStateTo" prefix="to&nbsp;" />
        <q-input class="col" v-if="triggerItemEvent === 'update'" v-model="triggerStateTo" prefix="to&nbsp;" />
        <q-input class="col" v-if="triggerItemEvent === 'command'" v-model="triggerCommand" placeholder="command" />
      </div>
      <q-field v-if="trigger === 'item'" label="Repeat" icon="repeat" orientation="horizontal">
        <q-option-group
          color="primary"
          v-model="triggerItemRepeat"
          :options="[{label:'forever', value:'forever'}, {label: 'next time only', value:'once'}]" />
      </q-field>
      <q-stepper-navigation v-if="!globalNavigation">
        <q-btn color="primary" flat :disabled="whenSubtitle === ''" @click="$refs.stepper.next()">Continue</q-btn>
      </q-stepper-navigation>
    </q-step>
    <q-step :order="2" name="then" title="Then" :subtitle="thenSubtitle" :disable="ruleCreated">
      <q-input prefix="Send&nbsp;&nbsp;" suffix="to" v-model="actionCommand" />
      <q-field icon="device_hub" orientation="vertical" style="padding-bottom: 8px">
        <q-select
          multiple filter
          placeholder="Item(s)"
          color="primary"
          v-model="actionItems"
          :options="items" />
      </q-field>
      <q-field
        icon="announcement"
        label="and notify me via (optional)"
        orientation="vertical"
      >
        <q-option-group
          type="toggle"
          v-model="actionNotify"
          :options="[
            { label: 'Push notification', value: 'webpush' },
            { label: 'Speak (default audio sink)', value: 'say' }
          ]"
        />
      </q-field>
      <q-field v-if="actionNotify.length > 0" icon="message" label="Message" orientation="vertical">
        <q-input v-model="actionNotifyMessage" />
      </q-field>
      <q-field v-if="actionNotify.indexOf('webpush') >= 0" icon="label_outline" label="Tags" orientation="vertical"
        helper="Optional. The first card matching these tags will be shown when opening the notification.">
        <q-select
          multiple chips secondary
          color="secondary"
          v-model="actionNotifyTags"
          :options="tags" />
      </q-field>
      <q-stepper-navigation v-if="!globalNavigation">
        <q-btn color="primary" :disabled="thenSubtitle === ''" @click="createRule()">Create</q-btn>
        <!-- <q-btn color="primary" flat :disabled="thenSubtitle === ''" @click="$refs.stepper.next()">Next</q-btn> -->
        <q-btn color="primary" flat @click="$refs.stepper.previous()">Back</q-btn>
      </q-stepper-navigation>
    </q-step>
    <!-- <q-step name="if" title="But only if">
      TODO
      <q-stepper-navigation v-if="!globalNavigation">
        <q-btn color="primary" :disabled="thenSubtitle === ''" @click="createRule()">Create</q-btn>
        <q-btn color="primary" flat @click="$refs.stepper.previous()">Back</q-btn>
      </q-stepper-navigation>
    </q-step> -->
    <q-step :order="3" v-if="ruleCreated" name="finish" active-icon="check" title="Finished">
      <q-btn color="primary" flat class="q-ml-md q-mt-lg" style="float:right" @click="openRuleInPaperUI()">Review in Paper UI</q-btn>
      Rule created!
    </q-step>
    <q-inner-loading :visible="busy" />
  </q-stepper>
</template>

<style lang="stylus">
@import '~variables'

@media (min-width $breakpoint-sm-min)
  .create-rule-card
    width 384px !important

</style>

<script>
import { date, uid } from 'quasar'

export default {
  data () {
    let timer = new Date()
    timer.setHours(timer.getHours() + 1, 0, 0, 0)
    return {
      step: true,
      trigger: 'time',
      triggerTime: timer,
      triggerRecurrence: 'once',
      triggerDays: [],
      triggerItems: [],
      triggerItemEvent: 'change',
      triggerStateFrom: null,
      triggerStateTo: null,
      triggerCommand: null,
      triggerItemRepeat: 'forever',
      actionItems: [],
      actionCommand: null,
      actionNotify: [],
      actionNotifyMessage: null,
      actionNotifyTags: [],
      busy: false,
      ruleCreated: false,
      rule: {},
      items: this.$store.state.items.items.map((item) => {
        return {
          value: item.name,
          label: item.name,
          sublabel: item.label,
          stamp: item.type
        }
      }),
      tags: this.$store.getters['cards/tagSet']
        .map((t) => {
          return {
            value: t,
            label: t
          }
        })
    }
  },
  methods: {
    createRule () {
      this.rule.uid = 'habot:' + uid()
      this.rule.name = `HABot: When ${this.whenSubtitle}, Then ${this.thenSubtitle}`
      this.rule.description = `Rule created by HABot on ${new Date().toString()}`
      let currentModuleId = 1
      this.rule.triggers = []
      this.rule.actions = []
      this.rule.conditions = []

      this.busy = true

      // "When"
      switch (this.trigger) {
        case 'time':
          let time = date.formatDate(this.triggerTime, 'HH:mm')
          this.rule.triggers.push({
            id: currentModuleId++,
            type: 'timer.TimeOfDayTrigger',
            label: 'At ' + time,
            configuration: {
              time: time
            }
          })
          if (this.triggerRecurrence !== 'everyday' && this.triggerRecurrence !== 'once') {
            let condition = {
              id: currentModuleId++,
              type: 'timer.DayOfWeekCondition'
            }
            switch (this.triggerRecurrence) {
              case 'weekdays':
                condition.label = 'On weekdays'
                condition.configuration = {
                  days: ['MON', 'TUE', 'WED', 'THU', 'FRI']
                }
                break
              case 'weekends':
                condition.label = 'On weekends'
                condition.configuration = {
                  days: ['SAT', 'SUN']
                }
                break
              case 'custom':
                condition.label = 'On ' + this.triggerDays.join(', ')
                condition.configuration = {
                  days: this.triggerDays
                }
                break
            }
            this.rule.conditions.push(condition)
          }
          break

        case 'item':
          for (let item of this.triggerItems) {
            let trigger = {
              id: currentModuleId++,
              configuration: {}
            }
            switch (this.triggerItemEvent) {
              case 'change':
                trigger.type = 'core.ItemStateChangeTrigger'
                trigger.label = item + ' changes'
                trigger.configuration.itemName = item
                if (this.triggerStateFrom) trigger.configuration.previousState = this.triggerStateFrom
                trigger.configuration.state = this.triggerStateTo
                break
              case 'update':
                trigger.type = 'core.ItemStateUpdateTrigger'
                trigger.label = item + ' is updated'
                trigger.configuration.itemName = item
                trigger.configuration.state = this.triggerStateTo
                break
              case 'command':
                trigger.type = 'core.ItemCommandTrigger'
                trigger.label = item + ' receives a command'
                trigger.configuration.itemName = item
                trigger.configuration.command = this.triggerCommand
                break
            }

            this.rule.triggers.push(trigger)
          }
          break
      }

      // "Then"
      for (let item of this.actionItems) {
        let action = {
          id: currentModuleId++,
          type: 'core.ItemCommandAction',
          label: 'Send a command to ' + item,
          configuration: {
            itemName: item,
            command: this.actionCommand
          }
        }
        this.rule.actions.push(action)
      }

      // Handle the notifications
      if (this.actionNotify.indexOf('webpush') >= 0 && this.actionNotifyMessage) {
        this.rule.actions.push({
          id: currentModuleId++,
          type: 'habot.WebPushNotificationAction',
          label: 'Send a push notification',
          configuration: {
            body: this.actionNotifyMessage,
            tags: this.actionNotifyTags
          }
        })
      }
      if (this.actionNotify.indexOf('say') >= 0 && this.actionNotifyMessage) {
        this.rule.actions.push({
          id: currentModuleId++,
          type: 'media.SayAction',
          label: 'Speak through the default audio sink',
          configuration: {
            text: this.actionNotifyMessage
          }
        })
      }

      // Handle the "one-time" behavior
      if ((this.trigger === 'time' && this.triggerRecurrence === 'once') ||
          (this.trigger === 'item' && this.triggerItemRepeat === 'once')) {
        this.rule.actions.push({
          id: currentModuleId++,
          type: 'core.RuleEnablementAction',
          label: 'Disable this rule after it has run',
          configuration: {
            enable: false,
            ruleUIDs: [this.rule.uid]
          }
        })
      }

      this.$http.post('/rest/rules', this.rule).then((resp) => {
        this.ruleCreated = true
        this.busy = false
        this.$refs.stepper.goToStep('finish')
      }).catch((err) => {
        this.busy = false
        this.$q.notify('Error while creating rule: ' + err)
      })
    },
    openRuleInPaperUI () {
      window.open('/paperui/index.html#/rules/configure/' + this.rule.uid, '_blank')
    }
  },
  computed: {
    whenSubtitle () {
      let subtitle = ''
      if (this.trigger === 'time') {
        if (!this.triggerTime) return ''
        subtitle = 'At ' + date.formatDate(this.triggerTime, 'HH:mm')
        switch (this.triggerRecurrence) {
          case 'once': break
          case 'weekdays': subtitle += ' on weekdays'; break
          case 'weekends': subtitle += ' on weekends'; break
          case 'everyday': subtitle += ' every day'; break
          case 'custom': if (this.triggerDays.length === 0) return ''; else subtitle += ' on ' + this.triggerDays.join(', '); break
        }
        return subtitle
      } else {
        if (!this.triggerItems.length) return ''
        subtitle += (this.triggerItems.length > 1) ? `one of ${this.triggerItems.length} items` : this.triggerItems[0]
        switch (this.triggerItemEvent) {
          case 'change':
            subtitle += ' changed'
            if (this.triggerStateFrom) subtitle += ' from ' + this.triggerStateFrom
            if (!this.triggerStateTo) return ''
            subtitle += ' to ' + this.triggerStateTo
            break
          case 'update':
            subtitle += ' updated'
            if (this.triggerStateTo) subtitle += ' to ' + this.triggerStateTo
            break
          case 'command':
            if (!this.triggerCommand) return ''
            subtitle += ' received ' + this.triggerCommand
            break
        }

        subtitle += (this.triggerItemRepeat === 'once') ? ' (next time only)' : ''

        return subtitle
      }
    },
    thenSubtitle () {
      if (!this.actionItems.length || !this.actionCommand) return ''
      let subtitle = `Send ${this.actionCommand} to ${(this.actionItems.length > 1) ? `${this.actionItems.length} items` : this.actionItems[0]}`
      return subtitle
    }
  }

}
</script>
