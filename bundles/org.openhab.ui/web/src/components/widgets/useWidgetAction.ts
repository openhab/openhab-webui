import { f7 } from 'framework7-vue'
import { useI18n } from 'vue-i18n'

import { getVariableScope, setVariableKeyValues } from '@/components/widgets/variable'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore.ts'
import { type EvaluateExpressionFn } from '@/components/widgets/useWidgetExpression.ts'

import OhPopup from './modals/oh-popup.vue'
import OhSheet from './modals/oh-sheet.vue'
import OhPopover from './modals/oh-popover.vue'
import GroupPopup from '@/pages/group/group-popup.vue'

import { type Actions, type PhotoBrowser, type Router, type Toast } from 'framework7'
import { Action, type ActionConfig } from '@/types/components/widgets'
import type { VariableValue, WidgetContext } from '@/components/widgets/types'
import openhab from '@/js/openhab'
import * as api from '@/api'
import type { ComputedRef } from 'vue'

type ActionPrefix = '' | 'taphold_'

interface ActionConfirmationConfig {
  type: string
  text: string
  title?: string
  color?: string
}

function processPrefix(prefix?: string): ActionPrefix {
  if (!prefix) return ''
  if (prefix.length > 0 && !prefix.endsWith('_')) return (prefix + '_') as ActionPrefix
  return prefix as ActionPrefix
}

function showActionFeedback(prefix: string, actionConfig: ActionConfig, text?: string) {
  const feedbackText: string | undefined = text || actionConfig[`${processPrefix(prefix)}actionFeedback`]
  if (!feedbackText) return
  let toastConfig: Toast.Parameters | null = null
  if (feedbackText.startsWith('{')) toastConfig = JSON.parse(feedbackText) as Toast.Parameters

  if (toastConfig) {
    f7.toast
      .create({
        ...toastConfig,
        destroyOnClose: true,
        closeTimeout: toastConfig.icon || !toastConfig.closeButton ? 2000 : toastConfig.closeTimeout
      })
      .open()
  } else {
    f7.toast
      .create({
        text: feedbackText,
        destroyOnClose: true,
        closeTimeout: 2000
      })
      .open()
  }
}

export type WidgetActionConfig = ActionConfig & { actionPropsParameterGroup?: string; taphold_actionPropsParameterGroup?: string }

