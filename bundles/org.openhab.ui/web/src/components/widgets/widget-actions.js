import OhPopup from './modals/oh-popup.vue'
import OhSheet from './modals/oh-sheet.vue'
import OhPopover from './modals/oh-popover.vue'

import GroupPopup from '@/pages/group/group-popup.vue'

export const actionsMixin = {
  components: {
    OhPopup,
    OhSheet,
    OhPopover,
    GroupPopup
  },
  methods: {
    showActionFeedback (prefix, actionConfig, feedbackConfig) {
      let toastConfig = feedbackConfig || actionConfig[prefix + 'actionFeedback']
      if (typeof toastConfig === 'string' && toastConfig.startsWith('{')) toastConfig = JSON.parse(toastConfig)
      if (typeof toastConfig === 'string') {
        this.$f7.toast.create({
          text: toastConfig,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      } else if (typeof toastConfig === 'object') {
        this.$f7.toast.create(Object.assign({}, toastConfig, {
          destroyOnClose: true,
          closeTimeout: (toastConfig.icon || !toastConfig.closeButton) ? 2000 : toastConfig.closeTimeout
        })).open()
      }
    },
    performAction (evt, prefix) {
      if (!this.context || !this.config) return
      const actionPropsParameterGroup = this.config[((prefix) ? prefix += '_' : '') + 'actionPropsParameterGroup']
      const actionConfig = (actionPropsParameterGroup) ? this.evaluateExpression('$props', this.context.props) : this.config
      prefix = (actionPropsParameterGroup) ? actionPropsParameterGroup.replace(/action/gi, '') : prefix
      prefix = (prefix) ? prefix += '_' : ''
      const action = actionConfig[prefix + 'action']
      if (this.context.editmode) {
        this.showActionFeedback(prefix, actionConfig, `Action '${action}' not performed while in edit mode`)
        return
      }
      if (!action) return
      switch (action) {
        case 'navigate':
          const actionPage = actionConfig[prefix + 'actionPage']
          const actionPageTransition = actionConfig[prefix + 'actionPageTransition']
          console.log('Navigating to ' + actionPage)
          if (actionPage.indexOf('page:') !== 0) {
            console.log('Action target is not of the format page:uid')
            return
          }
          let navigateOptions = { props: { deep: true } }
          if (actionPageTransition) navigateOptions.transition = actionPageTransition
          this.$f7.views.main.router.navigate('/page/' + actionPage.substring(5), navigateOptions)
          break
        case 'command':
          const actionItem = actionConfig[prefix + 'actionItem']
          const actionCommand = actionConfig[prefix + 'actionCommand']
          this.$store.dispatch('sendCommand', { itemName: actionItem, cmd: actionCommand })
            .then(() => this.showActionFeedback(prefix, actionConfig))
          break
        case 'toggle':
          const actionToggleItem = actionConfig[prefix + 'actionItem']
          const actionToggleCommand = actionConfig[prefix + 'actionCommand']
          const actionToggleCommandAlt = actionConfig[prefix + 'actionCommandAlt']
          const state = this.context.store[actionToggleItem].state
          let cmd = this.context.store[actionToggleItem].state === actionToggleCommand ? actionToggleCommandAlt : actionToggleCommand
          // special behavior for Color, Dimmer
          if (actionToggleCommand === 'OFF' && state.split(',').length === 3 && parseInt(state.split(',')[2]) === 0) cmd = actionToggleCommandAlt
          if (actionToggleCommand === 'ON' && state.split(',').length === 3 && parseInt(state.split(',')[2]) > 0) cmd = actionToggleCommandAlt
          if (actionToggleCommand === 'OFF' && state.indexOf(',') < 0 && parseInt(state) === 0) cmd = actionToggleCommandAlt
          if (actionToggleCommand === 'ON' && state.indexOf(',') < 0 && parseInt(state) > 0) cmd = actionToggleCommandAlt
          this.$store.dispatch('sendCommand', { itemName: actionToggleItem, cmd })
            .then(() => this.showActionFeedback(prefix, actionConfig))
          break
        case 'options':
          const actionCommandOptionsItem = actionConfig[prefix + 'actionItem']
          const actionCommandOptions = actionConfig[prefix + 'actionOptions']
          const actionsPromise = new Promise((resolve, reject) => {
            if (actionCommandOptions && typeof actionCommandOptions === 'string') {
              resolve(actionCommandOptions.split(',').map((o) => {
                const parts = o.split('=')
                return {
                  text: parts[1] || parts[0],
                  color: 'blue',
                  onClick: () => {
                    this.$store.dispatch('sendCommand', { itemName: actionCommandOptionsItem, cmd: parts[0] })
                      .then(() => this.showActionFeedback(prefix, actionConfig))
                  }
                }
              }))
            } else if (actionCommandOptions && typeof actionCommandOptions === 'object') {
              resolve(actionCommandOptions)
            } else {
              this.$oh.api.get('/rest/items/' + actionCommandOptionsItem).then((item) => {
                if (item.commandDescription && item.commandDescription.commandOptions) {
                  resolve(item.commandDescription.commandOptions.map((cd) => {
                    return {
                      text: cd.label || cd.command,
                      color: 'blue',
                      onClick: () => {
                        this.$store.dispatch('sendCommand', { itemName: actionCommandOptionsItem, cmd: cd.command })
                          .then(() => this.showActionFeedback(prefix, actionConfig))
                      }
                    }
                  }))
                }
              })
            }
          })

          actionsPromise.then((actions) => {
            this.$f7.actions.create({
              buttons: [
                actions,
                [{ text: 'Cancel', color: 'red' }]
              ]
            }).open()
          })
          break
        case 'rule':
          const actionRule = actionConfig[prefix + 'actionRule']
          if (!actionRule) break
          this.$oh.api.postPlain('/rest/rules/' + actionRule + '/runnow', '')
            .then(() => this.showActionFeedback(prefix, actionConfig))
            .catch((err) => {
              this.$f7.toast.create({
                text: 'Error while running rule: ' + err,
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
            })
          break
        case 'popup':
        case 'popover':
        case 'sheet':
          const actionModal = actionConfig[prefix + 'actionModal']
          const actionModalConfig = actionConfig[prefix + 'actionModalConfig']
          if (actionModal.indexOf('page:') !== 0 && actionModal.indexOf('widget:') !== 0 && actionModal.indexOf('oh-') !== 0) {
            console.log('Action target is not of the format page:uid or widget:uid')
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
              modalParams: actionModalConfig || {}
            }
          }
          this.$f7.views.main.router.navigate(modalRoute, modalProps)
          break
        case 'photos':
          const self = this
          let photos = actionConfig[prefix + 'actionPhotos']
          let photoBrowserConfig = actionConfig[prefix + 'actionPhotoBrowserConfig']
          if (typeof photos === 'string' && photos.startsWith('[')) photos = JSON.parse(photos)
          if (typeof photoBrowserConfig === 'string' && photoBrowserConfig.startsWith('{')) photoBrowserConfig = JSON.parse(photoBrowserConfig)
          if (photos && photos.length > 0) {
            const promises = photos.map((el) => {
              if (typeof el === 'string') return Promise.resolve(el)
              if (typeof el === 'object') {
                if (el.item) {
                  return new Promise((resolve, reject) => {
                    self.$oh.api.getPlain(`/rest/items/${el.item}/state`, 'text/plain').then((data) => {
                      resolve({
                        url: data,
                        caption: el.caption
                      })
                    }).catch((err) => {
                      console.warn('Error while resolving image from item: ' + err)
                      reject(err)
                    })
                  })
                } else {
                  return Promise.resolve(el)
                }
              }
              return Promise.reject('invalid actionPhotos parameter format')
            })

            Promise.all(promises).then((resolvedPhotos) => {
              let photoBrowserParams = Object.assign({}, photoBrowserConfig, { photos: resolvedPhotos })
              // automatically select the dark theme if not specified
              if (!photoBrowserParams.theme && self.$f7.darkTheme) photoBrowserParams.theme = 'dark'
              self.$f7.photoBrowser.create(photoBrowserParams).open()
            })
          }
          break
        case 'group':
          const actionGroupItem = actionConfig[prefix + 'actionGroupPopupItem']
          console.log(`Opening ${actionGroupItem} details in popup`)
          let groupPopupRoute = {
            url: '/group/' + actionGroupItem,
            route: {
              popup: {
                component: GroupPopup
              }
            }
          }
          this.$f7.views.main.router.navigate(groupPopupRoute, { props: { groupItem: actionGroupItem } })
          break
        case 'analyze':
        case 'analyzer':
          const actionAnalyzerItems = actionConfig[prefix + 'actionAnalyzerItems']
          const actionAnalyzerChartType = actionConfig[prefix + 'actionAnalyzerChartType']
          const actionAnalyzerCoordSystem = actionConfig[prefix + 'actionAnalyzerCoordSystem']
          this.$f7.views.main.router.navigate(`/analyzer/?items=${actionAnalyzerItems.join(',')}&chartType=${actionAnalyzerChartType || ''}&coordSystem=${actionAnalyzerCoordSystem || ''}`)
          console.log('Opening the analyzer')
          break
        case 'url':
          const actionUrl = actionConfig[prefix + 'actionUrl']
          const actionUrlSameWindow = actionConfig[prefix + 'actionUrlSameWindow']
          window.open(actionUrl, (actionUrlSameWindow) ? '_top' : '_blank')
          break
        case 'variable':
          const actionVariable = actionConfig[prefix + 'actionVariable']
          const actionVariableValue = actionConfig[prefix + 'actionVariableValue']
          this.$set(this.context.vars, actionVariable, actionVariableValue)
          break
        default:
          console.log('Invalid action: ' + action)
          break
      }
    }
  }
}
