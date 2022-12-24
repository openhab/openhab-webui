/*
* These blocks allow to send notifications via openhab
* supports jsscripting
*/

import Blockly from 'blockly'

export default function defineOHBlocks_Notifications (f7, isGraalJs) {
  Blockly.Blocks['oh_sendNotification'] = {
    init: function () {
      this.appendValueInput('message')
        .appendField('send notification')
      this.appendValueInput('email')
        .appendField('to e-mail address')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setInputsInline(false)
      this.setColour(0)
      this.setTooltip('Send a notification message to a specific openhab user')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-notifications.html#send-notification-to-specific-cloud-email-user')
    }
  }

  Blockly.JavaScript['oh_sendNotification'] = function (block) {
    let email = Blockly.JavaScript.valueToCode(block, 'email', Blockly.JavaScript.ORDER_ATOMIC)
    let message = Blockly.JavaScript.valueToCode(block, 'message', Blockly.JavaScript.ORDER_ATOMIC)
    if (isGraalJs) {
      return `actions.NotificationAction.sendNotification(${email}, ${message});\n`
    } else {
      const notifications = addNotificationAction()
      return `${notifications}.sendNotification(${email}, ${message});\n`
    }
  }

  Blockly.Blocks['oh_sendBroadcastNotification'] = {
    init: function () {
      this.appendValueInput('message')
        .appendField('send notification')
      this.appendValueInput('icon')
        .appendField('with icon')
      this.appendDummyInput()
        .appendField('as')
        .appendField(new Blockly.FieldDropdown([['info', 'info'], ['warning', 'warn'], ['highly important', 'high']]), 'severity')
        .appendField('to all devices')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setInputsInline(false)
      this.setColour(0)
      this.setTooltip('send a notification to all clients. Provide icon name without prefix')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-notifications.html#send-notification-to-all-devices-and-users')
    }
  }

  Blockly.JavaScript['oh_sendBroadcastNotification'] = function (block) {
    let message = Blockly.JavaScript.valueToCode(block, 'message', Blockly.JavaScript.ORDER_ATOMIC)
    let icon = Blockly.JavaScript.valueToCode(block, 'icon', Blockly.JavaScript.ORDER_ATOMIC)
    let severity = block.getFieldValue('severity')
    if (isGraalJs) {
      return `actions.NotificationAction.sendBroadcastNotification(${message}, ${icon}, '${severity}');\n`
    } else {
      const notifications = addNotificationAction()
      return `${notifications}.sendBroadcastNotification(${message}, ${icon}, '${severity}');\n`
    }
  }

  Blockly.Blocks['oh_sendLogNotification'] = {
    init: function () {
      this.appendValueInput('message')
        .appendField('send notification')
      this.appendValueInput('icon')
        .appendField('with icon')
      this.appendDummyInput()
        .appendField('as')
        .appendField(new Blockly.FieldDropdown([['info', 'info'], ['warning', 'warn'], ['highly important', 'high']]), 'severity')
        .appendField('to log only')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setInputsInline(false)
      this.setColour(0)
      this.setTooltip('Sends a notification to the log only not to any device')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-notifications.html#send-notification-to-log-only')
    }
  }

  Blockly.JavaScript['oh_sendLogNotification'] = function (block) {
    let message = Blockly.JavaScript.valueToCode(block, 'message', Blockly.JavaScript.ORDER_ATOMIC)
    let icon = Blockly.JavaScript.valueToCode(block, 'icon', Blockly.JavaScript.ORDER_ATOMIC)
    let severity = block.getFieldValue('severity')
    if (isGraalJs) {
      return `actions.NotificationAction.sendLogNotification(${message}, ${icon}, '${severity}');\n`
    } else {
      const notifications = addNotificationAction()
      return `${notifications}.sendLogNotification(${message}, ${icon}, '${severity}');\n`
    }
  }
}

function addNotificationAction () {
  return Blockly.JavaScript.provideFunction_(
    'notifications',
    ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.io.openhabcloud.NotificationAction\');'])
}
