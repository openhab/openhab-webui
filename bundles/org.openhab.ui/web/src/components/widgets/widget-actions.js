import OhPopup from './modals/oh-popup.vue'
import OhSheet from './modals/oh-sheet.vue'
import OhPopover from './modals/oh-popover.vue'

import { basicActionsMixin } from '@/components/widgets/widget-basic-actions'

export const actionsMixin = {
  mixins: [basicActionsMixin],
  components: {
    OhPopup,
    OhSheet,
    OhPopover
  },
  methods: {
    /**
     * Performs an action determined by config parameters.
     *
     * If no prefix is specified, will use the parameter "action" and other parameters beginning with "action"
     * If a prefix is specified, the parameters considered will be "prefix_action*"
     *
     * Instead of "[prefix_]action" and others, "[prefix_]actionPropsParameterGroup" can be provided.
     * The value must match the name of a parameter group with the context set to "actions".
     * The actual prefix of the parameters will then match the name of the group with the term "action" removed.
     * For example, for a "dblclickAction" parameter group, the action parameters will be "dblclick_action*".
     * This allows custom widget designers to offer actions parameters to configure their widget.
     *
     * @param {Event} evt the event (e.g. "click") at the origin of the action
     * @param {String} prefix the prefix for the parameter group and associated parameters (see below)
     * @param {Object} config the config object containing the parameters to use, will use `this.config` if unset
     * @param {Object} context the context to use, will use `this.context` if unset
     * @returns {Boolean?} true if the action was performed, otherwise undefined
     */
    performAction (evt, prefix, config, context) {
      if (!context) context = this.context
      if (!config) config = this.config
      if (!config || !context) return
      const actionPropsParameterGroup = config[((prefix) ? prefix + '_' : '') + 'actionPropsParameterGroup']
      const actionConfig = (actionPropsParameterGroup) ? this.evaluateExpression('$props', context.props) : config
      prefix = (actionPropsParameterGroup) ? actionPropsParameterGroup.replace(/action/gi, '') : prefix
      prefix = (prefix) ? prefix += '_' : ''
      const action = actionConfig[prefix + 'action']
      if (context.editmode) {
        this.showActionFeedback(prefix, actionConfig, `Action '${action}' not performed while in edit mode`)
        return
      }
      if (!action) return

      const actionConfirmation = actionConfig[prefix + 'actionConfirmation']
      const confirmationPromise = (actionConfirmation) ? this.requestActionConfirmation(prefix, actionConfig) : Promise.resolve()

      confirmationPromise.then(() => {
        switch (action) {
          case 'popup':
          case 'popover':
          case 'sheet':
            const actionModal = actionConfig[prefix + 'actionModal']
            const actionModalConfig = actionConfig[prefix + 'actionModalConfig']
            if (actionModal.indexOf('page:') !== 0 && actionModal.indexOf('widget:') !== 0 && actionModal.indexOf('oh-') !== 0) {
              console.log('Action target is not of the format page:uid or widget:uid or oh-')
              return
            }

            console.log(`Opening ${actionModal} in ${action} modal`)
            let modalRoute = {
              url: action + '/' + actionModal,
              route: {
              }
            }
            if (action === 'popup') modalRoute.route.popup = { component: OhPopup }
            if (action === 'popover') modalRoute.route.popup = { component: OhPopover }
            if (action === 'sheet') modalRoute.route.popup = { component: OhSheet }
            let modalProps = {
              props: {
                uid: actionModal,
                el: (evt && evt.target && evt.target._icon) ? evt.target._icon : (evt) ? evt.target : null,
                modalConfig: actionModalConfig || {}
              }
            }
            this.$f7.views.main.router.navigate(modalRoute, modalProps)
            break
          default:
            this.performBasicAction(evt, action, actionConfig, context)
            break
        }
        return true
      }).catch(() => {
        return false
      })
    }
  }
}