export function useWidgetAction(context: WidgetContext, config: ComputedRef<WidgetActionConfig>, evaluateExpression: EvaluateExpressionFn) {
  const { t } = useI18n()

  const statesStore = useStatesStore()
  const uiOptionsStore = useUIOptionsStore()

  async function requestActionConfirmation(prefix: string, actionConfig: ActionConfig, text?: string): Promise<void> {
    const confirmText = text || actionConfig[`${processPrefix(prefix)}actionConfirmation`]
    if (!confirmText) return
    let confirmConfig: ActionConfirmationConfig | null = null
    if (confirmText.startsWith('{')) confirmConfig = JSON.parse(confirmText) as ActionConfirmationConfig

    if (confirmConfig) {
      if (confirmConfig.type === 'sheet') {
        return new Promise<void>((resolve, reject) => {
          f7.actions
            .create({
              buttons: [
                [{ text: confirmConfig.text, color: confirmConfig.color || 'blue', onClick: () => resolve() }],
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                [{ text: t('dialogs.cancel'), color: 'red', onClick: () => reject() }]
              ]
            })
            .open()
        })
      }
      // else use dialog
      return new Promise<void>((resolve, reject) => {
        f7.dialog
          .confirm(
            confirmConfig.text,
            confirmConfig.title || 'openHAB',
            () => resolve(),
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            () => reject()
          )
          .open()
      })
    }
    return new Promise<void>((resolve, reject) => {
      f7.dialog
        .confirm(
          confirmText,
          () => resolve(),
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          () => reject()
        )
        .open()
    })
  }

  /**
   * Performs an action determined by {@link ActionConfig} config parameters.
   *
   * If no prefix is specified, the `action` parameter and other parameters beginning with `action` will be used.
   * If a prefix is specified, the parameters considered will be `prefix_action*`.
   *
   * Instead of `[prefix_]action` and other parameters, the `[prefix_]actionPropsParameterGroup` parameter can be provided.
   * The value must match the name of a parameter group with the `actions` context.
   * The actual prefix of the parameters will then match the name of the group with the term `Action` removed.
   * For example, for a `dblclickAction` parameter group, the action parameters will be `dblclick_action*`.
   * This allows custom widget designers to offer actions parameters to configure their widget.
   *
   * @param evt the event (e.g. "click") at the origin of the action
   * @param prefix the prefix for the parameter group and associated parameters (see below)
   * @param ctx the context to use (usually `props.context`)
   * @param cfg the config object containing the parameters to use (usually `useWidgetContext::config`)
   * @returns true if the action was performed, otherwise undefined
   */
  function performAction(evt: Event, prefix: string, ctx?: WidgetContext, cfg?: WidgetActionConfig): boolean {
    if (!ctx) ctx = context
    if (!cfg) cfg = config.value
    if (!cfg || !ctx) return false

    console.log(`useWidgetAction::performAction called by ${ctx.component.component} with config`, cfg)

    let processedPrefix = processPrefix(prefix)
    const actionPropsParameterGroup = cfg[`${processedPrefix}actionPropsParameterGroup`]
    const evalActionConfig = actionPropsParameterGroup
      ? evaluateExpression<ActionConfig>('$props', ctx.props as unknown as ActionConfig, ctx, ctx.props)
      : null
    const actionConfig = evalActionConfig instanceof Error ? cfg : (evalActionConfig ?? cfg)
    prefix = actionPropsParameterGroup ? actionPropsParameterGroup.replace(/action/gi, '') : prefix
    prefix = prefix ? (prefix += '_') : ''
    processedPrefix = processPrefix(prefix)
    const action = actionConfig[`${processedPrefix}action`] as Action | undefined
    if (!action) return false
    if (ctx.editmode) {
      showActionFeedback(prefix, actionConfig, `Action '${action}' not performed while in edit mode`)
      return false
    }

    const actionConfirmation = actionConfig[`${processedPrefix}actionConfirmation`]
    const confirmationPromise = actionConfirmation ? requestActionConfirmation(prefix, actionConfig) : Promise.resolve()

    confirmationPromise
      .then(async () => {
        switch (action) {
          case Action.navigate:
            const actionPage = actionConfig[`${processedPrefix}actionPage`]
            if (!actionPage) return false
            const actionPageTransition = actionConfig[`${processedPrefix}actionPageTransition`]
            const actionPageVars = actionConfig[`${processedPrefix}actionPageDefineVars`]
            if (actionPage.indexOf('page:') !== 0) {
              console.log('Action target is not of the format page:uid')
              return false
            }
            let navigateOptions: Router.RouteOptions & { props: { deep: boolean; defineVars?: unknown } } = { props: { deep: true } }
            if (actionPageTransition) navigateOptions.transition = actionPageTransition
            if (actionPageVars) navigateOptions.props.defineVars = actionPageVars
            console.log('Navigating to ' + actionPage)
            f7.views.main.router.navigate('/page/' + actionPage.substring(5), navigateOptions)
            break
          case Action.command:
            const actionItem = actionConfig[`${processedPrefix}actionItem`]
            const actionCommand = actionConfig[`${processedPrefix}actionCommand`]
            if (!actionItem || !actionCommand) return false
            void statesStore.sendCommand(actionItem, actionCommand).then(() => showActionFeedback(prefix, actionConfig))
            break
          case Action.toggle:
            const actionToggleItem = actionConfig[`${processedPrefix}actionItem`]
            const actionToggleCommand = actionConfig[`${processedPrefix}actionCommand`]
            const actionToggleCommandAlt = actionConfig[`${processedPrefix}actionCommandAlt`]
            if (!actionToggleItem) return false
            const state = ctx.store ? ctx.store[actionToggleItem]?.state : undefined
            if (!state) return false
            let cmd = state === actionToggleCommand ? actionToggleCommandAlt : actionToggleCommand
            // special behavior for Color, Dimmer
            if (actionToggleCommand === 'OFF' && state.split(',').length === 3 && parseInt(state.split(',')[2]!) === 0)
              cmd = actionToggleCommandAlt
            if (actionToggleCommand === 'ON' && state.split(',').length === 3 && parseInt(state.split(',')[2]!) > 0)
              cmd = actionToggleCommandAlt
            if (actionToggleCommand === 'OFF' && state.indexOf(',') < 0 && parseInt(state) === 0) cmd = actionToggleCommandAlt
            if (actionToggleCommand === 'ON' && state.indexOf(',') < 0 && parseInt(state) > 0) cmd = actionToggleCommandAlt
            if (!cmd) return false
            void statesStore.sendCommand(actionToggleItem, cmd).then(() => showActionFeedback(prefix, actionConfig))
            break
          case Action.options:
            const actionCommandOptionsItem = actionConfig[`${processedPrefix}actionItem`]
            if (!actionCommandOptionsItem) return false
            const actionCommandOptions = actionConfig[`${processedPrefix}actionOptions`] as string | object | undefined
            const actionsPromise = async (): Promise<Actions.Button[]> => {
              if (actionCommandOptions && typeof actionCommandOptions === 'string') {
                return actionCommandOptions.split(',').map((o) => {
                  const option = o.trim()
                  let cmd
                  let label
                  if (option.includes('=')) {
                    if (option.startsWith('"') && option.includes('"="') && option.endsWith('"')) {
                      const parts = option.split('"="')
                      cmd = parts[0]!.substring(1).trim()
                      label = parts[1]!.substring(0, parts[1]!.length - 1).trim()
                    } else {
                      const parts = option.split('=')
                      cmd = parts[0]!.trim()
                      label = parts[1]!.trim()
                    }
                  } else {
                    cmd = option
                    label = null
                  }
                  return {
                    text: label || cmd,
                    color: 'blue',
                    onClick: () => {
                      void statesStore.sendCommand(actionCommandOptionsItem, cmd).then(() => showActionFeedback(prefix, actionConfig))
                    }
                  } satisfies Actions.Button
                })
              } else if (actionCommandOptions && typeof actionCommandOptions === 'object') {
                return actionCommandOptions as Actions.Button[]
              } else {
                const item = (await api.getItemByName({ itemName: actionCommandOptionsItem }))!
                if (item.commandDescription && item.commandDescription.commandOptions) {
                  return item.commandDescription.commandOptions.map((cd) => {
                    return {
                      text: cd.label || cd.command,
                      color: 'blue',
                      onClick: () => {
                        void statesStore
                          .sendCommand(actionCommandOptionsItem, cd.command)
                          .then(() => showActionFeedback(prefix, actionConfig))
                      }
                    } satisfies Actions.Button
                  })
                }
              }
              return []
            }

            const actions = await actionsPromise()
            f7.actions
              .create({
                buttons: [actions, [{ text: t('dialogs.cancel'), color: 'red' }]]
              })
              .open()
            break
          case Action.rule:
            const actionRule = actionConfig[`${processedPrefix}actionRule`]
            let actionRuleContext = actionConfig[`${processedPrefix}actionRuleContext`]
            if (typeof actionRuleContext === 'object') actionRuleContext = JSON.stringify(actionRuleContext)
            if (!actionRule) break

            try {
              await openhab.api.postPlain(
                '/rest/rules/' + actionRule + '/runnow',
                actionRuleContext || '',
                'text/plain',
                'application/json'
              )
              showActionFeedback(prefix, actionConfig)
            } catch (e) {
              f7.toast
                .create({
                  text: 'Error while running rule: ' + (e as string),
                  destroyOnClose: true,
                  closeTimeout: 2000
                })
                .open()
            }
            break
          case Action.popup:
          case Action.popover:
          case Action.sheet:
            const actionModal = actionConfig[`${processedPrefix}actionModal`]
            if (!actionModal) return false
            const actionModalConfig = actionConfig[`${processedPrefix}actionModalConfig`]
            if (actionModal.indexOf('page:') !== 0 && actionModal.indexOf('widget:') !== 0 && actionModal.indexOf('oh-') !== 0) {
              console.log('Action target is not of the format page:uid or widget:uid or oh-')
              return false
            }

            const modalUrl = action + '/' + actionModal
            if (f7.views.main.router?.currentRoute.url.endsWith(modalUrl)) {
              console.log(`Modal ${actionModal} already open, not opening again`)
              return false
            }

            console.log(`Opening ${actionModal} in ${action} modal`)
            let modalRoute: { url: string; route: { [key: string]: { component: unknown } } } = {
              url: modalUrl,
              route: {}
            }
            if (action === Action.popup) modalRoute.route.popup = { component: OhPopup }
            if (action === Action.popover) modalRoute.route.popup = { component: OhPopover }
            if (action === Action.sheet) modalRoute.route.popup = { component: OhSheet }
            let modalProps: Router.RouteOptions = {
              props: {
                uid: actionModal,
                el: evt?.target && '_icon' in evt.target ? evt.target._icon : evt ? evt.target : null,
                modalConfig: actionModalConfig || {}
              }
            }
            f7.views.main.router.navigate(modalRoute as any as string, modalProps)
            break
          case Action.photos:
            type Photo = { item: string; caption?: string }
            let photos: string | (string | Photo)[] | undefined = actionConfig[`${processedPrefix}actionPhotos`]
            let photoBrowserConfig: string | object | undefined = actionConfig[`${processedPrefix}actionPhotoBrowserConfig`]
            if (typeof photos === 'string' && photos.startsWith('[')) photos = JSON.parse(photos) as (string | Photo)[]
            if (typeof photoBrowserConfig === 'string' && photoBrowserConfig.startsWith('{')) {
              photoBrowserConfig = JSON.parse(photoBrowserConfig) as object
            }
            if (Array.isArray(photos)) {
              const promises = photos.map(async (el) => {
                if (typeof el === 'string') return el
                if (typeof el === 'object') {
                  if (el.item) {
                    try {
                      const data = (await openhab.api.getPlain(`/rest/items/${el.item}/state`, 'text/plain')) as string
                      return {
                        url: data,
                        caption: el.caption
                      }
                    } catch (e) {
                      console.warn('Error while resolving image from item', e)
                      throw e
                    }
                  } else {
                    return el
                  }
                }
                throw new Error('Invalid actionPhotos parameter format in ' + ctx.component.component)
              })

              const resolvedPhotos = await Promise.all(promises)

              let photoBrowserParams: PhotoBrowser.Parameters = Object.assign({}, photoBrowserConfig, {
                photos: resolvedPhotos
              }) as PhotoBrowser.Parameters
              // automatically select the dark theme if not specified
              if (!photoBrowserParams.theme && uiOptionsStore.darkMode === 'dark') photoBrowserParams.theme = 'dark'
              f7.photoBrowser.create(photoBrowserParams).open()
            }
            break
          case Action.group:
            const actionGroupItem = actionConfig[`${processedPrefix}actionGroupPopupItem`]
            let groupPopupRoute = {
              url: '/group/' + actionGroupItem,
              route: {
                popup: {
                  component: GroupPopup
                }
              }
            }
            console.log(`Opening ${actionGroupItem} details in popup`)
            f7.views.main.router.navigate(groupPopupRoute as any as string, { props: { groupItem: actionGroupItem } })
            break
          case Action.analyzer:
            let actionAnalyzerItems = actionConfig[`${processedPrefix}actionAnalyzerItems`]
            const actionAnalyzerChartType = actionConfig[`${processedPrefix}actionAnalyzerChartType`]
            const actionAnalyzerCoordSystem = actionConfig[`${processedPrefix}actionAnalyzerCoordSystem`]
            const actionAnalyzerAggregation = actionConfig[`${processedPrefix}actionAnalyzerAggregation`]
            if (Array.isArray(actionAnalyzerItems)) {
              actionAnalyzerItems = actionAnalyzerItems.join(',')
            }
            f7.views.main.router.navigate(
              `/analyzer/?items=${actionAnalyzerItems || ''}&chartType=${actionAnalyzerChartType || ''}&coordSystem=${actionAnalyzerCoordSystem || ''}&aggregation=${actionAnalyzerAggregation || ''}`
            )
            console.log('Opening the analyzer')
            break
          case Action.url:
            const actionUrl = actionConfig[`${processedPrefix}actionUrl`]
            if (!actionUrl) return
            const actionUrlSameWindow = actionConfig[`${processedPrefix}actionUrlSameWindow`]
            console.log(`Opening external URL ${actionUrl}`)
            window.open(actionUrl, actionUrlSameWindow ? '_top' : '_blank')
            break
          case Action.http:
            const actionHttpUrl = actionConfig[`${processedPrefix}actionUrl`]
            if (!actionHttpUrl) return
            const actionHttpMethod = actionConfig[`${processedPrefix}actionHttpMethod`] || 'GET'
            const actionHttpBody = actionConfig[`${processedPrefix}actionHttpBody`]
            console.log(`Performing HTTP ${actionHttpMethod} request to ${actionHttpUrl}`)
            fetch(actionHttpUrl, {
              mode: 'no-cors',
              method: actionHttpMethod,
              body: actionHttpBody
            })
              .then(() => showActionFeedback(prefix, actionConfig))
              .catch((e) =>
                showActionFeedback(prefix, actionConfig, `Failed to perform HTTP request: ${e instanceof Error ? e.message : e}`)
              )
            break
          case Action.variable:
            const actionVariable = actionConfig[`${processedPrefix}actionVariable`]
            let actionVariableValue: VariableValue | undefined = actionConfig[`${processedPrefix}actionVariableValue`]
            const actionVariableKey = actionConfig[`${processedPrefix}actionVariableKey`]
            if (!actionVariable || !ctx.ctxVars) return false
            const actionVariableScope = getVariableScope(ctx.ctxVars, ctx.varScope, actionVariable)
            const actionVariableLocation = actionVariableScope ? ctx.ctxVars[actionVariableScope]! : ctx.vars!
            if (actionVariableKey) {
              actionVariableValue = setVariableKeyValues(actionVariableLocation[actionVariable]!, actionVariableKey, actionVariableValue)
            }
            actionVariableLocation[actionVariable] = actionVariableValue!
            break
          default:
            const exhaustiveCheck: never = action
            console.log('Invalid widget action', exhaustiveCheck)
            break
        }
        return true
      })
      .catch((e) => {
        console.error('Failed to perform action', e)
      })
    return false
  }

  return {
    performAction
  }
}
